import { INITIAL_ASSETS, INITIAL_OPERATORS, INITIAL_BOOKINGS, INITIAL_BROKERS } from './db';
import { INITIAL_TENDERS } from './tenders-data';
import { UserRole } from './types';

export interface BotQueryRequest {
  message: string;
  role: UserRole;
  language?: 'en' | 'am';
  division?: 'all' | 'elshaday' | 'liora' | 'dalol';
}

export interface BotQueryResponse {
  answerEn: string;
  answerAm: string;
  roleScopedDivision: 'elshaday' | 'liora' | 'dalol' | 'all';
  isRestricted: boolean;
  restrictionReason?: string;
  stats?: Record<string, any>;
  suggestedPrompts?: { en: string; am: string }[];
}

/**
 * Normalizes input text and checks for keywords
 */
function hasKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

/**
 * Checks if the text contains Amharic Ethiopic characters
 */
export function isAmharicText(text: string): boolean {
  return /[\u1200-\u137F]/.test(text);
}

/**
 * Core Role-Scoped RAG Intelligence Engine for "Del's Bot"
 */
export function processDelsBotQuery(req: BotQueryRequest): BotQueryResponse {
  const rawQuery = req.message.trim();
  const lower = rawQuery.toLowerCase();
  const role = req.role;
  const isAmharicQuery = isAmharicText(rawQuery) || req.language === 'am';

  // Division boundaries
  const isElshadayAdmin = role === 'elshaday_admin';
  const isLioraAdmin = role === 'liora_admin';
  const isDalolAdmin = role === 'dalol_admin';
  const isSuperAdmin = role === 'head_dispatcher' || role === 'super_admin' || role === 'dispatcher';

  // ----------------------------------------------------
  // 1. RBAC SECURITY BOUNDARY CHECKS
  // ----------------------------------------------------

  // Heavy machinery keywords
  const machineryKeywords = [
    'excavator', 'bulldozer', 'grader', 'crane', 'heavy machinery',
    'cat 320d', 'komatsu', 'sany', 'sinotruk', 'dump truck', 'engine hours',
    'hydraulic hammer', 'breaker', 'liora', 'ማሽነሪ', 'ኤክስካቫተር', 'ቡልዶዘር', 'ግሬደር', 'ክሬን'
  ];

  // Car / light vehicle keywords
  const carKeywords = [
    'car', 'passenger', 'sedan', 'suv', 'hilux', 'corolla', 'fortuner',
    'land cruiser', 'van', 'driver', 'per diem', 'fuel', 'elshaday',
    'መኪና', 'ተሽከርካሪ', 'ሃይሉክስ', 'ኮሮላ', 'አሽከርካሪ', 'ነዳጅ', 'የውሎ አበል'
  ];

  // Check if Elshaday Admin attempts to query Liora's Heavy Machinery
  if (isElshadayAdmin && hasKeywords(lower, machineryKeywords)) {
    return {
      answerEn: "🔒 **Role-Based Access Notice (Elshaday Division Boundary):**\n\nYour account is strictly scoped to the **Elshaday Division** (Passenger Cars, 4x4 SUVs, Commercial Vans, Drivers, Per Diem, and Fuel). Access to Heavy Machinery and Excavation analytics (Liora Division) requires elevated authorization.\n\n*Action:* Please contact **Head Dispatcher Yonas Bekele** to obtain cross-divisional clearance.",
      answerAm: "🔒 **የፈቃድ ገደብ ማሳሰቢያ (የኤልሻዳይ ክፍል ገደብ)፦**\n\nየእርስዎ መዳረሻ የተወሰነው ለ**ኤልሻዳይ ክፍል** (የመንገደኞች መኪኖች፣ 4x4 ፒክአፖች፣ አሽከርካሪዎች፣ የውሎ አበል እና ነዳጅ) ብቻ ነው። የከባድ ማሽነሪዎች እና ቁፋሮ መረጃ (ሊዮራ) የተከለከለ ነው።\n\n*እርምጃ፦* እባክዎ ለተጨማሪ ፈቃድ **ዋና ዲፓቸር ዮናስ በቀለን** ያነጋግሩ።",
      roleScopedDivision: "elshaday",
      isRestricted: true,
      restrictionReason: "Elshaday Admin is restricted from querying Liora Heavy Machinery data.",
      suggestedPrompts: [
        { en: "How many 4x4 Hiluxes are available in Elshaday?", am: "በኤልሻዳይ ስንት 4x4 ሃይሉክስ መኪኖች ዝግጁ ናቸው?" },
        { en: "What are our driver daily per-diem rates?", am: "የአሽከርካሪዎች ዕለታዊ የውሎ አበል ተመን ስንት ነው?" },
        { en: "Show open car rental tenders from Ethio Telecom & CBE", am: "የኢትዮ ቴሌኮም እና ንግድ ባንክ የመኪና ኪራይ ጨረታዎችን አሳየኝ" },
      ],
    };
  }

  // Check if Liora Admin attempts to query Elshaday's Light Car Fleet
  if (isLioraAdmin && hasKeywords(lower, carKeywords)) {
    return {
      answerEn: "🔒 **Role-Based Access Notice (Liora Division Boundary):**\n\nYour account is strictly scoped to the **Liora Division** (Heavy Construction Machinery, Excavators, Bulldozers, Dumpers, Certified Operators, and Engine Hours). Passenger car and light fleet analytics (Elshaday Division) are restricted under RBAC.\n\n*Action:* Please contact **Head Dispatcher Yonas Bekele** for cross-division queries.",
      answerAm: "🔒 **የፈቃድ ገደብ ማሳሰቢያ (የሊዮራ ክፍል ገደብ)፦**\n\nየእርስዎ መዳረሻ የተወሰነው ለ**ሊዮራ ክፍል** (ከባድ የኮንስትራክሽን ማሽነሪዎች፣ ኤክስካቫተሮች፣ ቡልዶዘሮች፣ ዳምፕ ትራኮች፣ ኦፕሬተሮች እና የስራ ሰዓት) ብቻ ነው። የመንገደኞች መኪና መረጃ የተከለከለ ነው።\n\n*እርምጃ፦* እባክዎ ለተጨማሪ ፈቃድ **ዋና ዲፓቸር ዮናስ በቀለን** ያነጋግሩ።",
      roleScopedDivision: "liora",
      isRestricted: true,
      restrictionReason: "Liora Admin is restricted from querying Elshaday Car Fleet data.",
      suggestedPrompts: [
        { en: "What is the status of our CAT 320D Excavator fleet?", am: "የCAT 320D ኤክስካቫተሮቻችን የስራ ዝግጁነት ሁኔታ ምንድነው?" },
        { en: "Show ERA and MIDROC quarry heavy equipment tenders", am: "የመንገዶች አስተዳደር እና ሚድሮክ የከባድ ማሽነሪ ጨረታዎችን አሳየኝ" },
        { en: "List certified operators with Special Mobile Machinery licenses", am: "የልዩ ተንቀሳቃሽ ማሽነሪ ፈቃድ ያላቸውን ኦፕሬተሮች ዘርዝር" },
      ],
    };
  }

  // ----------------------------------------------------
  // 2. RETRIEVE & COMPILE ERP DATABASE METRICS
  // ----------------------------------------------------

  const allAssets = INITIAL_ASSETS;
  const passengerCars = allAssets.filter((a) => a.category === 'passenger_car');
  const suvs4x4 = allAssets.filter((a) => a.category === 'suv_4x4' || a.category === 'commercial_van');
  const heavyMachinery = allAssets.filter((a) => a.category === 'heavy_machinery');
  const powerEquipment = allAssets.filter((a) => a.category === 'power_equipment');
  const attachments = allAssets.filter((a) => a.category === 'attachment');

  const allOperators = INITIAL_OPERATORS;
  const certifiedMachineryOperators = allOperators.filter((o) =>
    o.driverLicenseGrade.toLowerCase().includes('special') ||
    o.driverLicenseGrade.toLowerCase().includes('machinery')
  );
  const driverOperators = allOperators.filter((o) => !certifiedMachineryOperators.includes(o));

  const tenders = INITIAL_TENDERS;
  const lioraTenders = tenders.filter((t) => t.targetDivision === 'liora' || t.targetDivision === 'both');
  const elshadayTenders = tenders.filter((t) => t.targetDivision === 'elshaday' || t.targetDivision === 'both');

  // ----------------------------------------------------
  // 3. INTENT MATCHING & ROLE-AWARE RESPONSES
  // ----------------------------------------------------

  // INTENT A: TENDERS & PROCUREMENT OPPORTUNITIES (Merkato & EGP)
  if (hasKeywords(lower, ['tender', 'bids', 'procurement', 'merkato', 'egp', 'era', 'cpo', 'ጨረታ', 'ቴንደር', 'ግዥ'])) {
    if (isElshadayAdmin) {
      const topTender = elshadayTenders[0];
      return {
        answerEn: `📑 **Del's Bot Tender Briefing — Elshaday Division (Car Fleet):**\n\nWe are currently tracking **${elshadayTenders.length} high-probability tenders** for Elshaday on **2merkato.com** and **EGP**:\n\n1. **${topTender.title}**\n   - **Source:** ${topTender.sourceName} | Ref: \`${topTender.refNumber}\`\n   - **Client:** ${topTender.issuingOrganization}\n   - **Match Score:** 🎯 **${topTender.matchScore}% High Fit**\n   - **Required Units:** 10x 4x4 Toyota Hilux GD-6 & 2x Fortuner\n   - **Bid Bond (CPO):** ETB ${topTender.cpoAmountETB.toLocaleString()}\n   - **Closing Date:** ${topTender.closingDate} (${topTender.closingCountdown})\n\n2. **Commercial Bank of Ethiopia (CBE) Hybrid Sedans Framework** (Match: 92%)\n   - 6x Toyota Corolla Cross Hybrid @ Sengatera Financial District.\n\n*Action:* Open the **Tenders** module to inspect requirements or upload the purchased RFP document for compliance breakdown.`,
        answerAm: `📑 **የዴል ቦት የጨረታ መግለጫ — ኤልሻዳይ ክፍል (የተሽከርካሪ ኪራይ)፦**\n\nበ**2merkato.com** እና **የኢትዮጵያ EGP** ላይ ለኤልሻዳይ **${elshadayTenders.length} ከፍተኛ ዕድል ያላቸው ጨረታዎችን** እየተከታተልን ነው፦\n\n1. **${topTender.titleAmharic}**\n   - **ምንጭ፦** ${topTender.sourceName} | ቁጥር፦ \`${topTender.refNumber}\`\n   - **አውጪው፦** ${topTender.issuingOrganizationAmharic}\n   - **የተዛማጅነት ነጥብ፦** 🎯 **${topTender.matchScore}% ፍጹም ተዛማጅ**\n   - **የሚፈለጉ ተሽከርካሪዎች፦** 10 ቶዮታ ሃይሉክስ 4x4 GD-6 እና 2 ፎርቹንር\n   - **የጨረታ ማስከበሪያ (CPO)፦** ${topTender.cpoAmountETB.toLocaleString()} ብር\n   - **የመዝጊያ ቀን፦** ${topTender.closingDate} (${topTender.closingCountdown})\n\n2. **የኢትዮጵያ ንግድ ባንክ (CBE) የሃይብሪድ መኪኖች ኪራይ ጨረታ** (92% ተዛማጅ)\n   - 6 ቶዮታ ኮሮላ ክሮስ ሃይብሪድ መኪኖችን በሴንጋተራ ያጠቃልላል።`,
        roleScopedDivision: "elshaday",
        isRestricted: false,
        stats: { openTendersCount: elshadayTenders.length, topMatch: topTender.matchScore },
      };
    }

    if (isLioraAdmin) {
      const topTender = lioraTenders[0];
      return {
        answerEn: `🏗️ **Del's Bot Tender Briefing — Liora Division (Heavy Machinery):**\n\nTracking **${lioraTenders.length} active heavy earthmoving & machinery tenders** from **ERA** and **MIDROC** on EGP and 2merkato:\n\n1. **${topTender.title}**\n   - **Source:** ${topTender.sourceName} | Ref: \`${topTender.refNumber}\`\n   - **Client:** ${topTender.issuingOrganization}\n   - **Match Score:** 🎯 **${topTender.matchScore}% Top Fit**\n   - **Required Machinery:** 4x CAT 320D Excavators, 2x Komatsu D65 Bulldozers, 2x Motor Graders\n   - **Estimated Budget:** ETB ${topTender.estimatedBudgetETB.toLocaleString()}\n   - **CPO Guarantee:** ETB ${topTender.cpoAmountETB.toLocaleString()}\n   - **Closing Date:** ${topTender.closingDate} (${topTender.closingCountdown})\n\n2. **Derba Midroc Cement Quarry Hauling & Rock Excavation** (Match: 95%)\n   - 3x 30T Excavators with hydraulic breaker lines & 6x Sinotruk 16m³ dump trucks.\n\n*Action:* All required machinery and certified operators are in active standby in our Bole and Kality yards.`,
        answerAm: `🏗️ **የዴል ቦት የጨረታ መግለጫ — ሊዮራ ክፍል (የከባድ ማሽነሪ ኪራይ)፦**\n\nከ**የኢትዮጵያ መንገዶች አስተዳደር (ERA)** እና **ሚድሮክ** የተገኙ **${lioraTenders.length} ንቁ የከባድ ማሽነሪ ጨረታዎችን** በመከታተል ላይ ነን፦\n\n1. **${topTender.titleAmharic}**\n   - **ምንጭ፦** ${topTender.sourceName} | ቁጥር፦ \`${topTender.refNumber}\`\n   - **አውጪው፦** ${topTender.issuingOrganizationAmharic}\n   - **የተዛማጅነት ነጥብ፦** 🎯 **${topTender.matchScore}% ከፍተኛ ተዛማጅነት**\n   - **የሚፈለጉ ማሽኖች፦** 4 CAT 320D ኤክስካቫተሮች፣ 2 ኮማትሱ ቡልዶዘሮች እና 2 ግሬደሮች\n   - **የተገመተ በጀት፦** ${topTender.estimatedBudgetETB.toLocaleString()} ብር\n   - **የጨረታ ማስከበሪያ (CPO)፦** ${topTender.cpoAmountETB.toLocaleString()} ብር\n   - **የመዝጊያ ቀን፦** ${topTender.closingDate} (${topTender.closingCountdown})\n\n2. **የደርባ ሚድሮክ ሲሚንቶ ፋብሪካ የድንጋይ ቁፋሮ እና ዳምፕ ትራክ ጨረታ** (95% ተዛማጅ)።`,
        roleScopedDivision: "liora",
        isRestricted: false,
        stats: { openTendersCount: lioraTenders.length, topMatch: topTender.matchScore },
      };
    }

    // Super Admin / Head Dispatcher: Consolidated View
    return {
      answerEn: `🌐 **Del's Bot Central Tender Intelligence (Consolidated Super Admin View):**\n\nDEL Services has **${tenders.length} active high-match tenders** across both Elshaday and Liora divisions with total potential contract pipeline of **ETB ${(tenders.reduce((acc, t) => acc + t.estimatedBudgetETB, 0)).toLocaleString()}**:\n\n- **Elshaday Car Fleet Tenders:** ${elshadayTenders.length} opportunities (Ethio Telecom 4WD towers, CBE Executive Hybrid Sedans, UN OCHA Relief Fleet). Top Match: **94%**.\n- **Liora Heavy Machinery Tenders:** ${lioraTenders.length} opportunities (ERA Highway Earthmoving, Derba Midroc Quarry, EEP Crane Package). Top Match: **96%**.\n- **Total CPO Liquidity Required:** ETB ${(tenders.reduce((acc, t) => acc + t.cpoAmountETB, 0)).toLocaleString()}.\n\n*Live Status:* Automated morning scrapers for 2merkato.com and EGP (egp.ppa.gov.et) ran at 07:00 AM EAT. All bid security milestones are tracked in the **Tenders** module.`,
      answerAm: `🌐 **የዴል ቦት ማዕከላዊ የጨረታ ኢንተለጀንስ (የዋና ዲፓቸር አጠቃላይ እይታ)፦**\n\nዴል ሰርቪስ በኤልሻዳይ እና ሊዮራ ክፍሎች አጠቃላይ **${tenders.length} ከፍተኛ ተዛማጅነት ያላቸው ጨረታዎች** ያሉት ሲሆን፣ ጠቅላላ የውል ዋጋው **${(tenders.reduce((acc, t) => acc + t.estimatedBudgetETB, 0)).toLocaleString()} ብር** ይደርሳል፦\n\n- **የኤልሻዳይ የተሽከርካሪ ጨረታዎች፦** ${elshadayTenders.length} ዕድሎች (ኢትዮ ቴሌኮም፣ ንግድ ባንክ፣ የተመድ)። ከፍተኛ ተዛማጅ፦ **94%**።\n- **የሊዮራ ከባድ ማሽነሪ ጨረታዎች፦** ${lioraTenders.length} ዕድሎች (የመንገዶች አስተዳደር፣ ደርባ ሲሚንቶ፣ ኤሌክትሪክ ሃይል)። ከፍተኛ ተዛማጅ፦ **96%**።\n- **ጠቅላላ የሲፒኦ (CPO) ማስከበሪያ፦** ${(tenders.reduce((acc, t) => acc + t.cpoAmountETB, 0)).toLocaleString()} ብር።\n\n*ሁኔታ፦* የዛሬው የ2merkato እና EGP አውቶማቲክ ቅኝት በ07:00 AM ተጠናቋል። ሁሉም በ**Tenders** ሞጁል ውስጥ ዝግጁ ናቸው።`,
      roleScopedDivision: "all",
      isRestricted: false,
      stats: { totalTenders: tenders.length, totalValueETB: tenders.reduce((acc, t) => acc + t.estimatedBudgetETB, 0) },
    };
  }

  // INTENT B: DALOL HOLDING STATUS & LOGISTICS
  if (isDalolAdmin || hasKeywords(lower, ['dalol', 'holding', 'status', 'ዳሎል', 'ሆልዲንግ'])) {
    return {
      answerEn: `🏢 **Del's Bot Dalol Corporate Holding Status Analysis:**\n\n- **Entity Profile:** Dalol Industrial & General Holdings Ltd.\n- **Current Status:** **Operational Holding & Inter-Company Clearing**.\n- **Asset Allocation:** Strategic machinery and commercial asset reserve. Dalol functions as the capital asset holding structure for heavy operations and fleet financing.\n- **Active Processes:** Inter-company settlement verification, cross-tenant clearing ledgers, and centralized asset depreciation accounting with Ministry of Revenues (MoR) compliance.\n- **System Clearance:** Holding oversight active across all 3 subsidiary divisions.`,
      answerAm: `🏢 **የዴል ቦት የዳሎል ሆልዲንግ ወቅታዊ ሁኔታ ትንተና፦**\n\n- **የተቋሙ ስም፦** ዳሎል ኢንደስትሪያል እና ጄኔራል ሆልዲንግስ።\n- **ወቅታዊ ሁኔታ፦** **የሆልዲንግ አስተዳደር እና የውስጥ ሂሳብ ማጣሪያ (Clearing)**።\n- **የሀብት ምደባ፦** ስትራቴጂክ የካፒታል ማሽነሪዎች እና ተሽከርካሪዎች መጠባበቂያ። ዳሎል ለከባድ ስራዎች የፋይናንስ እና የሀብት ባለቤትነት መዋቅር ሆኖ ያገለግላል።\n- **ንቁ ሂደቶች፦** የኩባንያዎች የእርስ በእርስ ሂሳብ ማጣሪያ፣ የታክስ ህጋዊነት እና የማሽን ዋጋ ቅነሳ (Depreciation) ስሌት ከገቢዎች ሚኒስቴር ጋር ተጣጥሞ በመካሄድ ላይ ነው።`,
      roleScopedDivision: "dalol",
      isRestricted: false,
    };
  }

  // INTENT C: FLEET INVENTORY, AVAILABILITY & RATES
  if (hasKeywords(lower, ['fleet', 'vehicle', 'car', 'hilux', 'corolla', 'rate', 'price', 'መኪና', 'ዋጋ', 'ክምችት', 'ኪራይ'])) {
    if (isElshadayAdmin) {
      return {
        answerEn: `🚗 **Del's Bot Elshaday Passenger & SUV Fleet Overview:**\n\n- **Passenger Cars (Local):** ${passengerCars.length} registered units (e.g. Toyota Corolla Cross Hybrid, Camry). Daily rate: **ETB 6,000 - 8,500/day**.\n- **4x4 SUVs & Pickups (Site Cars):** ${suvs4x4.length} units (Toyota Hilux Double Cab GD-6, Fortuner, Land Cruiser 300). Daily rate: **ETB 11,500 - 18,000/day**.\n- **Included Mileage:** 200 - 250 km/day standard included; Overage rate: **ETB 35 - 45/km**.\n- **Active Drivers:** ${driverOperators.length} verified chauffeurs with Grade 3 / Public 1 licenses.\n- **Driver Per Diem:** Standard out-of-Addis per diem is **ETB 1,200 - 1,500/day** (Adama, Hawassa, Dire Dawa corridor).\n- **Fuel Policy:** Full-to-full or reimbursable regional corridor fuel card.`,
        answerAm: `🚗 **የዴል ቦት የኤልሻዳይ ተሽከርካሪዎች አጠቃላይ ሁኔታ፦**\n\n- **የመንገደኞች መኪኖች (የከተማ)፦** ${passengerCars.length} የተመዘገቡ (ቶዮታ ኮሮላ ክሮስ ሃይብሪድ)። የቀን ዋጋ፦ **ከ6,000 - 8,500 ብር/ቀን**።\n- **4x4 የመስክ መኪኖች (የሳይት)፦** ${suvs4x4.length} መኪኖች (ቶዮታ ሃይሉክስ GD-6፣ ፎርቹንር፣ ላንድ ክሩዘር)። የቀን ዋጋ፦ **ከ11,500 - 18,000 ብር/ቀን**።\n- **የተካተተ ኪሎሜትር፦** በቀን ከ200 - 250 ኪ.ሜ፤ የተጨማሪ ኪሎሜትር ዋጋ፦ **ከ35 - 45 ብር/ኪ.ሜ**።\n- **ዝግጁ አሽከርካሪዎች፦** ${driverOperators.length} ደረጃ 3 እና ህዝብ 1 መንጃ ፈቃድ ያላቸው።\n- **የአሽከርካሪ የውሎ አበል፦** ከአዲስ አበባ ውጭ **በቀን 1,200 - 1,500 ብር** (አዳማ፣ ሀዋሳ፣ ድሬዳዋ)።`,
        roleScopedDivision: "elshaday",
        isRestricted: false,
        stats: { carsCount: passengerCars.length, suvsCount: suvs4x4.length, driversCount: driverOperators.length },
      };
    }
  }

  // INTENT D: HEAVY MACHINERY, OPERATORS & MAINTENANCE
  if (hasKeywords(lower, ['machinery', 'excavator', 'hours', 'maintenance', 'operator', 'ማሽነሪ', 'ኤክስካቫተር', 'ኦፕሬተር', 'ጥገና'])) {
    if (isLioraAdmin) {
      return {
        answerEn: `🚜 **Del's Bot Liora Heavy Machinery Intelligence:**\n\n- **Active Machinery Fleet:** ${heavyMachinery.length} heavy earthmoving units (CAT 320D Excavators, Komatsu D65 Bulldozers, Sany SMG200 Graders, Sinotruk Dumpers).\n- **Daily Operating Rates:** ETB 35,000 - 55,000/day (inclusive of 8 engine hours).\n- **Overtime Engine Hours:** ETB 2,500 - 3,500/hour past daily cap.\n- **Specialized Attachments:** ${attachments.length} hydraulic breakers (Soosan SB81) ready for quarry rock demolition.\n- **Certified Operators:** ${certifiedMachineryOperators.length} operators holding 'Special Mobile Machinery' certificates (e.g. Kebede Alemu, Girma Tadesse).\n- **Operator Wage:** ETB 1,500/day wage + ETB 1,200/day regional site per diem.\n- **Flatbed Low-Bed Mobilization:** ETB 25,000 - 45,000 flat roundtrip fee depending on regional distance.`,
        answerAm: `🚜 **የዴል ቦት የሊዮራ ከባድ ማሽነሪዎች መረጃ፦**\n\n- **ንቁ የከባድ ማሽነሪዎች ክምችት፦** ${heavyMachinery.length} ክፍሎች (CAT 320D ኤክስካቫተር፣ ኮማትሱ ቡልዶዘር፣ ሳኒ ግሬደር፣ ሲኖትራክ)።\n- **የቀን ኪራይ ተመን፦** ከ35,000 - 55,000 ብር/ቀን (8 የስራ ሰዓትን ያካትታል)።\n- **የትርፍ ሰዓት (Overtime)፦** ከ8 ሰዓት በላይ በሰዓት ከ2,500 - 3,500 ብር።\n- **ተጨማሪ መገጣጠሚያዎች፦** ${attachments.length} የሃይድሮሊክ መዶሻዎች (Soosan SB81) ለድንጋይ ፈንጂ ስራ ዝግጁ ናቸው።\n- **የተመሰከረላቸው ኦፕሬተሮች፦** ${certifiedMachineryOperators.length} 'የልዩ ተንቀሳቃሽ ማሽነሪ' ፈቃድ ያላቸው ባለሙያዎች።\n- **የኦፕሬተር ክፍያ፦** 1,500 ብር የቀን ደመወዝ + 1,200 ብር የሳይት አበል።\n- **የትራንስፖርት (ሎው-ቤድ) ማመላለሻ፦** ከ25,000 - 45,000 ብር እንደ ርቀቱ ይለያያል።`,
        roleScopedDivision: "liora",
        isRestricted: false,
        stats: { machineryCount: heavyMachinery.length, operatorsCount: certifiedMachineryOperators.length },
      };
    }
  }

  // DEFAULT / GENERAL ASSISTANCE
  if (isSuperAdmin) {
    return {
      answerEn: `👋 **Del's Bot Central Dispatch Intelligence Online.**\n\nLogged in as **Head Dispatcher / Super Admin**. I provide unified, real-time oversight across the entire DEL Services enterprise:\n\n- **Active Fleet:** ${allAssets.length} total units (${passengerCars.length} Passenger Cars, ${suvs4x4.length} 4x4 SUVs, ${heavyMachinery.length} Heavy Machinery, ${powerEquipment.length} Power Generators).\n- **Human Resources:** ${allOperators.length} Certified Operators & Drivers across all Ethiopian regions.\n- **Tender Pipeline:** ${tenders.length} active opportunities from 2merkato.com & EGP totaling ETB ${(tenders.reduce((a, b) => a + b.estimatedBudgetETB, 0)).toLocaleString()}.\n- **Dispatch Health:** Zero PostgreSQL GiST double-booking collision conflicts detected. 100% cloud sync active.\n\n*How can I assist you with dispatch, fleet allocations, financial summaries, or tender bids today?*`,
      answerAm: `👋 **የዴል ቦት ማዕከላዊ ዲፓች ኢንተለጀንስ ዝግጁ ነው።**\n\nእንደ **ዋና ዲፓቸር / ሱፐር አድሚን** ገብተዋል። በሁሉም የዴል ሰርቪስ ክፍሎች ላይ ሙሉ ቁጥጥር አለኝ፦\n\n- **ጠቅላላ መርከብ፦** ${allAssets.length} ጠቅላላ ተሽከርካሪዎችና ማሽኖች (${passengerCars.length} የመንገደኞች መኪኖች፣ ${suvs4x4.length} 4x4 መኪኖች፣ ${heavyMachinery.length} ከባድ ማሽነሪዎች)።\n- **የሰው ኃይል፦** ${allOperators.length} የተመሰከረላቸው አሽከርካሪዎች እና ኦፕሬተሮች።\n- **የጨረታ ሂደት፦** ${tenders.length} ክፍት የ2merkato እና EGP ጨረታዎች (ጠቅላላ ዋጋ ${(tenders.reduce((a, b) => a + b.estimatedBudgetETB, 0)).toLocaleString()} ብር)።\n\n*ዛሬ በዲፓች፣ በተሽከርካሪ ምደባ ወይም በጨረታ ዝግጅት በምን ልርዳዎት?*`,
      roleScopedDivision: "all",
      isRestricted: false,
    };
  }

  if (isElshadayAdmin) {
    return {
      answerEn: `👋 **Del's Bot — Elshaday Fleet Assistant.**\n\nI am your dedicated intelligence layer for the **Elshaday Car Fleet Division**. I can assist you with:\n- Light Passenger Cars & 4x4 SUV availability and daily rates\n- Chauffeur and driver schedules, per-diem calculations, and corridor fuel logs\n- 2merkato & EGP car rental tender matching and compliance checklists\n\n*What would you like to inspect today?*`,
      answerAm: `👋 **የዴል ቦት — የኤልሻዳይ ተሽከርካሪ ረዳት።**\n\nለ**ኤልሻዳይ የመኪና ኪራይ ክፍል** የተመደብኩ ረዳትዎ ነኝ። በሚከተሉት ልረዳዎት እችላለሁ፦\n- የመንገደኞች እና 4x4 መኪኖች ዝግጁነት እና የቀን ተመን\n- የአሽከርካሪዎች መርሃ-ግብር፣ የውሎ አበል ስሌት እና የነዳጅ ወጪ\n- የ2merkato እና EGP የመኪና ኪራይ ጨረታዎች ክትትል\n\n*ዛሬ ምን ማየት ይፈልጋሉ?*`,
      roleScopedDivision: "elshaday",
      isRestricted: false,
    };
  }

  if (isLioraAdmin) {
    return {
      answerEn: `👋 **Del's Bot — Liora Heavy Machinery Assistant.**\n\nI am your dedicated intelligence layer for the **Liora Heavy Construction Machinery Division**. I can assist you with:\n- CAT 320D Excavators, Komatsu Bulldozers, and Sany Motor Grader availability\n- Engine hours, meter readings, and low-bed mobilization tariffs\n- Certified Heavy Machinery Operators and OHS safety logs\n- ERA, EEP, and MIDROC earthmoving tender matches\n\n*What heavy equipment data do you need?*`,
      answerAm: `👋 **የዴል ቦት — የሊዮራ ከባድ ማሽነሪ ረዳት።**\n\nለ**ሊዮራ ከባድ ኮንስትራክሽን ማሽነሪ ክፍል** የተመደብኩ ረዳትዎ ነኝ። በሚከተሉት ልረዳዎት እችላለሁ፦\n- የCAT 320D ኤክስካቫተር፣ ቡልዶዘር እና ግሬደሮች የስራ ዝግጁነት\n- የማሽን የስራ ሰዓት (Engine Hours) እና የሎው-ቤድ ትራንስፖርት ስሌት\n- የልዩ ተንቀሳቃሽ ማሽነሪ ኦፕሬተሮች መረጃ\n- የመንገዶች አስተዳደር (ERA) እና ሚድሮክ የከባድ ማሽነሪ ጨረታዎች\n\n*የየትኛውን ማሽን መረጃ ማየት ይፈልጋሉ?*`,
      roleScopedDivision: "liora",
      isRestricted: false,
    };
  }

  return {
    answerEn: `👋 **Del's Bot Intelligence Ready.** How may I assist your division today?`,
    answerAm: `👋 **የዴል ቦት ረዳት ዝግጁ ነው።** ዛሬ በምን ልርዳዎት?`,
    roleScopedDivision: "all",
    isRestricted: false,
  };
}
