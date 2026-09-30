#!/usr/bin/env python3
"""
PHC Pulse - synthetic data generator (India: Madhya Pradesh / Maharashtra / Kerala / Assam nodes)

Produces ~200 PHCs across 4 state nodes, 365 days of daily stock movements, footfall, beds and staff,
with state-specific seasonality and injected outbreak events.

Usage:
    pip install numpy pandas
    python generate_synthetic_data.py --out data --seed 42 --days 365

Outputs (in --out):
    phcs.csv                 static PHC master data (incl. district warehouse + km)
    warehouses.csv           state and district drug warehouses (state -> district -> PHC)
    medicines.csv            medicine master data
    daily_stock.csv          per PHC x medicine x day (dispensed, received, stock_end, ...)
    daily_ops.csv            per PHC x day (footfall, beds, staff)
    phc_distances.csv        same-state PHC pairs (road_km) for the OR-Tools optimiser
    current_snapshot.json    latest state + days_of_cover + risk_level (Q&A / explainer input)
    outbreak_events.json     ground-truth injected outbreaks (for evaluating forecasts)
    nodes/<ST>/              per-state copies (phcs, daily_stock, daily_ops) for federated simulation

NOTE: `unmet_demand_truth` is ground truth for evaluation only. A real system never
sees it, so do NOT feed it to the forecaster.
All data is synthetic. Parameters are plausible, not calibrated to real statistics.
"""
import argparse
import json
import math
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

END_DATE = date(2026, 9, 30)

# ----------------------------------------------------------------------------
# Master data
# ----------------------------------------------------------------------------
CLASSES = ["fever", "diarrhoeal", "respiratory", "chronic", "malaria", "snakebite"]

# base_per_1000 = units dispensed per 1000 catchment population per day
MEDICINES = [
    dict(medicine="Paracetamol 500mg tab", unit="tablets", disease_class="fever", base_per_1000=7.0, shelf_days=730, cold_chain=False),
    dict(medicine="ORS sachet", unit="packs", disease_class="diarrhoeal", base_per_1000=1.0, shelf_days=540, cold_chain=False),
    dict(medicine="Amoxicillin 500mg cap", unit="capsules", disease_class="respiratory", base_per_1000=3.0, shelf_days=730, cold_chain=False),
    dict(medicine="Salbutamol inhaler", unit="inhalers", disease_class="respiratory", base_per_1000=0.25, shelf_days=730, cold_chain=False),
    dict(medicine="Metformin 500mg tab", unit="tablets", disease_class="chronic", base_per_1000=4.5, shelf_days=730, cold_chain=False),
    dict(medicine="Insulin human 10ml vial", unit="vials", disease_class="chronic", base_per_1000=0.05, shelf_days=365, cold_chain=True),
    dict(medicine="Artemether-Lumefantrine tab", unit="tablets", disease_class="malaria", base_per_1000=2.0, shelf_days=730, cold_chain=False),
    dict(medicine="Anti-snake venom vial", unit="vials", disease_class="snakebite", base_per_1000=0.006, shelf_days=730, cold_chain=True),
]

# (name, lat, lon, setting, malaria_endemic)
DISTRICTS = {
    "Madhya Pradesh": [
        ("Indore", 22.72, 75.86, "urban", False),
        ("Dewas", 22.97, 76.05, "rural", False),
        ("Ujjain", 23.18, 75.78, "rural", False),
        ("Bhopal", 23.26, 77.41, "urban", False),
        ("Jabalpur", 23.18, 79.99, "urban", False),
        ("Mandla", 22.60, 80.37, "rural", True),
        ("Balaghat", 21.81, 80.19, "rural", True),
    ],
    "Maharashtra": [
        ("Pune", 18.52, 73.86, "urban", False),
        ("Nashik", 20.00, 73.79, "urban", False),
        ("Nagpur", 21.15, 79.09, "urban", False),
        ("Chhatrapati Sambhajinagar", 19.88, 75.34, "urban", False),
        ("Nandurbar", 21.37, 74.24, "rural", False),
        ("Gadchiroli", 20.18, 80.00, "rural", True),
    ],
    "Kerala": [
        ("Thiruvananthapuram", 8.52, 76.94, "urban", False),
        ("Ernakulam", 9.98, 76.28, "urban", False),
        ("Thrissur", 10.53, 76.21, "urban", False),
        ("Kozhikode", 11.25, 75.78, "urban", False),
        ("Palakkad", 10.78, 76.65, "rural", False),
        ("Wayanad", 11.69, 76.08, "rural", False),
    ],
    "Assam": [
        ("Kamrup Metropolitan", 26.14, 91.74, "urban", False),
        ("Dibrugarh", 27.47, 94.91, "urban", False),
        ("Dhemaji", 27.48, 94.58, "rural", False),
        ("Lakhimpur", 27.24, 94.10, "rural", False),
        ("Karbi Anglong", 26.00, 93.50, "rural", True),
        ("Cachar", 24.83, 92.78, "rural", True),
    ],
}
# (state, code, n_phcs, median catchment population)
STATE_META = [("Madhya Pradesh", "MP", 60, 30000), ("Maharashtra", "MH", 50, 30000),
              ("Kerala", "KL", 45, 25000), ("Assam", "AS", 45, 22000)]
STATE_CAPITAL = {"Madhya Pradesh": (23.26, 77.41), "Maharashtra": (18.97, 72.82),
                 "Kerala": (8.52, 76.94), "Assam": (26.14, 91.74)}
SUPPLY_RELIABILITY = {"Madhya Pradesh": 0.93, "Maharashtra": 0.95, "Kerala": 0.97, "Assam": 0.88}
# Kerala has a much higher chronic-disease (diabetes) load
STATE_DEMAND_FACTOR = {"Kerala": {"chronic": 1.5}, "Assam": {"snakebite": 1.0}}

# Named PHCs so the hand-made test data lines up with the generated network
ANCHORS = {
    ("Dewas", 0): "PHC Rampur", ("Indore", 0): "PHC Kanadia", ("Indore", 1): "PHC Sanwer",
    ("Indore", 2): "PHC Mhow", ("Ujjain", 0): "PHC Badnagar", ("Ujjain", 1): "PHC Khachrod",
    ("Ujjain", 2): "PHC Tarana",
}

# ----------------------------------------------------------------------------
# Seasonality: list of (peak_day_of_year, amplitude, width_days) bumps per class.
# multiplier = 1 + sum(amp * gaussian_bump)
# ----------------------------------------------------------------------------
SEASON = {
    "Madhya Pradesh": {
        "fever": [(230, 0.9, 35)],                       # monsoon vector-borne surge (Aug-Sep)
        "diarrhoeal": [(135, 0.6, 30), (220, 0.5, 30)],  # pre-monsoon heat + monsoon
        "respiratory": [(15, 0.5, 30)],                  # winter
        "malaria": [(240, 1.2, 30)],
        "snakebite": [(215, 1.5, 30)],
    },
    "Maharashtra": {
        "fever": [(225, 0.8, 35)],
        "diarrhoeal": [(140, 0.5, 30), (215, 0.4, 30)],
        "respiratory": [(20, 0.4, 30)],
        "malaria": [(235, 1.0, 30)],
        "snakebite": [(210, 1.3, 30)],
    },
    "Kerala": {  # two monsoons: south-west (Jun-Aug) and north-east (Oct-Nov)
        "fever": [(190, 1.0, 30), (300, 0.5, 25)],
        "diarrhoeal": [(200, 0.5, 30)],
        "respiratory": [(205, 0.4, 35)],
        "malaria": [(200, 0.3, 30)],
        "snakebite": [(200, 0.8, 35)],
    },
    "Assam": {  # Brahmaputra flood season (Jun-Aug)
        "fever": [(200, 0.8, 35)],
        "diarrhoeal": [(200, 0.9, 30)],
        "respiratory": [(10, 0.5, 30)],
        "malaria": [(190, 1.3, 35)],
        "snakebite": [(200, 1.8, 30)],
    },
}

DOW = np.array([1.15, 1.05, 1.0, 1.0, 0.98, 0.85, 0.45])  # Mon..Sun

# Historical outbreaks (ground truth). effects = peak multiplier per disease class.
OUTBREAKS = [
    dict(id="OB-MP-DENGUE-2026", state="Madhya Pradesh", districts=["Indore", "Dewas", "Ujjain", "Bhopal"],
         start="2026-08-10", duration=45, effects={"fever": 1.9, "diarrhoeal": 1.5}, label="Monsoon dengue surge"),
    dict(id="OB-MP-CHOLERA-2026", state="Madhya Pradesh", districts=["Mandla"],
         start="2026-07-20", duration=25, effects={"diarrhoeal": 3.0}, label="Cholera cluster"),
    dict(id="OB-MH-FLU-2026", state="Maharashtra", districts=["Nagpur", "Pune"],
         start="2026-01-10", duration=45, effects={"respiratory": 1.8}, label="Winter influenza wave"),
    dict(id="OB-MH-DENGUE-2026", state="Maharashtra", districts=["Pune", "Nashik"],
         start="2026-08-20", duration=40, effects={"fever": 1.7}, label="Monsoon dengue surge"),
    dict(id="OB-KL-LEPTO-2026", state="Kerala", districts=["Thrissur", "Kozhikode", "Ernakulam"],
         start="2026-07-05", duration=40, effects={"fever": 1.8}, label="Monsoon fever / leptospirosis surge"),
    dict(id="OB-AS-FLOOD-2026", state="Assam", districts=["Dhemaji", "Lakhimpur"],
         start="2026-06-25", duration=35, effects={"diarrhoeal": 2.2, "fever": 1.6, "snakebite": 2.5},
         label="Flood-related surge"),
]

RISK_BANDS = [(3, "Critical"), (7, "High"), (14, "Medium")]  # days_of_cover <= x


def risk_level(days_of_cover):
    for limit, label in RISK_BANDS:
        if days_of_cover <= limit:
            return label
    return "Low"


def bump(doy, peak, width):
    d = np.abs(doy - peak)
    d = np.minimum(d, 365 - d)
    return np.exp(-0.5 * (d / width) ** 2)


def season_curve(state, cls, doy):
    m = np.ones(len(doy))
    for peak, amp, width in SEASON[state].get(cls, []):
        m += amp * bump(doy, peak, width)
    return m


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def default_name(state, district, n):
    return f"PHC {district} {n:02d}"


# ----------------------------------------------------------------------------
# Build network
# ----------------------------------------------------------------------------
def build_phcs(rng):
    rows = []
    counter = 0
    for state, code, total, pop_median in STATE_META:
        dists = DISTRICTS[state]
        base, rem = divmod(total, len(dists))
        cnum = 0
        for i, (dname, lat, lon, setting, endemic) in enumerate(dists):
            wh_id = f"DW-{code}-{i + 1:02d}"
            for j in range(base + (1 if i < rem else 0)):
                counter += 1
                cnum += 1
                pop = rng.lognormal(math.log(pop_median), 0.35) * (1.2 if setting == "urban" else 1.0)
                pop = int(np.clip(pop, 5000, 60000))
                plat, plon = lat + rng.normal(0, 0.18), lon + rng.normal(0, 0.18)
                rows.append(dict(
                    phc_id=f"PHC-{code}-{cnum:03d}",
                    phc_name=ANCHORS.get((dname, j)) or default_name(state, dname, j + 1),
                    state=state, state_code=code, district=dname, setting=setting,
                    malaria_endemic=endemic,
                    lat=round(plat, 4), lon=round(plon, 4),
                    district_warehouse_id=wh_id,
                    km_to_district_warehouse=round(haversine_km(plat, plon, lat, lon) * 1.3, 1),
                    catchment_pop=pop,
                    beds_total=int(np.clip(round(pop / 5000 + rng.normal(0, 1)), 2, 12)),
                    staff_sanctioned=int(np.clip(round(pop / 6000 + 2 + rng.normal(0, 0.8)), 3, 9)),
                    attendance_base=round(float(np.clip(rng.normal(0.82, 0.07), 0.6, 0.95)), 3),
                    load_factor=round(float(rng.lognormal(0, 0.15)), 3),
                ))
    return pd.DataFrame(rows)


def build_class_multipliers(phcs, dates, doy):
    """cm[t, class, phc] = seasonal x outbreak multiplier."""
    T, P, C = len(dates), len(phcs), len(CLASSES)
    cm = np.ones((T, C, P))
    for state in phcs.state.unique():
        mask = (phcs.state == state).to_numpy()
        for ci, cls in enumerate(CLASSES):
            cm[:, ci, mask] = season_curve(state, cls, doy)[:, None] * STATE_DEMAND_FACTOR.get(state, {}).get(cls, 1.0)

    start = dates[0]
    for ev in OUTBREAKS:
        t0 = (date.fromisoformat(ev["start"]) - start).days
        dur = ev["duration"]
        rise = max(1, int(dur * 0.35))
        shape = np.zeros(T)
        for k in range(dur):
            idx = t0 + k
            if 0 <= idx < T:
                shape[idx] = k / rise if k < rise else 1 - (k - rise) / max(1, dur - rise)
        shape = np.clip(shape, 0, 1)
        mask = ((phcs.state == ev["state"]) & (phcs.district.isin(ev["districts"]))).to_numpy()
        for cls, peak in ev["effects"].items():
            ci = CLASSES.index(cls)
            cm[:, ci, mask] *= (1 + (peak - 1) * shape)[:, None]
    return cm


def build_pairs(phcs, rng):
    med = pd.DataFrame(MEDICINES)
    rows = []
    for pi, p in phcs.iterrows():
        for mi, m in med.iterrows():
            if m.disease_class == "malaria" and not p.malaria_endemic:
                continue
            if m.disease_class == "snakebite" and p.setting == "urban":
                continue
            rows.append((pi, mi))
    pair = pd.DataFrame(rows, columns=["phc_idx", "med_idx"])
    N = len(pair)
    pair["class_idx"] = [CLASSES.index(med.loc[i, "disease_class"]) for i in pair.med_idx]
    pair["profile"] = rng.choice(["balanced", "short", "surplus"], size=N, p=[0.70, 0.12, 0.18])
    cover = {"balanced": (18, 32), "short": (6, 10), "surplus": (55, 90)}
    pair["cover_days"] = [rng.uniform(*cover[pr]) for pr in pair.profile]
    pair["cycle"] = 14
    pair["offset"] = rng.integers(0, 14, size=N)
    pair["lead"] = rng.integers(2, 6, size=N)
    pair["pair_factor"] = rng.lognormal(0, 0.15, size=N)
    return pair, med


# ----------------------------------------------------------------------------
# Simulation
# ----------------------------------------------------------------------------
def simulate(phcs, pair, med, dates, cm, rng):
    T, N, K = len(dates), len(pair), 8.0
    pidx, midx, cidx = pair.phc_idx.to_numpy(), pair.med_idx.to_numpy(), pair.class_idx.to_numpy()
    pop = phcs.catchment_pop.to_numpy()[pidx]
    base = med.base_per_1000.to_numpy()[midx]
    dow = np.array([DOW[d.weekday()] for d in dates])

    # expected demand [T, N]
    expected = np.empty((T, N))
    for t in range(T):
        expected[t] = base * pop / 1000.0 * cm[t, cidx, pidx] * dow[t] * pair.pair_factor.to_numpy()

    # district supply shocks: windows where deliveries often fail
    districts = phcs.district.to_numpy()[pidx]
    uniq = sorted(set(districts))
    sup = {d: np.ones(T) for d in uniq}
    for d in uniq:
        for _ in range(int(rng.integers(2, 4))):
            s = int(rng.integers(0, max(1, T - 20)))
            sup[d][s:s + int(rng.integers(8, 15))] = 0.5
    sup_factor = np.stack([sup[d] for d in districts], axis=1)  # [T, N]

    rel = np.array([SUPPLY_RELIABILITY[c] for c in phcs.state.to_numpy()[pidx]])
    cover = pair.cover_days.to_numpy()
    cycle, offset, lead = pair.cycle.to_numpy(), pair.offset.to_numpy(), pair.lead.to_numpy()

    stock = np.round(cover * expected[0] * rng.uniform(0.6, 1.1, N)).astype(np.int64)
    on_order = np.zeros(N, dtype=np.int64)
    pending = np.zeros((T + 8, N), dtype=np.int64)
    demand_h = np.zeros((T, N), dtype=np.int64)
    disp_h = np.zeros((T, N), dtype=np.int64)
    unmet_h = np.zeros((T, N), dtype=np.int64)
    recv_h = np.zeros((T, N), dtype=np.int64)
    stock_h = np.zeros((T, N), dtype=np.int64)
    idx_all = np.arange(N)

    for t in range(T):
        arr = pending[t]
        stock += arr
        on_order -= arr
        recv_h[t] = arr

        demand = rng.poisson(expected[t] * rng.gamma(K, 1 / K, N))
        disp = np.minimum(stock, demand)
        stock -= disp
        demand_h[t], disp_h[t], unmet_h[t], stock_h[t] = demand, disp, demand - disp, stock

        due = ((t + offset) % cycle) == 0
        if due.any():
            est = demand_h[max(0, t - 13):t + 1].mean(axis=0)  # requests incl. unmet, avoids stock-out death spiral
            order = np.maximum(0, cover * est - stock - on_order)
            ok = rng.random(N) < rel * sup_factor[t]
            frac = np.where(rng.random(N) < 0.8, 1.0, rng.uniform(0.6, 0.95, N))
            qty = np.where(due & ok, np.ceil(order * frac), 0).astype(np.int64)
            sel = qty > 0
            if sel.any():
                np.add.at(pending, (t + lead[sel], idx_all[sel]), qty[sel])
                on_order[sel] += qty[sel]

    return dict(demand=demand_h, dispensed=disp_h, unmet=unmet_h, received=recv_h, stock=stock_h)


def simulate_ops(phcs, cm, dates, rng):
    T, P = len(dates), len(phcs)
    dow = np.array([DOW[d.weekday()] for d in dates])[:, None]
    load = (cm[:, CLASSES.index("fever")] + cm[:, CLASSES.index("diarrhoeal")]
            + cm[:, CLASSES.index("respiratory")]) / 3.0  # [T, P]
    pop = phcs.catchment_pop.to_numpy()[None, :]
    lf = phcs.load_factor.to_numpy()[None, :]
    footfall = rng.poisson(pop * 0.006 * load * dow * lf * rng.gamma(20, 1 / 20, (T, P)))
    beds_total = phcs.beds_total.to_numpy()[None, :]
    occupied = np.minimum(beds_total, rng.poisson(beds_total * 0.4 * load))
    beds_avail = beds_total - occupied
    sanc = phcs.staff_sanctioned.to_numpy()[None, :]
    p_att = np.clip(phcs.attendance_base.to_numpy()[None, :] - 0.06 * (load - 1), 0.4, 0.98)
    staff = rng.binomial(np.broadcast_to(sanc, (T, P)), p_att)
    return footfall, beds_avail, staff


# ----------------------------------------------------------------------------
# Scenario helper (use in the backend for the "Trigger outbreak" button)
# ----------------------------------------------------------------------------
def apply_outbreak_scenario(records, disease_class, multiplier, districts=None, state=None):
    """Return new records with daily_demand scaled and days_of_cover / risk recomputed."""
    out = []
    for r in records:
        r = dict(r)
        hit = (r["disease_class"] == disease_class
               and (districts is None or r["district"] in districts)
               and (state is None or r["state"] == state))
        if hit:
            r["daily_demand"] = round(r["daily_demand"] * multiplier, 2)
            r["days_of_cover"] = round(r["stock"] / max(r["daily_demand"], 1e-6), 1)
            r["risk_level"] = risk_level(r["days_of_cover"])
            r["scenario_applied"] = f"{disease_class} x{multiplier}"
        out.append(r)
    return out


# ----------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--days", type=int, default=365)
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    dates = [END_DATE - timedelta(days=args.days - 1 - i) for i in range(args.days)]
    doy = np.array([d.timetuple().tm_yday for d in dates])
    T = len(dates)

    phcs = build_phcs(rng)
    cm = build_class_multipliers(phcs, dates, doy)
    pair, med = build_pairs(phcs, rng)
    sim = simulate(phcs, pair, med, dates, cm, rng)
    footfall, beds, staff = simulate_ops(phcs, cm, dates, rng)

    N, P = len(pair), len(phcs)
    date_str = np.array([d.isoformat() for d in dates])
    phc_id_pair = phcs.phc_id.to_numpy()[pair.phc_idx.to_numpy()]
    med_pair = med.medicine.to_numpy()[pair.med_idx.to_numpy()]

    stock_df = pd.DataFrame({
        "date": np.repeat(date_str, N),
        "phc_id": np.tile(phc_id_pair, T),
        "medicine": np.tile(med_pair, T),
        "dispensed": sim["dispensed"].ravel(),
        "received": sim["received"].ravel(),
        "stock_end": sim["stock"].ravel(),
        "stockout_flag": (sim["stock"].ravel() == 0).astype(int),
        "unmet_demand_truth": sim["unmet"].ravel(),
    })
    ops_df = pd.DataFrame({
        "date": np.repeat(date_str, P),
        "phc_id": np.tile(phcs.phc_id.to_numpy(), T),
        "footfall": footfall.ravel(),
        "beds_available": beds.ravel(),
        "staff_present": staff.ravel(),
    })

    wrows = []
    for st, code, _, _ in STATE_META:
        wrows.append(dict(warehouse_id=f"SW-{code}", level="state", state=st, district="",
                          lat=STATE_CAPITAL[st][0], lon=STATE_CAPITAL[st][1]))
        for i, (dname, lat, lon, _, _) in enumerate(DISTRICTS[st]):
            wrows.append(dict(warehouse_id=f"DW-{code}-{i + 1:02d}", level="district", state=st,
                              district=dname, lat=lat, lon=lon))
    pd.DataFrame(wrows).to_csv(out / "warehouses.csv", index=False)

    phcs.to_csv(out / "phcs.csv", index=False)
    med.to_csv(out / "medicines.csv", index=False)
    stock_df.to_csv(out / "daily_stock.csv", index=False)
    ops_df.to_csv(out / "daily_ops.csv", index=False)

    # distances (same state only)
    drows = []
    for code, grp in phcs.groupby("state_code"):
        g = grp.reset_index(drop=True)
        for a in range(len(g)):
            for b in range(len(g)):
                if a != b:
                    km = haversine_km(g.lat[a], g.lon[a], g.lat[b], g.lon[b]) * 1.3
                    drows.append((g.phc_id[a], g.phc_id[b], round(km, 1)))
    pd.DataFrame(drows, columns=["from_phc_id", "to_phc_id", "road_km"]).to_csv(out / "phc_distances.csv", index=False)

    # per-state nodes for the federated simulation
    for code in phcs.state_code.unique():
        nd = out / "nodes" / code
        nd.mkdir(parents=True, exist_ok=True)
        ids = set(phcs[phcs.state_code == code].phc_id)
        phcs[phcs.state_code == code].to_csv(nd / "phcs.csv", index=False)
        stock_df[stock_df.phc_id.isin(ids)].to_csv(nd / "daily_stock.csv", index=False)
        ops_df[ops_df.phc_id.isin(ids)].to_csv(nd / "daily_ops.csv", index=False)

    # current snapshot
    est = sim["demand"][-14:].mean(axis=0)
    last_stock = sim["stock"][-1]
    records = []
    for n in range(N):
        p = phcs.iloc[pair.phc_idx[n]]
        m = med.iloc[pair.med_idx[n]]
        daily = float(est[n])
        if daily < 0.02:
            continue
        doc = round(float(last_stock[n]) / daily, 1)
        frac = rng.uniform(0.04, 0.35) if pair.profile[n] == "surplus" else rng.uniform(0.3, 1.0)
        exp_date = END_DATE + timedelta(days=int(frac * m.shelf_days))
        pi = pair.phc_idx[n]
        records.append(dict(
            phc_id=p.phc_id, phc_name=p.phc_name, state=p.state, district=p.district,
            medicine=m.medicine, disease_class=m.disease_class, stock=int(last_stock[n]), unit=m.unit,
            daily_demand=round(daily, 2), days_of_cover=doc, risk_level=risk_level(doc),
            nearest_expiry=exp_date.isoformat(), cold_chain=bool(m.cold_chain),
            beds_available=int(beds[-1, pi]), staff_present=int(staff[-1, pi]),
            staff_sanctioned=int(p.staff_sanctioned),
        ))
    with open(out / "current_snapshot.json", "w") as f:
        json.dump({"as_of": END_DATE.isoformat(), "records": records}, f, indent=1)
    with open(out / "outbreak_events.json", "w") as f:
        json.dump(OUTBREAKS, f, indent=1)

    # summary
    snap = pd.DataFrame(records)
    print(f"PHCs: {P} ({phcs.groupby('state_code').size().to_dict()})")
    print(f"PHC x medicine pairs: {N}; daily_stock rows: {len(stock_df):,}")
    print(f"Stock-out days (share of pair-days): {stock_df.stockout_flag.mean():.1%}")
    print("Snapshot risk mix:", snap.risk_level.value_counts().to_dict())
    near = snap[(snap.days_of_cover > 45) & (pd.to_datetime(snap.nearest_expiry) < pd.Timestamp(END_DATE) + pd.Timedelta(days=90))]
    print(f"Surplus + near-expiry candidates (transfer sources): {len(near)}")
    print(f"Written to: {out.resolve()}")


if __name__ == "__main__":
    main()
