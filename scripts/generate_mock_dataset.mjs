import fs from 'fs';
import path from 'path';

// Seeded pseudorandom generator for deterministic results (seed = 42)
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

function randNormal(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * std + mean;
}

function randLognormal(meanLog, stdLog) {
  return Math.exp(randNormal(meanLog, stdLog));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const r = 6371.0;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

// Master metadata matching generate_synthetic_data.py
const MEDICINES = [
  { medicine: "Paracetamol 500mg tab", unit: "tablets", disease_class: "fever_vector", base_per_1000: 7.0, shelf_days: 730, cold_chain: false },
  { medicine: "ORS sachet", unit: "packs", disease_class: "diarrhoeal", base_per_1000: 1.0, shelf_days: 540, cold_chain: false },
  { medicine: "Amoxicillin 500mg cap", unit: "capsules", disease_class: "respiratory", base_per_1000: 3.0, shelf_days: 730, cold_chain: false },
  { medicine: "Salbutamol inhaler", unit: "inhalers", disease_class: "respiratory", base_per_1000: 0.25, shelf_days: 730, cold_chain: false },
  { medicine: "Metformin 500mg tab", unit: "tablets", disease_class: "chronic_metabolic", base_per_1000: 4.5, shelf_days: 730, cold_chain: false },
  { medicine: "Insulin Human NPH 10ml", unit: "vials", disease_class: "chronic_metabolic", base_per_1000: 0.05, shelf_days: 365, cold_chain: true },
  { medicine: "Artemether + Lumefantrine 20/120 tab", unit: "packs", disease_class: "fever_vector", base_per_1000: 2.0, shelf_days: 730, cold_chain: false },
  { medicine: "Anti-snake venom vial", unit: "vials", disease_class: "emergency_trauma", base_per_1000: 0.006, shelf_days: 730, cold_chain: true },
  { medicine: "Dextrose 5% 500ml IV", unit: "bottles", disease_class: "emergency_trauma", base_per_1000: 0.8, shelf_days: 730, cold_chain: false },
];

const DISTRICTS = {
  "Madhya Pradesh": [
    { name: "Indore", lat: 22.72, lon: 75.86, setting: "urban", endemic: false },
    { name: "Dewas", lat: 22.97, lon: 76.05, setting: "rural", endemic: false },
    { name: "Ujjain", lat: 23.18, lon: 75.78, setting: "rural", endemic: false },
    { name: "Bhopal", lat: 23.26, lon: 77.41, setting: "urban", endemic: false },
    { name: "Jabalpur", lat: 23.18, lon: 79.99, setting: "urban", endemic: false },
    { name: "Mandla", lat: 22.60, lon: 80.37, setting: "rural", endemic: true },
    { name: "Balaghat", lat: 21.81, lon: 80.19, setting: "rural", endemic: true },
  ],
  "Maharashtra": [
    { name: "Pune", lat: 18.52, lon: 73.86, setting: "urban", endemic: false },
    { name: "Nashik", lat: 20.00, lon: 73.79, setting: "urban", endemic: false },
    { name: "Nagpur", lat: 21.15, lon: 79.09, setting: "urban", endemic: false },
    { name: "Chhatrapati Sambhajinagar", lat: 19.88, lon: 75.34, setting: "urban", endemic: false },
    { name: "Nandurbar", lat: 21.37, lon: 74.24, setting: "rural", endemic: false },
    { name: "Satara", lat: 17.68, lon: 74.00, setting: "rural", endemic: false },
    { name: "Gadchiroli", lat: 20.18, lon: 80.00, setting: "rural", endemic: true },
  ],
  "Kerala": [
    { name: "Thiruvananthapuram", lat: 8.52, lon: 76.94, setting: "urban", endemic: false },
    { name: "Ernakulam", lat: 9.98, lon: 76.28, setting: "urban", endemic: false },
    { name: "Thrissur", lat: 10.53, lon: 76.21, setting: "urban", endemic: false },
    { name: "Kozhikode", lat: 11.25, lon: 75.78, setting: "urban", endemic: false },
    { name: "Palakkad", lat: 10.78, lon: 76.65, setting: "rural", endemic: false },
    { name: "Wayanad", lat: 11.69, lon: 76.08, setting: "rural", endemic: false },
  ],
  "Assam": [
    { name: "Kamrup", lat: 26.14, lon: 91.74, setting: "urban", endemic: false },
    { name: "Dibrugarh", lat: 27.47, lon: 94.91, setting: "urban", endemic: false },
    { name: "Dhemaji", lat: 27.48, lon: 94.58, setting: "rural", endemic: false },
    { name: "Lakhimpur", lat: 27.24, lon: 94.10, setting: "rural", endemic: false },
    { name: "Karbi Anglong", lat: 26.00, lon: 93.50, setting: "rural", endemic: true },
    { name: "Cachar", lat: 24.83, lon: 92.78, setting: "rural", endemic: true },
  ],
};

const ANCHORS = {
  "Dewas_0": "PHC Rampur",
  "Dewas_1": "PHC Bagli",
  "Indore_0": "PHC Kanadia",
  "Indore_1": "PHC Sanwer",
  "Indore_2": "PHC Mhow",
  "Ujjain_0": "PHC Badnagar",
  "Ujjain_1": "PHC Khachrod",
  "Ujjain_2": "PHC Tarana",
  "Mandla_0": "PHC Bichhiya",
  "Pune_0": "PHC Khed",
  "Pune_1": "PHC Junnar",
  "Satara_0": "PHC Karad Rural",
  "Satara_1": "PHC Wai",
  "Wayanad_0": "PHC Meppadi",
  "Wayanad_1": "PHC Sultan Bathery",
  "Thiruvananthapuram_0": "PHC Vithura",
  "Thiruvananthapuram_1": "PHC Nedumangad",
  "Kamrup_0": "PHC Hajo",
  "Kamrup_1": "PHC Boko",
  "Cachar_0": "PHC Lakhipur",
  "Cachar_1": "PHC Dholai",
  "Dhemaji_0": "PHC Silapathar",
  "Dhemaji_1": "PHC Jonai",
};

const STATE_META = [
  { state: "Madhya Pradesh", code: "MP", total: 60, popMedian: 30000 },
  { state: "Maharashtra", code: "MH", total: 50, popMedian: 30000 },
  { state: "Kerala", code: "KL", total: 45, popMedian: 25000 },
  { state: "Assam", code: "AS", total: 45, popMedian: 22000 },
];

function generateDataset() {
  const phcs = [];
  let globalPhcCounter = 0;

  for (const sm of STATE_META) {
    const distList = DISTRICTS[sm.state];
    const baseCount = Math.floor(sm.total / distList.length);
    const remCount = sm.total % distList.length;

    let statePhcIndex = 0;
    for (let dIdx = 0; dIdx < distList.length; dIdx++) {
      const dist = distList[dIdx];
      const countForDist = baseCount + (dIdx < remCount ? 1 : 0);
      const whId = `DW-${sm.code}-${String(dIdx + 1).padStart(2, "0")}`;

      for (let j = 0; j < countForDist; j++) {
        globalPhcCounter++;
        statePhcIndex++;
        const phcId = `PHC-${sm.code}-${String(statePhcIndex).padStart(3, "0")}`;

        const anchorKey = `${dist.name}_${j}`;
        const phcName = ANCHORS[anchorKey] || `PHC ${dist.name} ${String(j + 1).padStart(2, "0")}`;

        const plat = dist.lat + randNormal(0, 0.12);
        const plon = dist.lon + randNormal(0, 0.12);
        const km = Math.round(haversineKm(plat, plon, dist.lat, dist.lon) * 1.3 * 10) / 10;

        let phcType = "Rural PHC";
        if (dist.endemic) phcType = "Tribal PHC";
        else if (dist.setting === "urban") phcType = "Urban PHC";
        else if (j === 0) phcType = "Community Health Centre";
        else if (dist.name === "Dhemaji") phcType = "Flood-Prone PHC";

        const bedsTotal = Math.max(4, Math.min(14, Math.round(randNormal(8, 2))));
        const staffSanctioned = Math.max(3, Math.min(10, Math.round(randNormal(6, 1.5))));

        phcs.push({
          phc_id: phcId,
          phc_name: phcName,
          state: sm.state,
          state_code: sm.code,
          district: dist.name,
          lat: Number(plat.toFixed(4)),
          lon: Number(plon.toFixed(4)),
          district_warehouse_id: whId,
          km_to_district_warehouse: km,
          total_beds: bedsTotal,
          staff_sanctioned: staffSanctioned,
          type: phcType,
        });
      }
    }
  }

  // Generate Inventory Snapshot Records for each PHC
  const snapshotRecords = [];
  const END_DATE = new Date("2026-09-30");

  for (const phc of phcs) {
    // Current beds and staff
    const staffPresent = Math.max(1, Math.min(phc.staff_sanctioned, Math.round(phc.staff_sanctioned * randNormal(0.85, 0.1))));
    const bedsAvailable = Math.max(1, Math.min(phc.total_beds, Math.round(phc.total_beds * randNormal(0.55, 0.15))));

    // Select 5-7 medicines for each PHC
    for (const med of MEDICINES) {
      // Base daily demand
      let daily = med.base_per_1000 * 20; // ~20k pop
      if (phc.state === "Kerala" && med.disease_class === "chronic_metabolic") daily *= 1.5;
      if (phc.state === "Assam" && med.disease_class === "emergency_trauma") daily *= 2.0;

      daily = Math.max(0.5, Math.round(daily * randNormal(1.0, 0.2) * 10) / 10);

      // Determine stock situation
      // Anchor known criticals
      let doc = 15;
      let stock = 0;
      let risk = "Low";

      if (
        (phc.phc_name === "PHC Rampur" && med.medicine.includes("Paracetamol")) ||
        (phc.phc_name === "PHC Rampur" && med.medicine.includes("ORS")) ||
        (phc.phc_name === "PHC Silapathar" && med.medicine.includes("Anti-snake")) ||
        (phc.phc_name === "PHC Meppadi" && med.medicine.includes("Insulin")) ||
        (phc.phc_name === "PHC Karad Rural" && med.medicine.includes("Paracetamol")) ||
        (rng() < 0.08) // 8% realistic critical stockout rate across rural India
      ) {
        doc = Math.round(randNormal(2.4, 0.5) * 10) / 10;
        if (doc < 0.8) doc = 1.2;
        stock = Math.round(daily * doc);
        risk = "Critical";
      } else if (
        (phc.phc_name === "PHC Kanadia" && med.medicine.includes("Paracetamol")) ||
        (phc.phc_name === "PHC Sultan Bathery" && med.medicine.includes("Insulin")) ||
        (phc.phc_name === "PHC Junnar" && med.medicine.includes("Amoxicillin")) ||
        (phc.phc_name === "PHC Hajo" && med.medicine.includes("Anti-snake")) ||
        (rng() < 0.12) // surplus near expiry
      ) {
        doc = Math.round(randNormal(55, 10) * 10) / 10;
        stock = Math.round(daily * doc);
        risk = "Low";
      } else {
        doc = Math.round(randNormal(18, 8) * 10) / 10;
        stock = Math.max(10, Math.round(daily * doc));
        if (doc <= 3) risk = "Critical";
        else if (doc <= 7) risk = "High";
        else if (doc <= 14) risk = "Medium";
        else risk = "Low";
      }

      // Expiry date
      let daysToExpiry = Math.round(randNormal(400, 100));
      if (phc.phc_name === "PHC Kanadia" || rng() < 0.15) {
        daysToExpiry = Math.round(randNormal(65, 15)); // <90 days near expiry surplus!
      }
      const expDate = new Date(END_DATE);
      expDate.setDate(expDate.getDate() + Math.max(30, daysToExpiry));

      snapshotRecords.push({
        phc_id: phc.phc_id,
        phc_name: phc.phc_name,
        state: phc.state,
        district: phc.district,
        medicine: med.medicine,
        disease_class: med.disease_class,
        stock: stock,
        unit: med.unit,
        daily_demand: daily,
        days_of_cover: doc,
        risk_level: risk,
        nearest_expiry: expDate.toISOString().slice(0, 10),
        cold_chain: med.cold_chain,
        beds_available: bedsAvailable,
        total_beds: phc.total_beds,
        staff_present: staffPresent,
        staff_sanctioned: phc.staff_sanctioned,
      });
    }
  }

  const outDir = path.resolve("./data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Save current_snapshot.json
  const snapshotData = {
    as_of: "2026-09-30",
    total_phcs: phcs.length,
    records: snapshotRecords,
  };
  fs.writeFileSync(path.join(outDir, "current_snapshot.json"), JSON.stringify(snapshotData, null, 2));

  // Save phcs.json
  fs.writeFileSync(path.join(outDir, "phcs.json"), JSON.stringify(phcs, null, 2));

  console.log(`Generated ${phcs.length} PHCs across 4 state nodes.`);
  console.log(`Generated ${snapshotRecords.length} snapshot medicine records in data/current_snapshot.json.`);
}

generateDataset();
