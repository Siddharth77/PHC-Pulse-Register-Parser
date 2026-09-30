import { LanguageCode } from './config';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  live: string;
  lastUpdated: string;
  scenarioActive: string;
  demoMode: string;
  resetDemo: string;
  roles: {
    phc_staff: string;
    district_officer: string;
    state_national_officer: string;
  };
  roleDescriptions: {
    phc_staff: string;
    district_officer: string;
    state_national_officer: string;
  };
  nav: {
    dashboard: string;
    alerts: string;
    redistribution: string;
    ask: string;
    report: string;
    federated: string;
    about: string;
  };
  kpi: {
    reportingToday: string;
    criticalStockouts: string;
    expiringSurplus: string;
    bedsAvailable: string;
    staffPresent: string;
    facilities: string;
    itemsAtRisk: string;
    batchesSurplus: string;
    availableOfTotal: string;
    onDutySanctioned: string;
  };
  filters: {
    title: string;
    state: string;
    allStates: string;
    district: string;
    allDistricts: string;
    medicine: string;
    allMedicines: string;
    diseaseClass: string;
    allClasses: string;
    riskLevel: string;
    allRisks: string;
    reset: string;
    activeFilters: string;
  };
  table: {
    title: string;
    subtitle: string;
    phc: string;
    district: string;
    medicine: string;
    stock: string;
    dailyDemand: string;
    daysOfCover: string;
    risk: string;
    nearestExpiry: string;
    action: string;
    findSurplus: string;
    draftAlert: string;
    emptyMessage: string;
  };
  map: {
    title: string;
    subtitle: string;
    zoomHint: string;
    allIndia: string;
    legendCritical: string;
    legendHigh: string;
    legendMedium: string;
    legendLow: string;
    selectedPhc: string;
    bedsVacant: string;
    staffDuty: string;
    medicinesTracked: string;
    coldChain: string;
    normalStorage: string;
  };
  charts: {
    title: string;
    subtitle: string;
    actualStock: string;
    forecastDemand: string;
    confidenceBand: string;
    threshold: string;
    daysHistory: string;
    daysForecast: string;
  };
  risks: {
    Critical: string;
    High: string;
    Medium: string;
    Low: string;
  };
  diseaseClasses: {
    fever_vector: string;
    diarrhoeal: string;
    respiratory: string;
    chronic_metabolic: string;
    emergency_trauma: string;
  };
  footer: {
    disclaimer: string;
    syntheticNote: string;
    sovereigntyNote: string;
  };
  common: {
    loading: string;
    retry: string;
    error: string;
    viewDetails: string;
    close: string;
    days: string;
    units: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "PHC Pulse",
    tagline: "India Public Health Supply Chain Co-Pilot",
    live: "LIVE",
    lastUpdated: "Updated 2 min ago",
    scenarioActive: "Scenario Active",
    demoMode: "Storyline Demo",
    resetDemo: "Reset Demo",
    roles: {
      phc_staff: "PHC Staff (ANM / Pharmacist)",
      district_officer: "District Health Officer",
      state_national_officer: "State / National Officer",
    },
    roleDescriptions: {
      phc_staff: "Phone-first reporting for local PHC stock, beds and attendance.",
      district_officer: "Monitors district-wide facilities and approves inter-facility transfers.",
      state_national_officer: "Full visibility across MP, MH, KL & AS with federated learning & outbreak simulations.",
    },
    nav: {
      dashboard: "Command Dashboard",
      alerts: "Emergency Alerts",
      redistribution: "Redistribution Planner",
      ask: "Ask PHC Pulse",
      report: "Report Stock",
      federated: "Federated Network",
      about: "About & Architecture",
    },
    kpi: {
      reportingToday: "PHCs Reporting Today",
      criticalStockouts: "Critical Stock-Outs",
      expiringSurplus: "Expiring Surplus (90d)",
      bedsAvailable: "Beds Available",
      staffPresent: "Staff On Duty",
      facilities: "PHCs reporting",
      itemsAtRisk: "meds with ≤ 3d cover",
      batchesSurplus: "batches at expiry risk",
      availableOfTotal: "free general/maternity beds",
      onDutySanctioned: "staff present today",
    },
    filters: {
      title: "Supply Filters",
      state: "State",
      allStates: "All 4 States",
      district: "District",
      allDistricts: "All Districts",
      medicine: "Medicine",
      allMedicines: "All Medicines",
      diseaseClass: "Disease Class",
      allClasses: "All Disease Classes",
      riskLevel: "Risk Level",
      allRisks: "All Risk Levels",
      reset: "Reset Filters",
      activeFilters: "active filters",
    },
    table: {
      title: "Will Run Out Soon",
      subtitle: "Top 10 facilities facing acute stockout risk sorted by days of cover",
      phc: "PHC Facility",
      district: "District / State",
      medicine: "Medicine",
      stock: "Stock",
      dailyDemand: "Daily Burn",
      daysOfCover: "Days of Cover",
      risk: "Risk Level",
      nearestExpiry: "Nearest Expiry",
      action: "Actions",
      findSurplus: "Find Surplus",
      draftAlert: "Draft Alert",
      emptyMessage: "No facilities found matching the selected filter criteria.",
    },
    map: {
      title: "National Public Health Map",
      subtitle: "Primary Health Centres color-coded by worst stockout risk",
      zoomHint: "Select a state to zoom and inspect district-level facilities",
      allIndia: "All 4 State Nodes",
      legendCritical: "Critical (≤ 3d)",
      legendHigh: "High (4–7d)",
      legendMedium: "Medium (8–14d)",
      legendLow: "Low (> 14d)",
      selectedPhc: "Facility Details",
      bedsVacant: "Available Beds",
      staffDuty: "Staff On Duty",
      medicinesTracked: "Essential Medicines Inventory",
      coldChain: "Cold Chain (2°C–8°C)",
      normalStorage: "Ambient Storage",
    },
    charts: {
      title: "30-Day Footfall & Demand Forecast",
      subtitle: "Historical stock consumption and ARIMA+ projected demand curve with 95% confidence band",
      actualStock: "Historical Stock",
      forecastDemand: "Projected Consumption",
      confidenceBand: "95% Confidence Band",
      threshold: "Critical Stockout Threshold",
      daysHistory: "Past 30 Days",
      daysForecast: "Next 14 Days",
    },
    risks: {
      Critical: "Critical (≤ 3d)",
      High: "High (4–7d)",
      Medium: "Medium (8–14d)",
      Low: "Low (> 14d)",
    },
    diseaseClasses: {
      fever_vector: "Fever & Vector-Borne (Dengue, Malaria)",
      diarrhoeal: "Diarrhoeal & Enteric (ORS, Zinc)",
      respiratory: "Respiratory & Antibiotics (Amox, Azithro)",
      chronic_metabolic: "Chronic & Diabetes (Insulin, Metformin)",
      emergency_trauma: "Emergency & Trauma (Anti-Snake Venom, Dextrose)",
    },
    footer: {
      disclaimer: "PHC Pulse: Built for the Google Cloud Hackathon 'Build with AI: Code for Communities' (Solving for India).",
      syntheticNote: "Demo uses synthetic data generated across 200 PHCs in Madhya Pradesh, Maharashtra, Kerala, and Assam.",
      sovereigntyNote: "Data Sovereignty Architecture: Patient records stay inside state nodes; only encrypted model gradients are shared.",
    },
    common: {
      loading: "Loading supply chain data...",
      retry: "Retry",
      error: "Unable to load data. Please retry.",
      viewDetails: "View Details",
      close: "Close",
      days: "days",
      units: "units",
    },
  },

  hi: {
    appName: "पीएचसी पल्स",
    tagline: "भारत का सार्वजनिक स्वास्थ्य आपूर्ति श्रृंखला सह-पायलट",
    live: "लाइव",
    lastUpdated: "2 मिनट पहले अपडेट किया गया",
    scenarioActive: "परिदृश्य सक्रिय",
    demoMode: "डेमो स्टोरीलाइन",
    resetDemo: "डेमो रीसेट करें",
    roles: {
      phc_staff: "पीएचसी स्टाफ (एएनएम / फार्मासिस्ट)",
      district_officer: "जिला स्वास्थ्य अधिकारी",
      state_national_officer: "राज्य / राष्ट्रीय अधिकारी",
    },
    roleDescriptions: {
      phc_staff: "स्थानीय पीएचसी स्टॉक, बेड और उपस्थिति के लिए मोबाइल-आधारित रिपोर्टिंग।",
      district_officer: "जिले की सुविधाओं की निगरानी और अंतर-सुविधा स्टॉक ट्रांसफर की मंजूरी।",
      state_national_officer: "एमपी, महाराष्ट्र, केरल और असम में पूर्ण दृश्यता, आउटब्रेक सिमुलेशन और फेडेरेटेड मॉडल।",
    },
    nav: {
      dashboard: "कमांड डैशबोर्ड",
      alerts: "आपातकालीन अलर्ट",
      redistribution: "पुनर्वितरण योजनाकार",
      ask: "पीएचसी पल्स से पूछें",
      report: "स्टॉक रिपोर्ट करें",
      federated: "फेडेरेटेड नेटवर्क",
      about: "वास्तुकला और परिचय",
    },
    kpi: {
      reportingToday: "आज रिपोर्ट करने वाले पीएचसी",
      criticalStockouts: "गंभीर स्टॉक कमी (क्रिटिकल)",
      expiringSurplus: "90 दिनों में समाप्त होने वाला स्टॉक",
      bedsAvailable: "उपलब्ध बेड",
      staffPresent: "ड्यूटी पर मौजूद स्टाफ",
      facilities: "पीएचसी रिपोर्ट कर रहे हैं",
      itemsAtRisk: "दवाएं जिनमें ≤ 3 दिन का स्टॉक है",
      batchesSurplus: "अधिशेष बैच जोखिम में",
      availableOfTotal: "खाली जनरल/प्रसूति बेड",
      onDutySanctioned: "आज उपस्थित कर्मचारी",
    },
    filters: {
      title: "आपूर्ति फिल्टर",
      state: "राज्य",
      allStates: "सभी 4 राज्य",
      district: "ज़िला",
      allDistricts: "सभी ज़िले",
      medicine: "दवा",
      allMedicines: "सभी दवाएं",
      diseaseClass: "रोग श्रेणी",
      allClasses: "सभी रोग श्रेणियां",
      riskLevel: "जोखिम स्तर",
      allRisks: "सभी जोखिम स्तर",
      reset: "फिल्टर रीसेट करें",
      activeFilters: "सक्रिय फिल्टर",
    },
    table: {
      title: "शीघ्र समाप्त होने वाली दवाएं",
      subtitle: "स्टॉक दिनों के आधार पर क्रमबद्ध गंभीर कमी का सामना करने वाले शीर्ष 10 केंद्र",
      phc: "पीएचसी केंद्र",
      district: "ज़िला / राज्य",
      medicine: "दवा का नाम",
      stock: "वर्तमान स्टॉक",
      dailyDemand: "दैनिक खपत",
      daysOfCover: "स्टॉक के दिन (कवर)",
      risk: "जोखिम स्तर",
      nearestExpiry: "निकटतम समाप्ति तिथि",
      action: "कार्रवाई",
      findSurplus: "अधिशेष खोजें",
      draftAlert: "अलर्ट तैयार करें",
      emptyMessage: "चयनित फिल्टर से मेल खाने वाला कोई केंद्र नहीं मिला।",
    },
    map: {
      title: "राष्ट्रीय सार्वजनिक स्वास्थ्य मानचित्र",
      subtitle: "गंभीर स्टॉकआउट जोखिम द्वारा रंग-कोडित प्राथमिक स्वास्थ्य केंद्र",
      zoomHint: "ज़िले-वार केंद्रों को देखने के लिए किसी राज्य पर क्लिक करें",
      allIndia: "सभी 4 राज्य नोड्स",
      legendCritical: "गंभीर (≤ 3 दिन)",
      legendHigh: "उच्च (4–7 दिन)",
      legendMedium: "मध्यम (8–14 दिन)",
      legendLow: "सुरक्षित (> 14 दिन)",
      selectedPhc: "केंद्र का विवरण",
      bedsVacant: "उपलब्ध बेड",
      staffDuty: "ड्यूटी पर स्टाफ",
      medicinesTracked: "आवश्यक दवाओं की सूची",
      coldChain: "कोल्ड चेन (2°C–8°C)",
      normalStorage: "सामान्य भंडारण",
    },
    charts: {
      title: "30-दिवसीय फुटफॉल और मांग पूर्वानुमान",
      subtitle: "ऐतिहासिक खपत और 95% विश्वास अंतराल के साथ ARIMA+ अनुमानित मांग वक्र",
      actualStock: "वास्तविक स्टॉक",
      forecastDemand: "अनुमानित मांग",
      confidenceBand: "95% विश्वास बैंड",
      threshold: "स्टॉकआउट सीमा रेखा",
      daysHistory: "पिछले 30 दिन",
      daysForecast: "आगामी 14 दिन",
    },
    risks: {
      Critical: "गंभीर (≤ 3 दिन)",
      High: "उच्च (4–7 दिन)",
      Medium: "मध्यम (8–14 दिन)",
      Low: "सुरक्षित (> 14 दिन)",
    },
    diseaseClasses: {
      fever_vector: "बुखार और वेक्टर-जनित (डेंगू, मलेरिया)",
      diarrhoeal: "दस्त और आंत्र (ओआरएस, जिंक)",
      respiratory: "श्वसन और एंटीबायोटिक्स",
      chronic_metabolic: "क्रोनिक और मधुमेह (इंसुलिन, मेटफॉर्मिन)",
      emergency_trauma: "आपातकालीन और ट्रॉमा (सर्पदंश रोधी विष)",
    },
    footer: {
      disclaimer: "पीएचसी पल्स: गूगल क्लाउड हैकाथॉन 'बिल्ड विद एआई: कोड फॉर कम्युनिटीज' के लिए निर्मित।",
      syntheticNote: "डेमो में मध्य प्रदेश, महाराष्ट्र, केरल और असम के 200 पीएचसी का सिंथेटिक डेटा उपयोग किया गया है।",
      sovereigntyNote: "डेटा संप्रभुता: रोगी का डेटा राज्य नोड्स में रहता है; केवल एन्क्रिप्टेड मॉडल ग्रेडिएंट साझा किए जाते हैं।",
    },
    common: {
      loading: "डेटा लोड हो रहा है...",
      retry: "पुनः प्रयास करें",
      error: "डेटा लोड करने में त्रुटि।",
      viewDetails: "विवरण देखें",
      close: "बंद करें",
      days: "दिन",
      units: "इकाइयां",
    },
  },

  mr: {
    appName: "पीएचसी पल्स",
    tagline: "भारताची सार्वजनिक आरोग्य पुरवठा साखळी सह-पायलट",
    live: "थेट (लाइव्ह)",
    lastUpdated: "२ मिनिटांपूर्वी अद्यतनित",
    scenarioActive: "परिदृश्य सक्रिय",
    demoMode: "डेमो स्टोरीलाइन",
    resetDemo: "डेमो रीसेट करा",
    roles: {
      phc_staff: "पीएचसी कर्मचारी (एएनएम / फार्मासिस्ट)",
      district_officer: "जिल्हा आरोग्य अधिकारी",
      state_national_officer: "राज्य / राष्ट्रीय अधिकारी",
    },
    roleDescriptions: {
      phc_staff: "स्थानिक पीएचसी साठा, खाटा आणि उपस्थितीसाठी मोबाइल रिपोर्टिंग.",
      district_officer: "जिल्हाभरातील आरोग्य केंद्रांचे निरीक्षण आणि औषध हस्तांतरण मंजुरी.",
      state_national_officer: "मध्य प्रदेश, महाराष्ट्र, केरळ आणि आसाममधील सर्वसमावेशक माहिती आणि फेडेरेटेड मॉडेल.",
    },
    nav: {
      dashboard: "कमांड डॅशबोर्ड",
      alerts: "तातडीचे इशारे",
      redistribution: "पुनर्वितरण नियोजन",
      ask: "पीएचसी पल्सला विचारा",
      report: "साठा नोंदवा",
      federated: "फेडेरेटेड नेटवर्क",
      about: "माहिती आणि रचना",
    },
    kpi: {
      reportingToday: "आज नोंदवलेली पीएचसी",
      criticalStockouts: "गंभीर साठा टंचाई (क्रिटिकल)",
      expiringSurplus: "९० दिवसांत मुदत संपणारा अतिरिक्त साठा",
      bedsAvailable: "उपलब्ध खाटा",
      staffPresent: "कर्तव्यावर उपस्थित कर्मचारी",
      facilities: "पीएचसी कार्यरत",
      itemsAtRisk: "≤ ३ दिवसांचा साठा असलेली औषधे",
      batchesSurplus: "जोखमीतील बॅचेस",
      availableOfTotal: "उपलब्ध सामान्य/प्रसूती खाटा",
      onDutySanctioned: "उपस्थित कर्मचारी",
    },
    filters: {
      title: "पुरवठा फिल्टर्स",
      state: "राज्य",
      allStates: "सर्व ४ राज्ये",
      district: "जिल्हा",
      allDistricts: "सर्व जिल्हे",
      medicine: "औषध",
      allMedicines: "सर्व औषधे",
      diseaseClass: "आजार वर्ग",
      allClasses: "सर्व आजार वर्ग",
      riskLevel: "धोका पातळी",
      allRisks: "सर्व धोका पातळी",
      reset: "फिल्टर रीसेट करा",
      activeFilters: "सक्रिय फिल्टर्स",
    },
    table: {
      title: "लवकरच संपणारा साठा",
      subtitle: "कमी साठा असलेल्या शीर्ष १० प्राथमिक आरोग्य केंद्रांची यादी",
      phc: "आरोग्य केंद्र",
      district: "जिल्हा / राज्य",
      medicine: "औषध",
      stock: "साठा",
      dailyDemand: "दैनिक वापर",
      daysOfCover: "साठ्याचे दिवस",
      risk: "धोका पातळी",
      nearestExpiry: "अंतिम मुदत",
      action: "कृती",
      findSurplus: "अतिरिक्त साठा शोधा",
      draftAlert: "इशारा तयार करा",
      emptyMessage: "निवडलेल्या निकषांनुसार कोणतेही केंद्र आढळले नाही.",
    },
    map: {
      title: "राष्ट्रीय सार्वजनिक आरोग्य नकाशा",
      subtitle: "औषध टंचाईच्या तीव्रतेनुसार रंगीत चिन्हांकित प्राथमिक आरोग्य केंद्र",
      zoomHint: "जिल्हास्तरीय केंद्र पाहण्यासाठी राज्यावर क्लिक करा",
      allIndia: "सर्व ४ राज्ये",
      legendCritical: "गंभीर (≤ ३ दिवस)",
      legendHigh: "जास्त (४–७ दिवस)",
      legendMedium: "मध्यम (८–१४ दिवस)",
      legendLow: "सुरक्षित (> १४ दिवस)",
      selectedPhc: "केंद्राचा तपशील",
      bedsVacant: "उपलब्ध खाटा",
      staffDuty: "उपस्थित कर्मचारी",
      medicinesTracked: "औषध यादी",
      coldChain: "कोल्ड चेन (२°C–८°C)",
      normalStorage: "सामान्य साठवणूक",
    },
    charts: {
      title: "३०-दिवसीय वापर आणि मागणी अंदाज",
      subtitle: "मागील वापर आणि ९५% अचूकतेसह भावी मागणी अंदाज",
      actualStock: "वास्तविक साठा",
      forecastDemand: "अंदाजित मागणी",
      confidenceBand: "९५% कॉन्फिडन्स बँड",
      threshold: "किमान साठा मर्यादा",
      daysHistory: "मागील ३० दिवस",
      daysForecast: "पुढील १४ दिवस",
    },
    risks: {
      Critical: "गंभीर (≤ ३ दिवस)",
      High: "जास्त (४–७ दिवस)",
      Medium: "मध्यम (८–१४ दिवस)",
      Low: "सुरक्षित (> १४ दिवस)",
    },
    diseaseClasses: {
      fever_vector: "ताप आणि डासजन्य आजार",
      diarrhoeal: "अतिसार आणि पचनसंस्था",
      respiratory: "श्वसनविकार आणि अँटीबायोटिक्स",
      chronic_metabolic: "मधुमेह आणि जुनाट आजार",
      emergency_trauma: "तातडीचे उपचार (सर्पदंश लस)",
    },
    footer: {
      disclaimer: "पीएचसी पल्स: गुगल क्लाउड हॅकाथॉन 'बिल्ड विथ एआय' साठी विकसित.",
      syntheticNote: "मध्य प्रदेश, महाराष्ट्र, केरळ आणि आसाममधील २०० केंद्रांचा कृत्रिम डेटा.",
      sovereigntyNote: "रुग्णांचा डेटा राज्यातच राहतो; केवळ एन्क्रिप्टेड मॉडेल अद्यतने सामायिक केली जातात.",
    },
    common: {
      loading: "माहिती लोड होत आहे...",
      retry: "पुन्हा प्रयत्न करा",
      error: "माहिती लोड करण्यात अडचण.",
      viewDetails: "तपशील पहा",
      close: "बंद करा",
      days: "दिवस",
      units: "नग",
    },
  },

  ml: {
    appName: "പി.എച്ച്.സി പൾസ്",
    tagline: "ഇന്ത്യൻ പൊതുജനാരോഗ്യ വിതരണ ശൃംഖല എ.ഐ കോ-പൈലറ്റ്",
    live: "തത്സമയം",
    lastUpdated: "2 മിനിറ്റ് മുൻപ് അപ്‌ഡേറ്റ് ചെയ്തു",
    scenarioActive: "സിമുലേഷൻ സജീവം",
    demoMode: "ഡെമോ സ്റ്റോറിലൈൻ",
    resetDemo: "ഡെമോ പുനഃസജ്ജമാക്കുക",
    roles: {
      phc_staff: "പി.എച്ച്.സി ജീവനക്കാർ (എ.എൻ.എം / ഫാർമസിസ്റ്റ്)",
      district_officer: "ജില്ലാ മെഡിക്കൽ ഓഫീസർ",
      state_national_officer: "സംസ്ഥാന / ദേശീയ ഉദ്യോഗസ്ഥൻ",
    },
    roleDescriptions: {
      phc_staff: "മരുന്ന് സ്റ്റോക്ക്, ബെഡ്ഡുകൾ, ജീവനക്കാരുടെ ഹാജർ എന്നിവ ഫോണിലൂടെ രേഖപ്പെടുത്തുക.",
      district_officer: "ജില്ലാതല സ്റ്റോക്ക് നിരീക്ഷിക്കുകയും പുനർവിതരണം അംഗീകരിക്കുകയും ചെയ്യുക.",
      state_national_officer: "നാല് സംസ്ഥാനങ്ങളിലെയും വിവരങ്ങൾ, പകർച്ചവ്യാധി പ്രവചനം എന്നിവ പരിശോധിക്കുക.",
    },
    nav: {
      dashboard: "കമാൻഡ് ഡാഷ്‌ബോർഡ്",
      alerts: "അടിയന്തര മുന്നറിയിപ്പുകൾ",
      redistribution: "പുനർവിതരണ ആസൂത്രണം",
      ask: "ചോദിക്കൂ പി.എച്ച്.സി പൾസിനോട്",
      report: "സ്റ്റോക്ക് റിപ്പോർട്ട് ചെയ്യുക",
      federated: "ഫെഡറേറ്റഡ് നെറ്റ്‌വർക്ക്",
      about: "ആർക്കിടെക്ചർ വിവരണം",
    },
    kpi: {
      reportingToday: "ഇന്ന് റിപ്പോർട്ട് ചെയ്ത പി.എച്ച്.സികൾ",
      criticalStockouts: "ഗുരുതരമായ സ്റ്റോക്ക് കുറവ്",
      expiringSurplus: "90 ദിവസത്തിനുള്ളിൽ കാലാവധി തീരുന്നവ",
      bedsAvailable: "ലഭ്യമായ ബെഡ്ഡുകൾ",
      staffPresent: "ഡ്യൂട്ടിയിലുള്ള ജീവനക്കാർ",
      facilities: "പി.എച്ച്.സികൾ റിപ്പോർട്ട് ചെയ്തു",
      itemsAtRisk: "≤ 3 ദിവസത്തെ സ്റ്റോക്ക് ബാക്കിയുള്ളവ",
      batchesSurplus: "അധികമുള്ള ബാച്ചുകൾ",
      availableOfTotal: "ഒഴിവുള്ള ജനറൽ/മെറ്റേണിറ്റി ബെഡ്ഡുകൾ",
      onDutySanctioned: "ഇന്നത്തെ ജീവനക്കാർ",
    },
    filters: {
      title: "ഫിൽട്ടറുകൾ",
      state: "സംസ്ഥാനം",
      allStates: "എല്ലാ 4 സംസ്ഥാനങ്ങളും",
      district: "ജില്ല",
      allDistricts: "എല്ലാ ജില്ലകളും",
      medicine: "മരുന്ന്",
      allMedicines: "എല്ലാ മരുന്നുകളും",
      diseaseClass: "രോഗ വിഭാഗം",
      allClasses: "എല്ലാ വിഭാഗങ്ങളും",
      riskLevel: "റിസ്ക് ലെവൽ",
      allRisks: "എല്ലാ ലെവലുകളും",
      reset: "ഫിൽട്ടർ ഒഴിവാക്കുക",
      activeFilters: "സജീവ ഫിൽട്ടറുകൾ",
    },
    table: {
      title: "ഉടൻ തീരാൻ സാധ്യതയുള്ള മരുന്നുകൾ",
      subtitle: "സ്റ്റോക്ക് തീരാൻ ഏറ്റവും കൂടുതൽ സാധ്യതയുള്ള പ്രധാന കേന്ദ്രങ്ങൾ",
      phc: "പി.എച്ച്.സി",
      district: "ജില്ല / സംസ്ഥാനം",
      medicine: "മരുന്ന്",
      stock: "സ്റ്റോക്ക്",
      dailyDemand: "പ്രതിദിന ഉപയോഗം",
      daysOfCover: "സ്റ്റോക്ക് ദിനങ്ങൾ",
      risk: "റിസ്ക് ലെവൽ",
      nearestExpiry: "കാലാവധി",
      action: "നടപടികൾ",
      findSurplus: "അധിക സ്റ്റോക്ക് കണ്ടെത്തുക",
      draftAlert: "മുന്നറിയിപ്പ് നൽകുക",
      emptyMessage: "തിരഞ്ഞെടുത്ത ഫിൽട്ടറിൽ വിവരങ്ങൾ ലഭ്യമല്ല.",
    },
    map: {
      title: "ദേശീയ പൊതുജനാരോഗ്യ ഭൂപടം",
      subtitle: "സ്റ്റോക്ക് കുറവിനനുസരിച്ച് അടയാളപ്പെടുത്തിയ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രങ്ങൾ",
      zoomHint: "വിശദാംശങ്ങൾക്കായി സംസ്ഥാനം തിരഞ്ഞെടുക്കുക",
      allIndia: "എല്ലാ സംസ്ഥാനങ്ങളും",
      legendCritical: "ഗുരുതരം (≤ 3 ദിവസം)",
      legendHigh: "കൂടിയ റിസ്ക് (4–7 ദിവസം)",
      legendMedium: "മിതമായ റിസ്ക് (8–14 ദിവസം)",
      legendLow: "സുരക്ഷിതം (> 14 ദിവസം)",
      selectedPhc: "ആരോഗ്യ കേന്ദ്രം വിവരങ്ങൾ",
      bedsVacant: "ലഭ്യമായ ബെഡ്ഡുകൾ",
      staffDuty: "ഡ്യൂട്ടിയിലുള്ള ജീവനക്കാർ",
      medicinesTracked: "മരുന്ന് പട്ടിക",
      coldChain: "കോൾഡ് ചെയിൻ (2°C–8°C)",
      normalStorage: "സാധാരണ സ്റ്റോറേജ്",
    },
    charts: {
      title: "30 ദിവസത്തെ മരുന്ന് ഉപയോഗവും പ്രവചനവും",
      subtitle: "മുൻകാല ഉപയോഗവും അടുത്ത 14 ദിവസത്തെ സാധ്യതാ പ്രവചനവും",
      actualStock: "യഥാർത്ഥ സ്റ്റോക്ക്",
      forecastDemand: "പ്രതീക്ഷിക്കുന്ന ഉപയോഗം",
      confidenceBand: "95% കോൺഫിഡൻസ് ബാൻഡ്",
      threshold: "അപകട നില",
      daysHistory: "കഴിഞ്ഞ 30 ദിവസം",
      daysForecast: "അടുത്ത 14 ദിവസം",
    },
    risks: {
      Critical: "ഗുരുതരം (≤ 3 ദിവസം)",
      High: "കൂടിയ റിസ്ക് (4–7 ദിവസം)",
      Medium: "മിതമായ റിസ്ക് (8–14 ദിവസം)",
      Low: "സുരക്ഷിതം (> 14 ദിവസം)",
    },
    diseaseClasses: {
      fever_vector: "പനിയും കൊതുക് ജന്യ രോഗങ്ങളും",
      diarrhoeal: "വയറിളക്ക രോഗങ്ങൾ",
      respiratory: "ശ്വാസകോശ സംബന്ധമായവ",
      chronic_metabolic: "പ്രമേഹം, മറ്റ് രോഗങ്ങൾ",
      emergency_trauma: "പാമ്പ് വിഷബാധ, അത്യാഹിതങ്ങൾ",
    },
    footer: {
      disclaimer: "പി.എച്ച്.സി പൾസ്: ഗൂഗിൾ ക്ലൗഡ് ഹാക്കത്തോണിനായി തയ്യാറാക്കിയത്.",
      syntheticNote: "മധ്യപ്രദേശ്, മഹാരാഷ്ട്ര, കേരളം, അസം എന്നിവടങ്ങളിലെ കൃത്രിമ ഡാറ്റ.",
      sovereigntyNote: "രോഗികളുടെ ഡാറ്റ സംസ്ഥാനം വിട്ടുപോകില്ല; എൻക്രിപ്റ്റ് ചെയ്ത മോഡൽ മാത്രമാണ് പങ്കിടുന്നത്.",
    },
    common: {
      loading: "വിവരങ്ങൾ ശേഖരിക്കുന്നു...",
      retry: "വീണ്ടും ശ്രമിക്കുക",
      error: "വിവരങ്ങൾ ലഭിക്കുന്നതിൽ തടസ്സം.",
      viewDetails: "വിശദമായി കാണുക",
      close: "അടയ്ക്കുക",
      days: "ദിവസങ്ങൾ",
      units: "യൂണിറ്റ്",
    },
  },

  as: {
    appName: "পিএইচচি পাল্ছ",
    tagline: "ভাৰতৰ ৰাজহুৱা স্বাস্থ্য যোগান শৃংখল এআই সহ-পাইলট",
    live: "লাইভ",
    lastUpdated: "২ মিনিট পূৰ্বে আপডেট কৰা হৈছে",
    scenarioActive: "পৰিস্থিতি সক্ৰিয়",
    demoMode: "ডেমো ষ্টোৰীলাইন",
    resetDemo: "ডেমো ৰিচেট কৰক",
    roles: {
      phc_staff: "পিএইচচি কৰ্মচাৰী (এএনএম / ফাৰ্মাচিষ্ট)",
      district_officer: "জিলা স্বাস্থ্য বিষয়া",
      state_national_officer: "ৰাজ্যিক / ৰাষ্ট্ৰীয় বিষয়া",
    },
    roleDescriptions: {
      phc_staff: "স্থানীয় পিএইচচি ঔষধ, বিচনা আৰু উপস্থিতি মোবাইলৰ জৰিয়তে ৰিপৰ্ট কৰক।",
      district_officer: "জিলাৰ স্বাস্থ্য কেন্দ্ৰসমূহ পৰ্যবেক্ষণ আৰু ঔষধ পুনৰ্বণ্টনত অনুমোদন জনাওক।",
      state_national_officer: "মধ্যপ্ৰদেশ, মহাৰাষ্ট্ৰ, কেৰালা আৰু অসমৰ সম্পূৰ্ণ তথ্য আৰু ফেডাৰেটেড মডেল।",
    },
    nav: {
      dashboard: "কমাণ্ড ডেচবৰ্ড",
      alerts: "জৰুৰী সতৰ্কতা",
      redistribution: "পুনৰ্বণ্টন পৰিকল্পনা",
      ask: "পিএইচচি পাল্ছক সোধক",
      report: "ঔষধ ৰিপৰ্ট কৰক",
      federated: "ফেডাৰেটেড নেটৱৰ্ক",
      about: "বিৱৰণ আৰু আৰ্কিটেকচাৰ",
    },
    kpi: {
      reportingToday: "আজি ৰিপৰ্ট কৰা পিএইচচি",
      criticalStockouts: "গুৰুতৰ ঔষধৰ নাটনি",
      expiringSurplus: "৯০ দিনৰ ভিতৰত ম্যাদ শেষ হ'বলগীয়া অতিৰিক্ত ঔষধ",
      bedsAvailable: "উপলব্ধ বিচনা",
      staffPresent: "উপস্থিত কৰ্মচাৰী",
      facilities: "পিএইচচিয়ে ৰিপৰ্ট কৰিছে",
      itemsAtRisk: "≤ ৩ দিনৰ নাটনি থকা ঔষধ",
      batchesSurplus: "অতিৰিক্ত বেচ বিপদত",
      availableOfTotal: "খালী থকা জেনেৰেল/প্ৰসূতি বিচনা",
      onDutySanctioned: "আজি উপস্থিত কৰ্মচাৰী",
    },
    filters: {
      title: "যোগান ফিল্টাৰ",
      state: "ৰাজ্য",
      allStates: "সকলো ৪ খন ৰাজ্য",
      district: "জিলা",
      allDistricts: "সকলো জিলা",
      medicine: "ঔষধ",
      allMedicines: "সকলো ঔষধ",
      diseaseClass: "ৰোগৰ শ্ৰেণী",
      allClasses: "সকলো ৰোগ শ্ৰেণী",
      riskLevel: "বিপদৰ মাত্ৰা",
      allRisks: "সকলো বিপদ মাত্ৰা",
      reset: "ফিল্টাৰ ৰিচেট কৰক",
      activeFilters: "সক্ৰিয় ফিল্টাৰ",
    },
    table: {
      title: "শীঘ্ৰে শেষ হ'বলগীয়া ঔষধ",
      subtitle: "নাটনিৰ দিনৰ ভিত্তিত সজ্জিত প্ৰধান ১০ টা স্বাস্থ্য কেন্দ্ৰ",
      phc: "স্বাস্থ্য কেন্দ্ৰ",
      district: "জিলা / ৰাজ্য",
      medicine: "ঔষধৰ নাম",
      stock: "মজুত পৰিমাণ",
      dailyDemand: "দৈনিক ব্যৱহাৰ",
      daysOfCover: "মজুতৰ দিন",
      risk: "বিপদৰ মাত্ৰা",
      nearestExpiry: "ম্যাদ উকলি যোৱাৰ দিন",
      action: "পদক্ষেপ",
      findSurplus: "অতিৰিক্ত ঔষধ বিচাৰক",
      draftAlert: "সতৰ্কতা লিখক",
      emptyMessage: "কোনো তথ্য পোৱা নগ'ল।",
    },
    map: {
      title: "ৰাষ্ট্ৰীয় ৰাজহুৱা স্বাস্থ্য মানচিত্ৰ",
      subtitle: "ঔষধ নাটনিৰ মাত্ৰা অনুসৰি ৰং-চিহ্নিত স্বাস্থ্য কেন্দ্ৰসমূহ",
      zoomHint: "জিলা পৰ্যায়ত চাবলৈ ৰাজ্য বাছক",
      allIndia: "সকলো ৰাজ্যিক ন'ড",
      legendCritical: "গুৰুতৰ (≤ ৩ দিন)",
      legendHigh: "উচ্চ (৪–৭ দিন)",
      legendMedium: "মধ্যম (৮–১৪ দিন)",
      legendLow: "নিৰাপদ (> ১৪ দিন)",
      selectedPhc: "স্বাস্থ্য কেন্দ্ৰৰ বিৱৰণ",
      bedsVacant: "উপলব্ধ বিচনা",
      staffDuty: "উপস্থিত কৰ্মচাৰী",
      medicinesTracked: "ঔষধৰ তালিকা",
      coldChain: "ক'ল্ড চেইন (২°C–৮°C)",
      normalStorage: "সাধাৰণ মজুত",
    },
    charts: {
      title: "৩০ দিনৰ ব্যৱহাৰ আৰু ভৱিষ্যদ্বাণী",
      subtitle: "বিগত ব্যৱহাৰ আৰু অনাগত ১৪ দিনৰ সম্ভাৱ্য চাহিদাৰ আৰিমাপ্লাছ অনুমান",
      actualStock: "প্ৰকৃত মজুত",
      forecastDemand: "আনুমানিক চাহিদা",
      confidenceBand: "৯৫% কনফিডেন্স বেণ্ড",
      threshold: "নাটনিৰ সীমা",
      daysHistory: "বিগত ৩০ দিন",
      daysForecast: "অনাগত ১৪ দিন",
    },
    risks: {
      Critical: "গুৰুতৰ (≤ ৩ দিন)",
      High: "উচ্চ (৪–৭ দিন)",
      Medium: "মধ্যম (৮–১৪ দিন)",
      Low: "নিৰাপদ (> ১৪ দিন)",
    },
    diseaseClasses: {
      fever_vector: "জ্বৰ আৰু মহাবাহিত ৰোগ (ডেংগু, মেলেৰিয়া)",
      diarrhoeal: "হাগণি আৰু পেটৰ ৰোগ (অ'আৰএছ, জিংক)",
      respiratory: "উশাহ-নিশাহৰ সমস্যা আৰু এণ্টিবায়'টিক",
      chronic_metabolic: "মধুমেহ আৰু অন্যান্য ৰোগ",
      emergency_trauma: "সৰ্পাঘাত প্ৰতিষেধক আৰু জৰুৰী ঔষধ",
    },
    footer: {
      disclaimer: "পিএইচচি পাল্ছ: গুগল ক্লাউড হেকাথনৰ বাবে প্ৰস্তুত কৰা হৈছে।",
      syntheticNote: "মধ্যপ্ৰদেশ, মহাৰাষ্ট্ৰ, কেৰালা আৰু অসমৰ ২০০ পিএইচচিৰ নমুনা তথ্য ব্যৱহাৰ কৰা হৈছে।",
      sovereigntyNote: "ৰোগীৰ তথ্য ৰাজ্যিক স্তৰত সুৰক্ষিত থাকে; কেৱল এনক্ৰিপ্ট কৰা মডেল আদান-প্ৰদান কৰা হয়।",
    },
    common: {
      loading: "তথ্য ল'ড হৈ আছে...",
      retry: "পুনৰ চেষ্টা কৰক",
      error: "তথ্য অনাত সমস্যা হৈছে।",
      viewDetails: "বিস্তাৰিত চাওক",
      close: "বন্ধ কৰক",
      days: "দিন",
      units: "ইউনিট",
    },
  },
};
