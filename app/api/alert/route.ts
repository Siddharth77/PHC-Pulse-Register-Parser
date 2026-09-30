import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SupplyAlert } from '@/types/supply-chain';

// In-memory cache loaded from data/alerts.json
let alertsCache: SupplyAlert[] | null = null;

function loadAlerts(): SupplyAlert[] {
  if (alertsCache) return alertsCache;
  const dataDir = path.resolve('./data');
  const alertsPath = path.join(dataDir, 'alerts.json');
  if (fs.existsSync(alertsPath)) {
    const raw = fs.readFileSync(alertsPath, 'utf-8');
    alertsCache = JSON.parse(raw);
  } else {
    alertsCache = [];
  }
  return alertsCache!;
}

export async function GET() {
  try {
    const alerts = loadAlerts();
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alerts = loadAlerts();

    // 1. Action: Status update (Draft -> Sent -> Acknowledged)
    if (body.action === 'update_status') {
      const alert = alerts.find((a) => a.id === body.id);
      if (!alert) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
      }
      alert.status = body.status;
      return NextResponse.json({ success: true, alert });
    }

    // 2. Action: Translate alert into target language
    if (body.action === 'translate') {
      const { alert, target_language } = body;
      if (!alert) {
        return NextResponse.json({ error: 'Alert payload required' }, { status: 400 });
      }

      // Pre-baked multilingual templates for Indian regional languages
      const translations: Record<string, { title: string; full_message: string; sms_text: string }> = {
        hi: {
          title: `आपातकालीन सूचना: ${alert.district} में ${alert.medicine} की कमी`,
          full_message: `आधिकारिक स्वास्थ्य परामर्श: ${alert.district} ज़िले के स्वास्थ्य केंद्रों में ${alert.medicine} का स्टॉक तेजी से घट रहा है। वर्तमान में केवल ${alert.days_of_cover} दिन का स्टॉक बचा है। मुख्य चिकित्सा अधिकारी से आपातकालीन अंतर-केंद्र स्थानांतरण की सिफारिश की जाती है।`,
          sms_text: `पीएचसी पल्स अलर्ट: ${alert.district} में ${alert.medicine} की भारी कमी (${alert.days_of_cover} दिन शेष)। तत्काल स्थानांतरण की स्वीकृति आवश्यक।`,
        },
        mr: {
          title: `तातडीचा इशारा: ${alert.district} मध्ये ${alert.medicine} चा साठा कमी`,
          full_message: `आरोग्य विभाग सूचना: ${alert.district} जिल्ह्यातील केंद्रांमध्ये ${alert.medicine} चा साठा संपत आला आहे (${alert.days_of_cover} दिवस शिल्लक). जिल्हा आरोग्य अधिकाऱ्यांनी तात्काळ साठा पुनर्वितरणास मंजुरी द्यावी.`,
          sms_text: `पीएचसी पल्स: ${alert.district} मध्ये ${alert.medicine} तुटवडा (${alert.days_of_cover} दिवस). मंजुरी प्रलंबित.`,
        },
        ml: {
          title: `അടിയന്തര മുന്നറിയിപ്പ്: ${alert.district} ൽ ${alert.medicine} സ്റ്റോക്ക് കുറവ്`,
          full_message: `ആരോഗ്യ വകുപ്പ് അറിയിപ്പ്: ${alert.district} ജില്ലയിലെ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രങ്ങളിൽ ${alert.medicine} സ്റ്റോക്ക് വെറും ${alert.days_of_cover} ദിവസത്തേക്ക് മാത്രമേ അവശേഷിക്കുന്നുള്ളൂ. ഉടൻ പുനർവിതരണം നടത്താൻ ഡി.എം.ഒ അംഗീകാരം ആവശ്യപ്പെടുന്നു.`,
          sms_text: `പി.എച്ച്.സി പൾസ്: ${alert.district} ൽ ${alert.medicine} കുറവ് (${alert.days_of_cover} ദിവസം ബാക്കി). നടപടി സ്വീകരിക്കുക.`,
        },
        as: {
          title: `জৰুৰী সতৰ্কতা: ${alert.district} ত ${alert.medicine} ৰ নাটনি`,
          full_message: `স্বাস্থ্য বিভাগৰ জাননী: ${alert.district} জিলাৰ চিকিৎসালয়সমূহত ${alert.medicine} ৰ মজুতমাত্ৰা ${alert.days_of_cover} দিনলৈ হ্ৰাস পাইছে। জিলা স্বাস্থ্য বিষয়াই জৰুৰী ঔষধ পুনৰ্বণ্টনত অনুমোদন জনাওক।`,
          sms_text: `পিএইচচি পাল্ছ: ${alert.district} ত ${alert.medicine} নাটনি (${alert.days_of_cover} দিন মজুত)। জৰুৰী অনুমোদন প্ৰয়োজন।`,
        },
      };

      const trans = translations[target_language] || {
        title: alert.title,
        full_message: alert.full_message,
        sms_text: alert.sms_text,
      };

      return NextResponse.json({
        success: true,
        translated_alert: {
          ...alert,
          title: trans.title,
          full_message: trans.full_message,
          sms_text: trans.sms_text,
          translated_language: target_language,
        },
      });
    }

    // 3. Action: Create New Alert
    const newAlert: SupplyAlert = {
      id: `ALT-2026-${Date.now().toString().slice(-4)}`,
      severity: body.severity || 'Critical',
      title: body.title || 'Stock Shortage Notification',
      state: body.state || 'Madhya Pradesh',
      district: body.district || 'Dewas',
      affected_phcs: body.affected_phcs || ['PHC-MP-001'],
      medicine: body.medicine || 'Paracetamol 500mg tab',
      days_of_cover: Number(body.days_of_cover) || 2.5,
      recommended_action: body.recommended_action || 'Reallocate surplus from neighboring health centre.',
      full_message: body.full_message || 'Emergency stock exhaustion anticipated. Action required.',
      sms_text: body.sms_text || 'PHC PULSE: Critical shortage alert. Action requested.',
      status: 'Draft',
      timestamp: 'Just now',
    };

    alerts.unshift(newAlert);
    return NextResponse.json({ success: true, alert: newAlert });
  } catch (error: any) {
    console.error('Error handling alert request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
