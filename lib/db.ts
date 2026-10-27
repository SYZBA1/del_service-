import {
  Asset,
  AssetRateCard,
  Booking,
  BookingItem,
  BookingCollateral,
  MachineryDailyTimesheet,
  AssetInspection,
  MaintenanceSchedule,
  Invoice,
  OwnerSettlementLedger,
  FleetOwner,
  User,
  BookingStatus,
  OperatorDriver,
  PartnerOnboarding,
  Broker,
  Images8Sides,
  SystemNotification,
  AssetCategory,
} from './types';

// Helper to provide realistic 8-angle photogrammetry images of a vehicle or machinery
export function generateMock8Sides(type: 'car' | 'machinery' | 'attachment', modelName: string): Images8Sides {
  const isMach = type === 'machinery';
  const isAtt = type === 'attachment';

  if (isAtt) {
    return {
      front: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      front_right: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      right_side: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
      rear_right: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
      rear: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      rear_left: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=800&q=80",
      left_side: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
      cabin_interior: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    };
  }

  if (isMach) {
    return {
      front: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80",
      front_right: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
      right_side: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
      rear_right: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      rear: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      rear_left: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=800&q=80",
      left_side: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
      cabin_interior: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    };
  }

  // Passenger Car 8-angle photos
  return {
    front: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=800&q=80",
    front_right: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    right_side: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    rear_right: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    rear: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    rear_left: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    left_side: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    cabin_interior: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
  };
}

// ==========================================
// SEED DATA: OPERATORS & DRIVERS (ODR)
// ==========================================
export const INITIAL_OPERATORS: OperatorDriver[] = [
  {
    id: "opr-001",
    fullName: "Kebede Alemu",
    phoneNumber: "+251912345678",
    email: "kebede.operator@delservices.et",
    driverLicenseGrade: "Special Mobile Machinery",
    driverLicenseNo: "DL-ETH-ET-90214",
    licenseExpiryDate: "2028-08-15",
    kycNidImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    faydaFinNumber: "FIN-3344-5566-7788",
    workExperienceYears: 12,
    experienceDetails: "12 years operating CAT 320D, Komatsu PC200, and heavy breakers across Awash-Kombolcha rail and high-rise foundation sites.",
    machineryHandled: ["CAT 320D Excavator", "Komatsu PC200-8", "CAT H120Es Breaker"],
    dispatchArea: "Addis Ababa & Oromia Special Zone",
    livingArea: "Kality Industrial Zone, Addis Ababa",
    estimatedPerDiem: 1500, // ETB / day
    status: "available",
    rating: 4.9,
    kycVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "opr-002",
    fullName: "Tsegaye Mekonnen",
    phoneNumber: "+251923456789",
    email: "tsegaye.operator@delservices.et",
    driverLicenseGrade: "Special Mobile Machinery",
    driverLicenseNo: "DL-ETH-ET-48192",
    licenseExpiryDate: "2027-11-20",
    kycNidImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    faydaFinNumber: "FIN-5566-7788-9911",
    workExperienceYears: 9,
    experienceDetails: "Specialist in quarry excavation, rock splitting, and heavy wheel loader operations (SDLG 956L). Certified by Ethiopian Roads Authority (ERA).",
    machineryHandled: ["SDLG 956L Loader", "CAT 320D", "Shantui SD22 Bulldozer"],
    dispatchArea: "Nationwide Mining & Highway Projects",
    livingArea: "Bishoftu (Debre Zeit), Oromia",
    estimatedPerDiem: 1800,
    status: "available",
    rating: 4.8,
    kycVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-01-12T08:00:00Z",
  },
  {
    id: "opr-003",
    fullName: "Girma Wolde",
    phoneNumber: "+251934567890",
    email: "girma.driver@delservices.et",
    driverLicenseGrade: "Public 1",
    driverLicenseNo: "DL-ETH-ET-33210",
    licenseExpiryDate: "2029-02-10",
    kycNidImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    faydaFinNumber: "FIN-7788-9900-1122",
    workExperienceYears: 8,
    experienceDetails: "VIP Executive chauffeur & 4x4 off-road safari driver. Expert handling of Toyota Land Cruiser 300 V8 and Hilux GD-6.",
    machineryHandled: ["Toyota Land Cruiser 300 V8", "Toyota Hilux 4x4", "Toyota Corolla Cross"],
    dispatchArea: "Addis Ababa & Hawassa Expressway",
    livingArea: "Bole Sub-city (Woreda 03), Addis Ababa",
    estimatedPerDiem: 1200,
    status: "dispatched",
    rating: 5.0,
    kycVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "opr-004",
    fullName: "Daniel Assefa",
    phoneNumber: "+251945678901",
    email: "daniel.driver@delservices.et",
    driverLicenseGrade: "Dry Freight 1",
    driverLicenseNo: "DL-ETH-ET-11094",
    licenseExpiryDate: "2028-06-30",
    kycNidImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    faydaFinNumber: "FIN-2211-4433-6655",
    workExperienceYears: 6,
    experienceDetails: "Commercial pickups and light flatbed logistics driver. Low-bed truck pilot escort certified.",
    machineryHandled: ["Toyota Hilux Double Cab", "Isuzu NPR 4.5T"],
    dispatchArea: "Addis Ababa, Adama, Mojo Dry Port",
    livingArea: "Sebeta, Oromia",
    estimatedPerDiem: 1000,
    status: "available",
    rating: 4.7,
    kycVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-01-18T08:00:00Z",
  },
  {
    id: "opr-005",
    fullName: "Ephrem Tesfaye",
    phoneNumber: "+251911882233",
    email: "ephrem.tesfaye@delservices.et",
    driverLicenseGrade: "Special Mobile Machinery",
    driverLicenseNo: "DL-ETH-ET-88321",
    licenseExpiryDate: "2028-10-15",
    kycNidImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    faydaFinNumber: "FIN-9988-7766-5544",
    workExperienceYears: 14,
    experienceDetails: "Senior heavy machinery master operator. Deep trenching, slope grading, and bridge pier foundation works.",
    machineryHandled: ["CAT 320D", "Komatsu PC200-8", "SDLG 956L"],
    dispatchArea: "Nationwide Heavy Infrastructure",
    livingArea: "Ayat / Yeka Sub-city, Addis Ababa",
    estimatedPerDiem: 2000,
    status: "available",
    rating: 4.95,
    kycVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    createdAt: "2026-02-01T08:00:00Z",
  },
];

// ==========================================
// SEED USERS & FLEET OWNERS
// ==========================================
export const INITIAL_USERS: User[] = [
  {
    id: "usr-001",
    fullName: "Alula Tekle",
    phoneNumber: "+251911000000",
    email: "admin@delservices.et",
    role: "head_dispatcher",
    status: "active",
    assignedDivision: "all",
    faydaFinNumber: "FIN-1000-2200-3300",
    tinNumber: "0012345678",
    kycVerified: true,
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "usr-002",
    fullName: "Yonas Bekele",
    phoneNumber: "+251911223344",
    email: "yonas.bekele@delservices.et",
    role: "head_dispatcher",
    status: "active",
    assignedDivision: "all",
    faydaFinNumber: "FIN-2233-4455-6677",
    tinNumber: "0023456789",
    kycVerified: true,
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "usr-003",
    fullName: "Bethlehem Tadesse",
    phoneNumber: "+251922445566",
    email: "elshaday.admin@delservices.et",
    role: "elshaday_admin",
    status: "active",
    assignedDivision: "elshaday",
    faydaFinNumber: "FIN-3344-5566-7788",
    tinNumber: "0034567890",
    kycVerified: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "usr-004",
    fullName: "Kassahun Belay",
    phoneNumber: "+251933556677",
    email: "liora.admin@delservices.et",
    role: "liora_admin",
    status: "active",
    assignedDivision: "liora",
    faydaFinNumber: "FIN-4455-6677-8899",
    tinNumber: "0045678901",
    kycVerified: true,
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "usr-005",
    fullName: "Abiy Girma",
    phoneNumber: "+251944667788",
    email: "dalol.admin@delservices.et",
    role: "dalol_admin",
    status: "active",
    assignedDivision: "dalol",
    faydaFinNumber: "FIN-5566-7788-9900",
    tinNumber: "0056789012",
    kycVerified: true,
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: "usr-010",
    fullName: "Solomon Haile",
    phoneNumber: "+251955778899",
    email: "solomon.elshaday@delservices.et",
    role: "elshaday_admin",
    status: "pending_approval",
    assignedDivision: "elshaday",
    confirmationEmailSent: true,
    faydaFinNumber: "FIN-6677-8899-0011",
    kycVerified: true,
    createdAt: "2026-10-24T18:00:00Z",
  },
  {
    id: "usr-006",
    fullName: "Fitsum Tadesse",
    phoneNumber: "+251956789012",
    email: "fitsum.workshop@delservices.et",
    role: "mechanic",
    status: "active",
    assignedDivision: "all",
    faydaFinNumber: "FIN-5566-7788-9900",
    kycVerified: true,
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: "usr-007",
    fullName: "MIDROC Construction Ethiopia",
    phoneNumber: "+251911554433",
    email: "procurement@midroc-ce.com",
    role: "renter",
    status: "active",
    assignedDivision: "liora",
    tinNumber: "0099887766",
    faydaFinNumber: "FIN-8899-0011-2233",
    kycVerified: true,
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "usr-008",
    fullName: "Dawit Haile",
    phoneNumber: "+251911998877",
    email: "dawit.haile@p2p-ethio.com",
    role: "fleet_owner",
    status: "active",
    assignedDivision: "elshaday",
    faydaFinNumber: "FIN-4455-6677-8899",
    kycVerified: true,
    createdAt: "2026-02-15T08:00:00Z",
  },
];

export const INITIAL_FLEET_OWNERS: FleetOwner[] = [
  {
    id: "tenant-001",
    primaryUserId: "usr-001",
    companyName: "DEL Internal Fleet",
    ownerType: "internal_company",
    tinNumber: "0012345678",
    platformCommissionPct: 0.0,
    payoutBankName: "Commercial Bank of Ethiopia",
    payoutAccountNumber: "1000123456789",
    instantBookEnabled: true,
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "tenant-002",
    primaryUserId: "usr-008",
    companyName: "Abyssinia Heavy Equipment Partners",
    ownerType: "corporate_partner",
    tinNumber: "0044556677",
    platformCommissionPct: 10.0,
    payoutBankName: "Awash Bank",
    payoutAccountNumber: "01320495839200",
    instantBookEnabled: true,
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "tenant-003",
    primaryUserId: "usr-008",
    companyName: "Dawit Haile P2P Fleet (Turo Mode)",
    ownerType: "individual_host",
    tinNumber: "0077889900",
    platformCommissionPct: 15.0,
    payoutBankName: "Bank of Abyssinia",
    payoutAccountNumber: "5049382710",
    instantBookEnabled: false,
    createdAt: "2026-02-10T08:00:00Z",
  },
];

// ==========================================
// SEED PARTNERS (PARTNER ONBOARDING)
// ==========================================
export const INITIAL_PARTNERS: PartnerOnboarding[] = [
  {
    id: "prt-001",
    ownerContact: {
      fullName: "Ato Dawit Haile",
      phoneNumber: "+251911998877",
      email: "dawit.haile@p2p-ethio.com",
      companyName: "Dawit Individual Host Fleet",
      tinNumber: "0077889900",
      ownerTier: "individual_host",
    },
    ownerKycNidUrl: "/mock/nid-dawit.jpg",
    faydaFinNumber: "FIN-4455-6677-8899",
    libreCertificateNo: "LIB-AA-2023-8821",
    libreDocUrl: "/contracts/libre-corolla.pdf",
    assetCategory: "passenger_car",
    condition: "excellent",
    make: "Toyota",
    model: "Corolla Cross Hybrid",
    manufactureYear: 2023,
    plateNumber: "2-C11904 AA",
    chassisOrSerialNumber: "JTMBR31U805012399",
    price: {
      dailyRate: 6000,
      weeklyRate: 36000,
      monthlyRate: 135000,
      securityDepositAmount: 25000,
      overtimeRatePerUnit: 30,
    },
    images8Sides: generateMock8Sides("car", "Toyota Corolla Cross"),
    regionLocation: {
      region: "Addis Ababa",
      citySubcity: "Kirkos / Kazanchis",
      depotAddress: "Kazanchis Super Host Hub, Addis Ababa",
    },
    agreement: {
      termsSigned: true,
      commissionPct: 15.0,
      signedDate: "2026-02-12",
      agreementDocUrl: "/contracts/p2p-agreement-dawit.pdf",
    },
    gps: {
      hasGps: true,
      gpsTrackerImei: "865492049102943",
      trackerModel: "Teltonika FMB920",
    },
    deliveryClearance: {
      paymentMethod: "Telebirr SuperApp",
      bankName: "Bank of Abyssinia",
      accountNumber: "5049382710",
      durationAvailableMonths: 12,
      handoverNotes: "Clean handover with full Benzin tank and spare tire.",
      confirmed: true,
      confirmedAt: "2026-02-12T10:00:00Z",
    },
    status: "active",
    createdAt: "2026-02-12T08:00:00Z",
  },
  {
    id: "prt-002",
    ownerContact: {
      fullName: "Eng. Bereket Gidey",
      phoneNumber: "+251911445566",
      email: "bereket@abyssinia-heavy.et",
      companyName: "Abyssinia Heavy Equipment Partners",
      tinNumber: "0044556677",
      ownerTier: "corporate_partner",
    },
    ownerKycNidUrl: "/mock/nid-bereket.jpg",
    faydaFinNumber: "FIN-1122-3344-5566",
    libreCertificateNo: "LIB-HM-2021-3390",
    libreDocUrl: "/contracts/libre-komatsu.pdf",
    assetCategory: "heavy_machinery",
    condition: "good",
    make: "Komatsu",
    model: "PC200-8 Hydraulic Excavator",
    manufactureYear: 2021,
    plateNumber: "SPL-03120 AA",
    chassisOrSerialNumber: "KOMPC200-8-C882194",
    price: {
      dailyRate: 36000,
      weeklyRate: 220000,
      monthlyRate: 800000,
      securityDepositAmount: 150000,
      overtimeRatePerUnit: 4500,
    },
    images8Sides: generateMock8Sides("machinery", "Komatsu PC200-8"),
    regionLocation: {
      region: "Addis Ababa",
      citySubcity: "Akaki Kality",
      depotAddress: "Kality Industrial Ring Logistics Park",
    },
    agreement: {
      termsSigned: true,
      commissionPct: 10.0,
      signedDate: "2026-02-01",
      agreementDocUrl: "/contracts/corporate-abyssinia.pdf",
    },
    gps: {
      hasGps: true,
      gpsTrackerImei: "865492049102946",
      trackerModel: "Teltonika FMB140",
    },
    deliveryClearance: {
      paymentMethod: "Bank Transfer",
      bankName: "Awash Bank",
      accountNumber: "01320495839200",
      durationAvailableMonths: 24,
      handoverNotes: "Hydraulic pump tested, ERA road-worthiness certified.",
      confirmed: true,
      confirmedAt: "2026-02-01T12:00:00Z",
    },
    status: "active",
    createdAt: "2026-02-01T08:00:00Z",
  },
];

// ==========================================
// SEED ASSETS (FLEET REGISTRY)
// ==========================================
export const INITIAL_ASSETS: Asset[] = [
  {
    id: "ast-001",
    ownerId: "tenant-001",
    category: "suv_4x4",
    make: "Toyota",
    model: "Land Cruiser 300 V8 GR-Sport",
    manufactureYear: 2024,
    plateNumber: "3-B24591 AA",
    chassisOrSerialNumber: "JTMHT01J704098124",
    libreCertificateNo: "LIB-AA-2024-9981",
    bolloExpiryDate: "2027-04-30",
    insuranceExpiryDate: "2027-04-30",
    meterUnit: "odometer_km",
    currentMeterReading: 18450,
    requiresCompanyOperator: true,
    gpsTrackerImei: "865492049102941",
    status: "available",
    condition: "excellent",
    primaryImageUrl: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Land Cruiser 300"),
    specs: {
      transmission: "automatic",
      fuelType: "diesel",
      seats: 7,
      dailyKmLimit: 200,
      driveType: "4x4",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0105,
      lng: 38.7615,
      speed: 0,
      address: "Jarkros Sets Building, 2nd Floor, Addis Ababa, Ethiopia",
      status: "idle",
      lastUpdated: "5 mins ago",
    },
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "ast-002",
    ownerId: "tenant-001",
    category: "suv_4x4",
    make: "Toyota",
    model: "Hilux Double Cab 4x4 GD-6",
    manufactureYear: 2023,
    plateNumber: "3-A88210 AA",
    chassisOrSerialNumber: "AHTFR22G908123772",
    libreCertificateNo: "LIB-AA-2023-4512",
    bolloExpiryDate: "2026-11-30",
    insuranceExpiryDate: "2026-11-30",
    meterUnit: "odometer_km",
    currentMeterReading: 42350,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102942",
    status: "on_rent",
    condition: "good",
    primaryImageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Hilux GD-6"),
    specs: {
      transmission: "manual",
      fuelType: "diesel",
      seats: 5,
      dailyKmLimit: 250,
      driveType: "4x4",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 8.9806,
      lng: 38.7834,
      speed: 48,
      address: "Gotera Interchange en route to Mojo Dry Port",
      status: "moving",
      lastUpdated: "Just now",
    },
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "ast-003",
    ownerId: "tenant-003",
    category: "passenger_car",
    make: "Toyota",
    model: "Corolla Cross Hybrid",
    manufactureYear: 2023,
    plateNumber: "2-C11904 AA",
    chassisOrSerialNumber: "JTMBR31U805012399",
    libreCertificateNo: "LIB-AA-2023-8821",
    bolloExpiryDate: "2027-01-15",
    insuranceExpiryDate: "2027-01-15",
    meterUnit: "odometer_km",
    currentMeterReading: 14820,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102943",
    status: "available",
    condition: "excellent",
    primaryImageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Corolla Cross"),
    partnerInfo: {
      ownerName: "Ato Dawit Haile",
      ownerPhone: "+251911998877",
      ownerTier: "individual_host",
      region: "Addis Ababa / Kazanchis",
      commissionPct: 15.0,
      libreDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
      deliveryClearance: {
        paymentMethod: "Telebirr SuperApp",
        bankName: "Bank of Abyssinia",
        accountNumber: "5049382710",
        durationAvailableMonths: 12,
        confirmed: true,
      },
    },
    specs: {
      transmission: "automatic",
      fuelType: "benzin",
      seats: 5,
      dailyKmLimit: 200,
      driveType: "FWD",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0227,
      lng: 38.7468,
      speed: 0,
      address: "Kazanchis Super Host Hub, Addis Ababa",
      status: "idle",
      lastUpdated: "12 mins ago",
    },
    createdAt: "2026-02-12T08:00:00Z",
  },
  {
    id: "ast-004",
    ownerId: "tenant-001",
    category: "heavy_machinery",
    make: "Caterpillar",
    model: "320D Tracked Hydraulic Excavator",
    manufactureYear: 2022,
    plateNumber: "SPL-04891 AA",
    chassisOrSerialNumber: "CAT0320DPKL982144",
    libreCertificateNo: "LIB-HM-2022-7712",
    bolloExpiryDate: "2027-06-30",
    insuranceExpiryDate: "2027-06-30",
    meterUnit: "engine_hours",
    currentMeterReading: 3420,
    requiresCompanyOperator: true,
    gpsTrackerImei: "865492049102944",
    status: "on_rent",
    condition: "excellent",
    primaryImageUrl: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("machinery", "CAT 320D Excavator"),
    specs: {
      operatingWeightTons: 21.8,
      bucketCapacityM3: 1.2,
      dailyEngineHourCap: 8,
      idleDayMinimumHours: 4,
      hydraulicAuxLines: true,
      enginePowerHp: 148,
    },
    gpsLocation: {
      lat: 9.0435,
      lng: 38.8682,
      speed: 4,
      address: "Ayat Commercial Complex Site 4, Addis Ababa",
      status: "moving",
      lastUpdated: "3 mins ago",
    },
    createdAt: "2026-01-08T08:00:00Z",
  },
  {
    id: "ast-005",
    ownerId: "tenant-001",
    parentAssetId: "ast-004", // Attached to CAT 320D
    category: "attachment",
    make: "Caterpillar",
    model: "H120Es Hydraulic Rock Breaker",
    manufactureYear: 2023,
    plateNumber: "ATT-CAT-120",
    chassisOrSerialNumber: "HB120ES-ET-99410",
    meterUnit: "calendar_days_only",
    currentMeterReading: 120,
    requiresCompanyOperator: false,
    status: "on_rent",
    condition: "good",
    primaryImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("attachment", "CAT H120Es Breaker"),
    specs: {
      operatingWeightTons: 1.6,
      hydraulicAuxLines: true,
    },
    createdAt: "2026-01-08T08:00:00Z",
  },
  {
    id: "ast-006",
    ownerId: "tenant-002",
    category: "heavy_machinery",
    make: "Komatsu",
    model: "PC200-8 Hydraulic Excavator",
    manufactureYear: 2021,
    plateNumber: "SPL-03120 AA",
    chassisOrSerialNumber: "KOMPC200-8-C882194",
    libreCertificateNo: "LIB-HM-2021-3390",
    bolloExpiryDate: "2026-12-31",
    insuranceExpiryDate: "2026-12-31",
    meterUnit: "engine_hours",
    currentMeterReading: 4110,
    requiresCompanyOperator: true,
    gpsTrackerImei: "865492049102946",
    status: "available",
    condition: "good",
    primaryImageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("machinery", "Komatsu PC200-8"),
    partnerInfo: {
      ownerName: "Abyssinia Heavy Equipment Partners",
      ownerPhone: "+251911445566",
      ownerTier: "corporate_partner",
      region: "Addis Ababa / Kality",
      commissionPct: 10.0,
      libreDocUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
      deliveryClearance: {
        paymentMethod: "Bank Transfer",
        bankName: "Awash Bank",
        accountNumber: "01320495839200",
        durationAvailableMonths: 24,
        confirmed: true,
      },
    },
    specs: {
      operatingWeightTons: 20.0,
      bucketCapacityM3: 1.0,
      dailyEngineHourCap: 8,
      idleDayMinimumHours: 4,
      hydraulicAuxLines: true,
      enginePowerHp: 140,
    },
    gpsLocation: {
      lat: 8.8951,
      lng: 38.7421,
      speed: 0,
      address: "Kality Industrial Ring Logistics Park",
      status: "idle",
      lastUpdated: "18 mins ago",
    },
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "ast-007",
    ownerId: "tenant-001",
    category: "heavy_machinery",
    make: "SDLG",
    model: "L956F Heavy Wheel Loader",
    manufactureYear: 2023,
    plateNumber: "SPL-05118 AA",
    chassisOrSerialNumber: "SDLG956F-2023-110",
    libreCertificateNo: "LIB-HM-2023-6677",
    bolloExpiryDate: "2027-03-31",
    insuranceExpiryDate: "2027-03-31",
    meterUnit: "engine_hours",
    currentMeterReading: 2890,
    requiresCompanyOperator: true,
    gpsTrackerImei: "865492049102947",
    status: "available",
    condition: "brand_new",
    primaryImageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("machinery", "SDLG 956L Loader"),
    specs: {
      operatingWeightTons: 17.5,
      bucketCapacityM3: 3.0,
      dailyEngineHourCap: 8,
      idleDayMinimumHours: 4,
      enginePowerHp: 220,
    },
    gpsLocation: {
      lat: 8.7512,
      lng: 38.9814,
      speed: 0,
      address: "Bishoftu Expressway Quarry Section",
      status: "idle",
      lastUpdated: "25 mins ago",
    },
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "ast-008",
    ownerId: "tenant-001",
    category: "power_equipment",
    make: "Caterpillar",
    model: "DE250GC 250kVA Silent Generator",
    manufactureYear: 2022,
    plateNumber: "GEN-250KVA-01",
    chassisOrSerialNumber: "CAT-GEN-250KVA-8812",
    meterUnit: "engine_hours",
    currentMeterReading: 4255,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102948",
    status: "maintenance",
    condition: "fair",
    primaryImageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("machinery", "CAT 250kVA Generator"),
    specs: {
      enginePowerHp: 320,
      fuelType: "diesel",
    },
    gpsLocation: {
      lat: 9.0012,
      lng: 38.7554,
      speed: 0,
      address: "DEL Central Workshop, Kera, Addis Ababa",
      status: "idle",
      lastUpdated: "1 hour ago",
    },
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "ast-009",
    ownerId: "tenant-002",
    category: "heavy_machinery",
    make: "Shantui",
    model: "SD22 Crawler Bulldozer",
    manufactureYear: 2022,
    plateNumber: "SPL-02944 AA",
    chassisOrSerialNumber: "SHAN-SD22-2022-771",
    libreCertificateNo: "LIB-HM-2022-9901",
    meterUnit: "engine_hours",
    currentMeterReading: 3100,
    requiresCompanyOperator: true,
    gpsTrackerImei: "865492049102949",
    status: "on_rent",
    condition: "good",
    primaryImageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("machinery", "Shantui SD22 Bulldozer"),
    specs: {
      operatingWeightTons: 23.4,
      dailyEngineHourCap: 8,
      idleDayMinimumHours: 4,
      enginePowerHp: 220,
    },
    gpsLocation: {
      lat: 8.5412,
      lng: 39.2711,
      speed: 2,
      address: "Adama Smart City Bypass (Geofence Breach Alert)",
      status: "geofence_breach",
      lastUpdated: "1 min ago",
    },
    createdAt: "2026-02-05T08:00:00Z",
  },
  {
    id: "ast-010",
    ownerId: "tenant-001",
    category: "passenger_car",
    make: "Toyota",
    model: "Avanza Veloz 1.5 MT (Best Seller)",
    manufactureYear: 2023,
    plateNumber: "2-B90112 AA",
    chassisOrSerialNumber: "AVZ-ET-2023-88124",
    libreCertificateNo: "LIB-AA-2023-9011",
    bolloExpiryDate: "2027-02-28",
    insuranceExpiryDate: "2027-02-28",
    meterUnit: "odometer_km",
    currentMeterReading: 22400,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102950",
    status: "available",
    condition: "excellent",
    primaryImageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Avanza Veloz"),
    specs: {
      transmission: "manual",
      fuelType: "benzin",
      seats: 7,
      dailyKmLimit: 200,
      driveType: "FWD",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0125,
      lng: 38.7645,
      speed: 0,
      address: "Bole Central Depot Yard 2, Addis Ababa",
      status: "idle",
      lastUpdated: "10 mins ago",
    },
    createdAt: "2026-01-20T08:00:00Z",
  },
  {
    id: "ast-011",
    ownerId: "tenant-001",
    category: "passenger_car",
    make: "Toyota",
    model: "Innova Reborn 2.4 Diesel AT (Promo)",
    manufactureYear: 2024,
    plateNumber: "3-C44190 AA",
    chassisOrSerialNumber: "INNV-ET-2024-55410",
    libreCertificateNo: "LIB-AA-2024-4419",
    bolloExpiryDate: "2027-05-31",
    insuranceExpiryDate: "2027-05-31",
    meterUnit: "odometer_km",
    currentMeterReading: 9800,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102951",
    status: "available",
    condition: "brand_new",
    primaryImageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Innova Reborn"),
    specs: {
      transmission: "automatic",
      fuelType: "diesel",
      seats: 7,
      dailyKmLimit: 200,
      driveType: "RWD",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0201,
      lng: 38.7512,
      speed: 0,
      address: "Bole Airport Executive Terminal, Addis Ababa",
      status: "idle",
      lastUpdated: "8 mins ago",
    },
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "ast-012",
    ownerId: "tenant-001",
    category: "suv_4x4",
    make: "Toyota",
    model: "Fortuner 2.8 4x4 VRZ Luxury",
    manufactureYear: 2024,
    plateNumber: "3-B77123 AA",
    chassisOrSerialNumber: "FTN-ET-2024-99014",
    libreCertificateNo: "LIB-AA-2024-7712",
    bolloExpiryDate: "2027-07-31",
    insuranceExpiryDate: "2027-07-31",
    meterUnit: "odometer_km",
    currentMeterReading: 12500,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102952",
    status: "available",
    condition: "brand_new",
    primaryImageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Toyota Fortuner VRZ"),
    specs: {
      transmission: "automatic",
      fuelType: "diesel",
      seats: 7,
      dailyKmLimit: 250,
      driveType: "4x4",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0098,
      lng: 38.7712,
      speed: 0,
      address: "Bole Atlas Luxury Hub, Addis Ababa",
      status: "idle",
      lastUpdated: "4 mins ago",
    },
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "ast-013",
    ownerId: "tenant-003",
    category: "passenger_car",
    make: "Mitsubishi",
    model: "Xpander Cross AT",
    manufactureYear: 2023,
    plateNumber: "2-A33819 AA",
    chassisOrSerialNumber: "XPND-ET-2023-33819",
    libreCertificateNo: "LIB-AA-2023-3381",
    bolloExpiryDate: "2027-01-31",
    insuranceExpiryDate: "2027-01-31",
    meterUnit: "odometer_km",
    currentMeterReading: 17300,
    requiresCompanyOperator: false,
    gpsTrackerImei: "865492049102953",
    status: "available",
    condition: "excellent",
    primaryImageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    images8Sides: generateMock8Sides("car", "Mitsubishi Xpander Cross"),
    partnerInfo: {
      ownerName: "Ato Dawit Haile",
      ownerPhone: "+251911998877",
      ownerTier: "individual_host",
      region: "Addis Ababa / Kazanchis",
      commissionPct: 15.0,
      deliveryClearance: {
        paymentMethod: "Telebirr SuperApp",
        bankName: "Bank of Abyssinia",
        accountNumber: "5049382710",
        durationAvailableMonths: 12,
        confirmed: true,
      },
    },
    specs: {
      transmission: "automatic",
      fuelType: "benzin",
      seats: 6,
      dailyKmLimit: 200,
      driveType: "FWD",
      hasAirConditioning: true,
    },
    gpsLocation: {
      lat: 9.0210,
      lng: 38.7480,
      speed: 0,
      address: "Kazanchis Super Host Hub, Addis Ababa",
      status: "idle",
      lastUpdated: "15 mins ago",
    },
    createdAt: "2026-02-14T08:00:00Z",
  },
];

export const INITIAL_RATE_CARDS: Record<string, AssetRateCard> = {
  "ast-001": {
    id: "rc-001",
    assetId: "ast-001",
    dailyRate: 16500,
    weeklyRate: 99000,
    monthlyRate: 360000,
    includedMeterUnitsPerDay: 200,
    overtimeRatePerUnit: 45,
    operatorDailyRate: 1500,
    operatorPerDiemRate: 1200,
    defaultMobilizationFee: 0,
    securityDepositAmount: 50000,
  },
  "ast-002": {
    id: "rc-002",
    assetId: "ast-002",
    dailyRate: 8500,
    weeklyRate: 51000,
    monthlyRate: 190000,
    includedMeterUnitsPerDay: 250,
    overtimeRatePerUnit: 35,
    operatorDailyRate: 1200,
    operatorPerDiemRate: 1000,
    defaultMobilizationFee: 0,
    securityDepositAmount: 30000,
  },
  "ast-003": {
    id: "rc-003",
    assetId: "ast-003",
    dailyRate: 6000,
    weeklyRate: 36000,
    monthlyRate: 135000,
    includedMeterUnitsPerDay: 200,
    overtimeRatePerUnit: 30,
    operatorDailyRate: 1000,
    operatorPerDiemRate: 800,
    defaultMobilizationFee: 0,
    securityDepositAmount: 25000,
  },
  "ast-004": {
    id: "rc-004",
    assetId: "ast-004",
    dailyRate: 38000,
    weeklyRate: 235000,
    monthlyRate: 850000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 4800,
    idleDayMinimumHours: 4,
    operatorDailyRate: 2500,
    operatorPerDiemRate: 1500,
    defaultMobilizationFee: 28000,
    securityDepositAmount: 150000,
  },
  "ast-005": {
    id: "rc-005",
    assetId: "ast-005",
    dailyRate: 12000,
    weeklyRate: 72000,
    monthlyRate: 250000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 1500,
    operatorDailyRate: 0,
    operatorPerDiemRate: 0,
    defaultMobilizationFee: 5000,
    securityDepositAmount: 60000,
  },
  "ast-006": {
    id: "rc-006",
    assetId: "ast-006",
    dailyRate: 36000,
    weeklyRate: 220000,
    monthlyRate: 800000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 4500,
    idleDayMinimumHours: 4,
    operatorDailyRate: 2500,
    operatorPerDiemRate: 1500,
    defaultMobilizationFee: 28000,
    securityDepositAmount: 150000,
  },
  "ast-007": {
    id: "rc-007",
    assetId: "ast-007",
    dailyRate: 26000,
    weeklyRate: 160000,
    monthlyRate: 580000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 3400,
    idleDayMinimumHours: 4,
    operatorDailyRate: 2000,
    operatorPerDiemRate: 1200,
    defaultMobilizationFee: 24000,
    securityDepositAmount: 120000,
  },
  "ast-008": {
    id: "rc-008",
    assetId: "ast-008",
    dailyRate: 14000,
    weeklyRate: 85000,
    monthlyRate: 310000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 1800,
    operatorDailyRate: 1000,
    operatorPerDiemRate: 800,
    defaultMobilizationFee: 8000,
    securityDepositAmount: 70000,
  },
  "ast-009": {
    id: "rc-009",
    assetId: "ast-009",
    dailyRate: 42000,
    weeklyRate: 250000,
    monthlyRate: 920000,
    includedMeterUnitsPerDay: 8,
    overtimeRatePerUnit: 5200,
    idleDayMinimumHours: 4,
    operatorDailyRate: 2500,
    operatorPerDiemRate: 1500,
    defaultMobilizationFee: 32000,
    securityDepositAmount: 180000,
  },
  "ast-010": {
    id: "rc-010",
    assetId: "ast-010",
    dailyRate: 3500, // Avanza Veloz 1.5 MT (Best Seller)
    weeklyRate: 21000,
    monthlyRate: 75000,
    includedMeterUnitsPerDay: 200,
    overtimeRatePerUnit: 25,
    operatorDailyRate: 1000,
    operatorPerDiemRate: 800,
    defaultMobilizationFee: 0,
    securityDepositAmount: 20000,
  },
  "ast-011": {
    id: "rc-011",
    assetId: "ast-011",
    dailyRate: 6500, // Innova Reborn 2.4 Diesel AT (Promo)
    weeklyRate: 39000,
    monthlyRate: 140000,
    includedMeterUnitsPerDay: 200,
    overtimeRatePerUnit: 35,
    operatorDailyRate: 1200,
    operatorPerDiemRate: 1000,
    defaultMobilizationFee: 0,
    securityDepositAmount: 30000,
  },
  "ast-012": {
    id: "rc-012",
    assetId: "ast-012",
    dailyRate: 12000, // Fortuner 2.8 4x4 VRZ Luxury
    weeklyRate: 72000,
    monthlyRate: 260000,
    includedMeterUnitsPerDay: 250,
    overtimeRatePerUnit: 40,
    operatorDailyRate: 1500,
    operatorPerDiemRate: 1200,
    defaultMobilizationFee: 0,
    securityDepositAmount: 45000,
  },
  "ast-013": {
    id: "rc-013",
    assetId: "ast-013",
    dailyRate: 4500, // Mitsubishi Xpander Cross AT
    weeklyRate: 27000,
    monthlyRate: 98000,
    includedMeterUnitsPerDay: 200,
    overtimeRatePerUnit: 30,
    operatorDailyRate: 1000,
    operatorPerDiemRate: 800,
    defaultMobilizationFee: 0,
    securityDepositAmount: 22000,
  },
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "bkg-101",
    bookingReference: "DEL-BKG-2026-0089",
    renterId: "usr-007",
    renterName: "MIDROC Construction Ethiopia",
    renterPhone: "+251911554433",
    status: "active",
    bookingChannel: "internal_desk",
    pickupLocation: "Bole Central Yard, Addis Ababa",
    dropoffLocation: "Ayat Commercial Complex Site 4, Addis Ababa",
    projectSiteRegion: "Addis Ababa / Oromia Border",
    isOutOfCity: true,
    createdAt: "2026-10-20T09:00:00Z",
  },
  {
    id: "bkg-102",
    bookingReference: "DEL-BKG-2026-0090",
    renterId: "usr-007",
    renterName: "MIDROC Construction Ethiopia",
    renterPhone: "+251911554433",
    status: "active",
    bookingChannel: "internal_desk",
    pickupLocation: "Bole Central Yard",
    dropoffLocation: "Mojo Industrial Sub-station",
    projectSiteRegion: "Mojo / East Shewa",
    isOutOfCity: true,
    createdAt: "2026-10-21T10:00:00Z",
  },
  {
    id: "bkg-103",
    bookingReference: "DEL-BKG-2026-0091",
    renterId: "usr-008",
    renterName: "Dawit Haile",
    renterPhone: "+251911998877",
    status: "confirmed",
    bookingChannel: "online_portal",
    pickupLocation: "Bole International Airport VIP Gate",
    dropoffLocation: "Skylight Hotel, Bole",
    projectSiteRegion: "Addis Ababa",
    isOutOfCity: false,
    createdAt: "2026-10-22T14:30:00Z",
  },
  {
    id: "bkg-104",
    bookingReference: "DEL-BKG-2026-0092",
    renterId: "usr-008",
    renterName: "Embassy of the Netherlands (Diplomatic Delegation)",
    renterPhone: "+251911224466",
    status: "confirmed",
    bookingChannel: "internal_desk",
    pickupLocation: "Bole Diplomatic Depot",
    dropoffLocation: "African Union Conference Center",
    projectSiteRegion: "Addis Ababa",
    isOutOfCity: false,
    createdAt: "2026-10-23T08:30:00Z",
  },
  {
    id: "bkg-105",
    bookingReference: "DEL-BKG-2026-0093",
    renterId: "usr-007",
    renterName: "Yared Woldeyesus (NGO Field Coordinator)",
    renterPhone: "+251922334455",
    status: "active",
    bookingChannel: "online_portal",
    pickupLocation: "Bole Central Yard",
    dropoffLocation: "Bishoftu Field Training Center",
    projectSiteRegion: "Bishoftu Corridor",
    isOutOfCity: true,
    createdAt: "2026-10-24T09:15:00Z",
  },
  {
    id: "bkg-106",
    bookingReference: "DEL-BKG-2026-0094",
    renterId: "usr-007",
    renterName: "Sur Construction PLC",
    renterPhone: "+251911883322",
    status: "active",
    bookingChannel: "internal_desk",
    pickupLocation: "Central Heavy Yard, Kality",
    dropoffLocation: "Adama Expressway Expansion Site 2",
    projectSiteRegion: "Adama Corridor",
    isOutOfCity: true,
    createdAt: "2026-10-15T11:00:00Z",
  },
  {
    id: "bkg-107",
    bookingReference: "DEL-BKG-2026-0095",
    renterId: "usr-007",
    renterName: "Oromia Roads Authority Project",
    renterPhone: "+251911445566",
    status: "confirmed",
    bookingChannel: "internal_desk",
    pickupLocation: "Modjo Dry Port Depot",
    dropoffLocation: "Batu-Hawassa Highway Mile 42",
    projectSiteRegion: "Hawassa Corridor",
    isOutOfCity: true,
    createdAt: "2026-10-18T10:00:00Z",
  },
  {
    id: "bkg-108",
    bookingReference: "DEL-BKG-2026-0096",
    renterId: "usr-007",
    renterName: "Defense Construction Enterprise",
    renterPhone: "+251911778899",
    status: "active",
    bookingChannel: "internal_desk",
    pickupLocation: "Akaki Heavy Yard",
    dropoffLocation: "Wolkite Quarry Infrastructure Zone",
    projectSiteRegion: "Wolkite Corridor",
    isOutOfCity: true,
    createdAt: "2026-10-22T08:00:00Z",
  },
  {
    id: "bkg-109",
    bookingReference: "DEL-BKG-2026-0097",
    renterId: "usr-008",
    renterName: "African Union Summit Delegation",
    renterPhone: "+251933557799",
    status: "confirmed",
    bookingChannel: "online_portal",
    pickupLocation: "Bole Airport Executive Terminal",
    dropoffLocation: "Sheraton Addis Hotel",
    projectSiteRegion: "Addis Ababa",
    isOutOfCity: false,
    createdAt: "2026-10-20T14:00:00Z",
  },
];

export const INITIAL_BOOKING_ITEMS: BookingItem[] = [
  {
    id: "bki-101a",
    bookingId: "bkg-101",
    assetId: "ast-004", // CAT 320D
    assignedOperatorId: "opr-001", // Kebede Alemu
    rentalPeriodStart: "2026-10-20T08:00:00Z",
    rentalPeriodEnd: "2026-10-28T18:00:00Z",
    itemStatus: "active",
    meterStart: 3380,
    meterEnd: undefined,
    mobilizationFeeCharged: 28000,
  },
  {
    id: "bki-101b",
    bookingId: "bkg-101",
    assetId: "ast-005", // CAT Breaker
    assignedOperatorId: null,
    rentalPeriodStart: "2026-10-20T08:00:00Z",
    rentalPeriodEnd: "2026-10-28T18:00:00Z",
    itemStatus: "active",
    meterStart: 110,
    mobilizationFeeCharged: 5000,
  },
  {
    id: "bki-102a",
    bookingId: "bkg-102",
    assetId: "ast-002", // Hilux
    assignedOperatorId: "opr-003", // Girma Wolde
    rentalPeriodStart: "2026-10-21T08:00:00Z",
    rentalPeriodEnd: "2026-10-25T18:00:00Z",
    itemStatus: "active",
    meterStart: 42100,
    mobilizationFeeCharged: 0,
  },
  {
    id: "bki-103a",
    bookingId: "bkg-103",
    assetId: "ast-001", // Land Cruiser
    assignedOperatorId: "opr-003",
    rentalPeriodStart: "2026-10-26T08:00:00Z",
    rentalPeriodEnd: "2026-10-29T18:00:00Z",
    itemStatus: "confirmed",
    meterStart: 18450,
    mobilizationFeeCharged: 0,
  },
  {
    id: "bki-104a",
    bookingId: "bkg-104",
    assetId: "ast-003", // Prado TXL
    assignedOperatorId: "opr-003",
    rentalPeriodStart: "2026-10-23T08:00:00Z",
    rentalPeriodEnd: "2026-10-27T18:00:00Z",
    itemStatus: "confirmed",
    meterStart: 28300,
    mobilizationFeeCharged: 0,
  },
  {
    id: "bki-105a",
    bookingId: "bkg-105",
    assetId: "ast-010", // Avanza Veloz
    assignedOperatorId: null, // Self drive
    rentalPeriodStart: "2026-10-24T08:00:00Z",
    rentalPeriodEnd: "2026-10-31T18:00:00Z",
    itemStatus: "active",
    meterStart: 22400,
    mobilizationFeeCharged: 0,
  },
  {
    id: "bki-106a",
    bookingId: "bkg-106",
    assetId: "ast-006", // Shantui SD22 Dozer
    assignedOperatorId: "opr-002", // Teshale Bogale (Special Mobile Machinery)
    rentalPeriodStart: "2026-10-15T08:00:00Z",
    rentalPeriodEnd: "2026-10-27T18:00:00Z",
    itemStatus: "active",
    meterStart: 1820,
    mobilizationFeeCharged: 28000,
  },
  {
    id: "bki-107a",
    bookingId: "bkg-107",
    assetId: "ast-007", // SDLG 956L Loader
    assignedOperatorId: "opr-001", // Kebede Alemu
    rentalPeriodStart: "2026-10-18T08:00:00Z",
    rentalPeriodEnd: "2026-10-25T18:00:00Z",
    itemStatus: "confirmed",
    meterStart: 2450,
    mobilizationFeeCharged: 24000,
  },
  {
    id: "bki-108a",
    bookingId: "bkg-108",
    assetId: "ast-008", // CAT 140K Grader
    assignedOperatorId: "opr-002", // Teshale Bogale
    rentalPeriodStart: "2026-10-22T08:00:00Z",
    rentalPeriodEnd: "2026-11-05T18:00:00Z",
    itemStatus: "active",
    meterStart: 4210,
    mobilizationFeeCharged: 28000,
  },
  {
    id: "bki-109a",
    bookingId: "bkg-109",
    assetId: "ast-011", // Innova Reborn
    assignedOperatorId: "opr-003",
    rentalPeriodStart: "2026-10-20T08:00:00Z",
    rentalPeriodEnd: "2026-10-27T18:00:00Z",
    itemStatus: "confirmed",
    meterStart: 9800,
    mobilizationFeeCharged: 0,
  },
];

export const INITIAL_COLLATERALS: BookingCollateral[] = [
  {
    id: "col-101",
    bookingId: "bkg-101",
    collateralType: "bank_guarantee",
    amount: 500000,
    bankName: "Commercial Bank of Ethiopia",
    instrumentReference: "BG-CBE-2026-88491",
    contractDocumentUrl: "/contracts/Scanned-Franco-Valuta.pdf",
    contractDocumentName: "Scanned-Franco Valuta.pdf",
    contractDocumentSize: "449 KB",
    contractDocumentType: "pdf",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-20T08:30:00Z",
    createdAt: "2026-10-20T08:00:00Z",
  },
  {
    id: "col-102",
    bookingId: "bkg-102",
    collateralType: "corporate_po",
    amount: 100000,
    bankName: "Awash Bank",
    instrumentReference: "PO-MIDROC-9921",
    contractDocumentUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    contractDocumentName: "Corporate_PO_Stamp.png",
    contractDocumentSize: "820 KB",
    contractDocumentType: "image",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-21T08:15:00Z",
    createdAt: "2026-10-21T08:00:00Z",
  },
  {
    id: "col-103",
    bookingId: "bkg-103",
    collateralType: "personal_guarantor_was",
    amount: 250000,
    guarantorFullName: "Ato Tadesse Haile (Civil Engineer)",
    guarantorPhone: "+251911332211",
    guarantorFaydaFin: "FIN-9482-1049-3321",
    guarantorEmployerTin: "0011882244",
    contractDocumentUrl: "/contracts/was-guarantor-affidavit.pdf",
    contractDocumentName: "Irrevocable_Guarantor_Affidavit.pdf",
    contractDocumentSize: "1.2 MB",
    contractDocumentType: "pdf",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-22T16:00:00Z",
    createdAt: "2026-10-22T15:00:00Z",
  },
  {
    id: "col-104",
    bookingId: "bkg-104",
    collateralType: "cash_cpo",
    amount: 300000,
    bankName: "Awash Bank S.C.",
    instrumentReference: "CPO-AWASH-2026-4412",
    contractDocumentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    contractDocumentName: "Bank_CPO_Awash_Signed.png",
    contractDocumentSize: "612 KB",
    contractDocumentType: "image",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-23T10:00:00Z",
    createdAt: "2026-10-23T09:15:00Z",
  },
  {
    id: "col-105",
    bookingId: "bkg-105",
    collateralType: "personal_guarantor_was",
    amount: 150000,
    guarantorFullName: "W/ro Selamawit Desta",
    guarantorPhone: "+251912445566",
    guarantorFaydaFin: "FIN-1122-3344-5566",
    contractDocumentUrl: "/contracts/Avanza_SelfDrive_Agreement.pdf",
    contractDocumentName: "Avanza_SelfDrive_Agreement.pdf",
    contractDocumentSize: "980 KB",
    contractDocumentType: "pdf",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-24T09:00:00Z",
    createdAt: "2026-10-24T08:30:00Z",
  },
  {
    id: "col-106",
    bookingId: "bkg-106",
    collateralType: "bank_guarantee",
    amount: 800000,
    bankName: "Commercial Bank of Ethiopia",
    instrumentReference: "BG-CBE-2026-99302",
    contractDocumentUrl: "/contracts/Sur_Shantui_Lease_Deed.pdf",
    contractDocumentName: "Sur_Shantui_Lease_Deed.pdf",
    contractDocumentSize: "2.8 MB",
    contractDocumentType: "pdf",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-15T09:30:00Z",
    createdAt: "2026-10-15T08:00:00Z",
  },
  {
    id: "col-107",
    bookingId: "bkg-107",
    collateralType: "corporate_po",
    amount: 350000,
    bankName: "Bank of Abyssinia",
    instrumentReference: "PO-BOA-2026-7714",
    contractDocumentUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    contractDocumentName: "Loader_Inspection_Collateral.jpg",
    contractDocumentSize: "1.4 MB",
    contractDocumentType: "image",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-18T08:45:00Z",
    createdAt: "2026-10-18T08:00:00Z",
  },
  {
    id: "col-108",
    bookingId: "bkg-108",
    collateralType: "bank_guarantee",
    amount: 600000,
    bankName: "Dashen Bank S.C.",
    instrumentReference: "BG-DASHEN-2026-5521",
    contractDocumentUrl: "/contracts/ERA_Heavy_Grader_Surety.pdf",
    contractDocumentName: "ERA_Heavy_Grader_Surety.pdf",
    contractDocumentSize: "3.1 MB",
    contractDocumentType: "pdf",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-22T09:00:00Z",
    createdAt: "2026-10-22T08:00:00Z",
  },
  {
    id: "col-109",
    bookingId: "bkg-109",
    collateralType: "cash_cpo",
    amount: 180000,
    bankName: "Cooperative Bank of Oromia",
    instrumentReference: "CPO-COOP-2026-3391",
    contractDocumentUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    contractDocumentName: "Innova_Host_Security_Check.png",
    contractDocumentSize: "734 KB",
    contractDocumentType: "image",
    isVerified: true,
    verifiedByUserId: "usr-002",
    verifiedAt: "2026-10-20T08:45:00Z",
    createdAt: "2026-10-20T08:00:00Z",
  },
];

export const INITIAL_MAINTENANCE_SCHEDULES: MaintenanceSchedule[] = [
  {
    id: "mnt-001",
    assetId: "ast-008",
    serviceIntervalHours: 250,
    lastServiceMeter: 4000,
    nextServiceMeter: 4250,
    status: "open",
    isSafetyCriticalLock: true,
    mechanicNotes: "Critical: 250-hour oil & fuel filter replacement overdue. Engine lock engaged by telemetry trigger.",
    mechanicUserId: "usr-006",
    serviceType: "central_garage",
    createdAt: "2026-10-22T08:00:00Z",
  },
  {
    id: "mnt-002",
    assetId: "ast-004",
    serviceIntervalHours: 250,
    lastServiceMeter: 3250,
    nextServiceMeter: 3500,
    status: "open",
    isSafetyCriticalLock: false,
    mechanicNotes: "Scheduled 3,500hr Hydraulic oil check and track tension calibration.",
    mechanicUserId: "usr-006",
    serviceType: "mobile_field",
    createdAt: "2026-10-15T08:00:00Z",
  },
  {
    id: "mnt-003",
    assetId: "ast-001",
    serviceIntervalKm: 5000,
    lastServiceMeter: 15000,
    nextServiceMeter: 20000,
    status: "completed",
    isSafetyCriticalLock: false,
    mechanicNotes: "15,000 KM Toyota genuine synthetic oil and brake pads replaced.",
    mechanicUserId: "usr-006",
    serviceType: "central_garage",
    createdAt: "2026-09-10T08:00:00Z",
  },
];

export const INITIAL_TIMESHEETS: MachineryDailyTimesheet[] = [
  {
    id: "ts-001",
    bookingItemId: "bki-101a",
    timesheetDate: "2026-10-20",
    engineHoursStart: 3380,
    engineHoursEnd: 3388,
    operatingHours: 8,
    idleBreakdownHours: 0,
    siteSupervisorName: "Eng. Samuel Kassa",
    siteSupervisorPhone: "+251911447788",
    siteSignatureUrl: "/signatures/samuel-kassa-sig.png",
    syncedOffline: true,
    createdAt: "2026-10-20T18:30:00Z",
  },
  {
    id: "ts-002",
    bookingItemId: "bki-101a",
    timesheetDate: "2026-10-21",
    engineHoursStart: 3388,
    engineHoursEnd: 3398,
    operatingHours: 10,
    idleBreakdownHours: 0,
    siteSupervisorName: "Eng. Samuel Kassa",
    siteSupervisorPhone: "+251911447788",
    siteSignatureUrl: "/signatures/samuel-kassa-sig.png",
    syncedOffline: false,
    createdAt: "2026-10-21T19:00:00Z",
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    bookingId: "bkg-101",
    invoiceNumber: "INV-DEL-2026-0044",
    baseRentalAmount: 304000,
    overtimeUsageAmount: 9600,
    operatorAndPerDiemAmount: 32000,
    mobilizationAmount: 33000,
    advancePaymentAmount: 120000,
    partnerName: "MIDROC Heavy Equipment Div.",
    partnerPayoutAmount: 290000,
    brokerId: "brk-001",
    brokerName: "Kassahun Belay",
    brokerCommissionPct: 8.0,
    brokerCommissionAmount: 24320,
    paymentMethod: "CBE Bank Draft (Cheque)",
    vat15PctAmount: 56790,
    withholding2PctAmount: 7572,
    withholdingReceiptNo: "WHT-MOR-2026-99214",
    totalPayable: 427818,
    isPaid: true,
    paidAt: "2026-10-21T11:00:00Z",
    createdAt: "2026-10-20T10:00:00Z",
  },
  {
    id: "inv-002",
    bookingId: "bkg-102",
    invoiceNumber: "INV-DEL-2026-0045",
    baseRentalAmount: 34000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 8800,
    mobilizationAmount: 0,
    advancePaymentAmount: 0,
    partnerName: "Addis Fleet Host Partners",
    partnerPayoutAmount: 28900,
    brokerId: "brk-002",
    brokerName: "Alemayehu Tadesse",
    brokerCommissionPct: 7.5,
    brokerCommissionAmount: 2550,
    paymentMethod: "Telebirr SuperApp",
    vat15PctAmount: 6420,
    withholding2PctAmount: 856,
    withholdingReceiptNo: "WHT-MOR-2026-99215",
    totalPayable: 39564,
    isPaid: false,
    createdAt: "2026-10-21T12:00:00Z",
  },
  {
    id: "inv-003",
    bookingId: "bkg-103",
    invoiceNumber: "INV-DEL-2026-0046",
    baseRentalAmount: 42000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 0,
    mobilizationAmount: 0,
    advancePaymentAmount: 48300,
    partnerName: "Ato Dawit Haile",
    partnerPayoutAmount: 35700,
    brokerId: "brk-003",
    brokerName: "Bethlehem Girma",
    brokerCommissionPct: 5.0,
    brokerCommissionAmount: 2100,
    paymentMethod: "Telebirr SuperApp",
    vat15PctAmount: 6300,
    withholding2PctAmount: 0,
    totalPayable: 48300,
    isPaid: true,
    paidAt: "2026-10-22T16:00:00Z",
    createdAt: "2026-10-22T14:45:00Z",
  },
  {
    id: "inv-004",
    bookingId: "bkg-104",
    invoiceNumber: "INV-DEL-2026-0047",
    baseRentalAmount: 48000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 0,
    mobilizationAmount: 0,
    advancePaymentAmount: 55200,
    partnerName: "Ato Dawit Haile",
    partnerPayoutAmount: 40800,
    brokerId: "brk-003",
    brokerName: "Bethlehem Girma",
    brokerCommissionPct: 5.0,
    brokerCommissionAmount: 2400,
    paymentMethod: "Awash RTGS Transfer",
    vat15PctAmount: 7200,
    withholding2PctAmount: 0,
    totalPayable: 55200,
    isPaid: true,
    paidAt: "2026-10-23T11:00:00Z",
    createdAt: "2026-10-23T09:00:00Z",
  },
  {
    id: "inv-005",
    bookingId: "bkg-105",
    invoiceNumber: "INV-DEL-2026-0048",
    baseRentalAmount: 28000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 0,
    mobilizationAmount: 0,
    advancePaymentAmount: 10000,
    partnerName: "Elite City Motors",
    partnerPayoutAmount: 23800,
    brokerId: "brk-002",
    brokerName: "Alemayehu Tadesse",
    brokerCommissionPct: 7.5,
    brokerCommissionAmount: 2100,
    paymentMethod: "CBE Birr",
    vat15PctAmount: 4200,
    withholding2PctAmount: 0,
    totalPayable: 32200,
    isPaid: false,
    createdAt: "2026-10-24T09:30:00Z",
  },
  {
    id: "inv-006",
    bookingId: "bkg-106",
    invoiceNumber: "INV-DEL-2026-0049",
    baseRentalAmount: 384000,
    overtimeUsageAmount: 16000,
    operatorAndPerDiemAmount: 24000,
    mobilizationAmount: 28000,
    advancePaymentAmount: 145000,
    partnerName: "Sur Construction Heavy Plant",
    partnerPayoutAmount: 345600,
    brokerId: "brk-001",
    brokerName: "Kassahun Belay",
    brokerCommissionPct: 8.0,
    brokerCommissionAmount: 30720,
    paymentMethod: "CBE Bank Draft (Cheque)",
    vat15PctAmount: 67800,
    withholding2PctAmount: 9040,
    withholdingReceiptNo: "WHT-MOR-2026-99216",
    totalPayable: 486760,
    isPaid: true,
    paidAt: "2026-10-16T14:00:00Z",
    createdAt: "2026-10-15T12:00:00Z",
  },
  {
    id: "inv-007",
    bookingId: "bkg-107",
    invoiceNumber: "INV-DEL-2026-0050",
    baseRentalAmount: 182000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 14000,
    mobilizationAmount: 24000,
    advancePaymentAmount: 75000,
    partnerName: "Abyssinia Heavy Equipment Partners",
    partnerPayoutAmount: 154700,
    brokerId: "brk-004",
    brokerName: "Solomon Worku",
    brokerCommissionPct: 10.0,
    brokerCommissionAmount: 18200,
    paymentMethod: "Awash RTGS Transfer",
    vat15PctAmount: 33000,
    withholding2PctAmount: 4400,
    withholdingReceiptNo: "WHT-MOR-2026-99217",
    totalPayable: 248600,
    isPaid: true,
    paidAt: "2026-10-18T12:00:00Z",
    createdAt: "2026-10-18T10:30:00Z",
  },
  {
    id: "inv-008",
    bookingId: "bkg-108",
    invoiceNumber: "INV-DEL-2026-0051",
    baseRentalAmount: 406000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 28000,
    mobilizationAmount: 28000,
    advancePaymentAmount: 155000,
    partnerName: "Sur Construction Heavy Plant",
    partnerPayoutAmount: 345100,
    brokerId: "brk-005",
    brokerName: "Mulugeta Assefa",
    brokerCommissionPct: 6.0,
    brokerCommissionAmount: 24360,
    paymentMethod: "Bank of Abyssinia CPO",
    vat15PctAmount: 69300,
    withholding2PctAmount: 9240,
    totalPayable: 522060,
    isPaid: false,
    createdAt: "2026-10-22T08:30:00Z",
  },
  {
    id: "inv-009",
    bookingId: "bkg-109",
    invoiceNumber: "INV-DEL-2026-0052",
    baseRentalAmount: 35000,
    overtimeUsageAmount: 0,
    operatorAndPerDiemAmount: 0,
    mobilizationAmount: 0,
    advancePaymentAmount: 40250,
    partnerName: "Ato Dawit Haile",
    partnerPayoutAmount: 29750,
    brokerId: "brk-003",
    brokerName: "Bethlehem Girma",
    brokerCommissionPct: 5.0,
    brokerCommissionAmount: 1750,
    paymentMethod: "Telebirr QR Dynamic",
    vat15PctAmount: 5250,
    withholding2PctAmount: 0,
    totalPayable: 40250,
    isPaid: true,
    paidAt: "2026-10-20T15:30:00Z",
    createdAt: "2026-10-20T14:30:00Z",
  },
];

export const INITIAL_SETTLEMENTS: OwnerSettlementLedger[] = [
  {
    id: "stl-001",
    invoiceId: "inv-001",
    ownerId: "tenant-001",
    ownerName: "DEL Internal Fleet",
    grossRevenue: 378600,
    platformCommissionPct: 0.0,
    platformCommissionAmount: 0.0,
    workshopRepairDeduction: 0.0,
    netPayoutAmount: 378600,
    settlementStatus: "approved",
    disbursedAt: "2026-10-21T12:00:00Z",
    createdAt: "2026-10-21T11:15:00Z",
  },
  {
    id: "stl-002",
    invoiceId: "inv-002",
    ownerId: "tenant-002",
    ownerName: "Abyssinia Heavy Equipment Partners",
    grossRevenue: 42800,
    platformCommissionPct: 10.0,
    platformCommissionAmount: 4280,
    workshopRepairDeduction: 1500,
    netPayoutAmount: 37020,
    settlementStatus: "pending",
    createdAt: "2026-10-21T12:30:00Z",
  },
];

// Initial Inspections: Seed both a check-out and check-in to support comparison!
export const INITIAL_INSPECTIONS: AssetInspection[] = [
  {
    id: "insp-001",
    bookingItemId: "bki-101a",
    inspectionType: "check_out",
    inspectorUserId: "opr-001",
    inspectorName: "Kebede Alemu",
    meterReading: 3380,
    fuelPercentage: 100,
    damageMarkers: [
      {
        id: "dm-chkout-1",
        x: 35,
        y: 42,
        partName: "Hydraulic Boom Cylinder",
        severity: "minor_scratch",
        notes: "Pre-existing scratch on hydraulic ram casing.",
      },
    ],
    walkaroundPhotos: [
      { angle: "front", url: generateMock8Sides("machinery", "CAT 320D").front, timestamp: "2026-10-20T08:00:00Z" },
      { angle: "front_right", url: generateMock8Sides("machinery", "CAT 320D").front_right, timestamp: "2026-10-20T08:05:00Z" },
      { angle: "right_side", url: generateMock8Sides("machinery", "CAT 320D").right_side, timestamp: "2026-10-20T08:10:00Z" },
      { angle: "rear_right", url: generateMock8Sides("machinery", "CAT 320D").rear_right, timestamp: "2026-10-20T08:15:00Z" },
      { angle: "rear", url: generateMock8Sides("machinery", "CAT 320D").rear, timestamp: "2026-10-20T08:20:00Z" },
      { angle: "rear_left", url: generateMock8Sides("machinery", "CAT 320D").rear_left, timestamp: "2026-10-20T08:25:00Z" },
      { angle: "left_side", url: generateMock8Sides("machinery", "CAT 320D").left_side, timestamp: "2026-10-20T08:30:00Z" },
      { angle: "cabin_interior", url: generateMock8Sides("machinery", "CAT 320D").cabin_interior, timestamp: "2026-10-20T08:35:00Z" },
    ],
    signedAt: "2026-10-20T08:40:00Z",
  },
];
 
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-001",
    title: "KYC & Guarantor Approval Required",
    message: "MIDROC Construction submitted Third-Party Notarized Guarantor (Ato Tadesse Haile, FIN-9482-1049-3321) for CAT 320D Excavator booking. Division validation required to unlock dispatch.",
    type: "kyc_validation",
    recipientRole: "head_dispatcher",
    targetDivision: "all",
    bookingId: "bkg-101",
    renterName: "MIDROC Construction Ethiopia",
    assetName: "Caterpillar 320D Excavator",
    collateralType: "personal_guarantor",
    contractFileName: "Scanned-Franco Valuta.pdf",
    contractFileSize: "449 KB",
    contractFileUrl: "/contracts/Scanned-Franco-Valuta.pdf",
    contractFileType: "pdf",
    status: "pending",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-002",
    title: "Geofence Breach Alert",
    message: "Shantui SD22 Bulldozer (SP-02944 AA) deviated outside authorized geo-perimeter at Adama Project Corridor.",
    type: "safety",
    recipientRole: "liora_admin",
    targetDivision: "liora",
    status: "approved",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-003",
    title: "Maintenance Lock Alert",
    message: "Caterpillar 250kVA Generator crossed 4,250 Engine Hours. Starter interlock engaged at Central Depot.",
    type: "maintenance",
    recipientRole: "head_dispatcher",
    targetDivision: "all",
    status: "pending",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-004",
    title: "Role Approval: Solomon Haile (Elshaday Admin)",
    message: "Solomon Haile (solomon.elshaday@delservices.et) registered for Elshaday Admin role. Confirmation email dispatched. Head Dispatcher authorization required to unlock operational terminal.",
    type: "role_approval",
    recipientRole: "head_dispatcher",
    targetDivision: "all",
    bookingId: "usr-010",
    status: "pending",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-005",
    title: "VIP Booking Confirmed: Toyota Land Cruiser 300 V8",
    message: "New 5-day executive VIP rental booked for Bole International Airport pickup. Scanned notarized corporate PO and stamp attached.",
    type: "booking",
    recipientRole: "elshaday_admin",
    targetDivision: "elshaday",
    bookingId: "bkg-102",
    renterName: "African Union Delegation Support",
    assetName: "Toyota Land Cruiser 300 V8",
    collateralType: "corporate_po",
    contractFileName: "Corporate_PO_Stamp.png",
    contractFileSize: "820 KB",
    contractFileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    contractFileType: "image",
    status: "approved",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-006",
    title: "Car Return Inspection Complete",
    message: "Toyota Hilux GD-6 Double Cab returned to Bole Yard. 360-degree walkaround photos uploaded with zero damage detected.",
    type: "maintenance",
    recipientRole: "elshaday_admin",
    targetDivision: "elshaday",
    status: "approved",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-007",
    title: "Dalol Escrow Release Pre-Authorization",
    message: "Freight corridor milestone payment of ETB 350,000 verified. Ready for smart escrow disbursement upon depot receipt.",
    type: "payment",
    recipientRole: "dalol_admin",
    targetDivision: "dalol",
    status: "pending",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-008",
    title: "RFID Fleet Fuel Card Limit Updated",
    message: "Pre-authorized diesel allocation of 1,200 Liters triggered for Kality lowbed transport carrier unit.",
    type: "payment",
    recipientRole: "dalol_admin",
    targetDivision: "dalol",
    status: "approved",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

// ==========================================
// SEED BROKERS MODULE
// ==========================================
export const INITIAL_BROKERS: Broker[] = [
  {
    id: "brk-001",
    fullName: "Ato Kassahun Belay",
    phoneNumber: "+251 911 234 567",
    email: "kassahun.belay@ethioproperties.et",
    address: "Bole Medhanialem, Floor 4, Suite 402, Addis Ababa",
    regionLocation: {
      region: "Addis Ababa",
      citySubcity: "Bole Subcity",
    },
    commissionPct: 8.0,
    tinNumber: "0048291038",
    nationalIdNumber: "ET-NID-8841029",
    faydaFinNumber: "FIN-ET-8492-1049-3829",
    status: "active",
    specialization: "Heavy Machinery",
    payoutBank: {
      bankName: "Commercial Bank of Ethiopia (CBE)",
      accountNumber: "1000293849102",
      accountHolderName: "Kassahun Belay Woldemariam",
    },
    dealsClosedCount: 24,
    totalCommissionPaidETB: 384500,
    notes: "Top-tier broker specializing in quarry excavators, wheel loaders, and high-capacity dump trucks across Oromia and Addis Ababa.",
    createdAt: "2025-11-10T09:30:00Z",
  },
  {
    id: "brk-002",
    fullName: "Broker Alemayehu Tadesse",
    phoneNumber: "+251 922 456 789",
    email: "alemayehu.tadesse@adamatransport.et",
    address: "Posta Bet Area, Near Adama City Mall, Adama",
    regionLocation: {
      region: "Oromia",
      citySubcity: "Adama / Bishoftu Corridor",
    },
    commissionPct: 7.5,
    tinNumber: "0059182341",
    nationalIdNumber: "ET-NID-7102948",
    faydaFinNumber: "FIN-ET-7102-4920-5830",
    status: "active",
    specialization: "Commercial & Transport",
    payoutBank: {
      bankName: "Awash Bank",
      accountNumber: "01320984920194",
      accountHolderName: "Alemayehu Tadesse Gemeda",
    },
    dealsClosedCount: 18,
    totalCommissionPaidETB: 245000,
    notes: "Key liaison for Sino-Trucks, lowbeds, and heavy logistics for the Modjo-Hawassa expressway corridor.",
    createdAt: "2025-12-04T11:15:00Z",
  },
  {
    id: "brk-003",
    fullName: "W/ro Bethlehem Girma",
    phoneNumber: "+251 933 678 901",
    email: "bethlehem.girma@luxuryfleet.et",
    address: "Kazanchis, Guinea Conakry St, Kirkos Subcity, Addis Ababa",
    regionLocation: {
      region: "Addis Ababa",
      citySubcity: "Kirkos Subcity",
    },
    commissionPct: 5.0,
    tinNumber: "0068201934",
    nationalIdNumber: "ET-NID-9402851",
    faydaFinNumber: "FIN-ET-9402-8519-2041",
    status: "active",
    specialization: "Passenger Cars",
    payoutBank: {
      bankName: "Telebirr SuperApp Wallet",
      accountNumber: "+251933678901",
      accountHolderName: "Bethlehem Girma Tefera",
    },
    dealsClosedCount: 31,
    totalCommissionPaidETB: 189000,
    notes: "Specialist in VIP Land Cruiser 300, Defender 110, and diplomatic delegation fleet rentals in Addis Ababa.",
    createdAt: "2026-01-08T14:20:00Z",
  },
  {
    id: "brk-004",
    fullName: "Ato Solomon Worku",
    phoneNumber: "+251 944 890 123",
    email: "solomon.worku@sidamaearthmoving.et",
    address: "Industrial Park Gate 2, Hawassa",
    regionLocation: {
      region: "Sidama",
      citySubcity: "Hawassa City",
    },
    commissionPct: 10.0,
    tinNumber: "0071928491",
    nationalIdNumber: "ET-NID-6391028",
    faydaFinNumber: "FIN-ET-6391-0284-9182",
    status: "active",
    specialization: "Quarry & Earthmoving",
    payoutBank: {
      bankName: "Dashen Bank",
      accountNumber: "5029184920194",
      accountHolderName: "Solomon Worku Kebede",
    },
    dealsClosedCount: 14,
    totalCommissionPaidETB: 312000,
    notes: "Connects industrial park infrastructure contractors with Caterpillar dozers, motor graders, and vibrating rollers.",
    createdAt: "2026-01-22T10:00:00Z",
  },
  {
    id: "brk-005",
    fullName: "Ato Mulugeta Assefa",
    phoneNumber: "+251 915 345 678",
    email: "mulugeta.assefa@amhararentals.et",
    address: "Kebele 04, Lakeside Boulevard, Bahir Dar",
    regionLocation: {
      region: "Amhara",
      citySubcity: "Bahir Dar",
    },
    commissionPct: 6.5,
    tinNumber: "0082910482",
    nationalIdNumber: "ET-NID-5829104",
    faydaFinNumber: "FIN-ET-5829-1048-2910",
    status: "active",
    specialization: "All Assets",
    payoutBank: {
      bankName: "Bank of Abyssinia",
      accountNumber: "849201948201",
      accountHolderName: "Mulugeta Assefa Desta",
    },
    dealsClosedCount: 19,
    totalCommissionPaidETB: 228000,
    notes: "Regional coverage across Bahir Dar, Gondar, and Debre Markos agricultural and road expansion projects.",
    createdAt: "2026-02-05T16:45:00Z",
  },
];

// ==========================================
// ACTIVE REPOSITORY & QUERY ENGINE
// ==========================================
class DatabaseStore {
  users: User[] = [...INITIAL_USERS];
  operators: OperatorDriver[] = [...INITIAL_OPERATORS];
  partners: PartnerOnboarding[] = [...INITIAL_PARTNERS];
  brokers: Broker[] = [...INITIAL_BROKERS];
  fleetOwners: FleetOwner[] = [...INITIAL_FLEET_OWNERS];
  assets: Asset[] = [...INITIAL_ASSETS];
  rateCards: Record<string, AssetRateCard> = { ...INITIAL_RATE_CARDS };
  bookings: Booking[] = [...INITIAL_BOOKINGS];
  bookingItems: BookingItem[] = [...INITIAL_BOOKING_ITEMS];
  collaterals: BookingCollateral[] = [...INITIAL_COLLATERALS];
  inspections: AssetInspection[] = [...INITIAL_INSPECTIONS];
  maintenanceSchedules: MaintenanceSchedule[] = [...INITIAL_MAINTENANCE_SCHEDULES];
  timesheets: MachineryDailyTimesheet[] = [...INITIAL_TIMESHEETS];
  invoices: Invoice[] = [...INITIAL_INVOICES];
  settlements: OwnerSettlementLedger[] = [...INITIAL_SETTLEMENTS];
  notifications: SystemNotification[] = [...INITIAL_NOTIFICATIONS];
  passwords: Record<string, string> = {
    "yonas.bekele@delservices.et": "DispatcH2026!",
    "yonas.bekele@delrentals.et": "DispatcH2026!",
    "yonas.dispatch@delrentals.et": "DispatcH2026!",
    "admin@delservices.et": "Admin@12345",
    "admin@delrentals.et": "Admin@12345",
    "elshaday.admin@delservices.et": "Elshaday2026!",
    "liora.admin@delservices.et": "Liora2026!",
    "dalol.admin@delservices.et": "Dalol2026!",
    "solomon.elshaday@delservices.et": "Elshaday2026!",
  };
  resetTokens: Record<string, { token: string; email: string; role: string; expiresAt: number }> = {};

  // Operators (ODR)
  getOperators(): OperatorDriver[] {
    return this.operators;
  }

  getOperatorById(id: string): OperatorDriver | undefined {
    return this.operators.find((o) => o.id === id);
  }

  addOperator(data: Omit<OperatorDriver, 'id' | 'createdAt'>): OperatorDriver {
    const newOp: OperatorDriver = {
      ...data,
      id: `opr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.operators.push(newOp);

    // Also register in users table for backwards-compatible foreign keys
    this.users.push({
      id: newOp.id,
      fullName: newOp.fullName,
      phoneNumber: newOp.phoneNumber,
      email: newOp.email,
      role: "operator",
      driverLicenseGrade: newOp.driverLicenseGrade,
      faydaFinNumber: newOp.faydaFinNumber,
      kycVerified: newOp.kycVerified,
      createdAt: newOp.createdAt,
    });

    return newOp;
  }

  // Partners Module
  getPartners(): PartnerOnboarding[] {
    return this.partners;
  }

  addPartnerAndAsset(data: {
    ownerContact: PartnerOnboarding['ownerContact'];
    ownerKycNidUrl?: string;
    faydaFinNumber?: string;
    libreCertificateNo: string;
    libreDocUrl?: string;
    assetCategory: AssetCategory;
    condition: 'brand_new' | 'excellent' | 'good' | 'fair';
    make: string;
    model: string;
    manufactureYear: number;
    plateNumber?: string;
    chassisOrSerialNumber: string;
    price: PartnerOnboarding['price'];
    images8Sides: Images8Sides;
    regionLocation: PartnerOnboarding['regionLocation'];
    agreement: PartnerOnboarding['agreement'];
    gps: PartnerOnboarding['gps'];
    deliveryClearance: PartnerOnboarding['deliveryClearance'];
    specs?: any;
  }): { partner: PartnerOnboarding; asset: Asset } {
    // 1. Create Partner Onboarding Record
    const partnerId = `prt-${Date.now()}`;
    const newPartner: PartnerOnboarding = {
      id: partnerId,
      ownerContact: data.ownerContact,
      ownerKycNidUrl: data.ownerKycNidUrl,
      faydaFinNumber: data.faydaFinNumber,
      libreCertificateNo: data.libreCertificateNo,
      libreDocUrl: data.libreDocUrl,
      assetCategory: data.assetCategory,
      condition: data.condition,
      make: data.make,
      model: data.model,
      manufactureYear: data.manufactureYear,
      plateNumber: data.plateNumber,
      chassisOrSerialNumber: data.chassisOrSerialNumber,
      price: data.price,
      images8Sides: data.images8Sides,
      regionLocation: data.regionLocation,
      agreement: data.agreement,
      gps: data.gps,
      deliveryClearance: data.deliveryClearance,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    this.partners.push(newPartner);

    // 2. Create or Link FleetOwner Tenant
    const tenantId = `tenant-host-${Date.now()}`;
    const newTenant: FleetOwner = {
      id: tenantId,
      primaryUserId: `usr-host-${Date.now()}`,
      companyName: data.ownerContact.companyName || data.ownerContact.fullName,
      ownerType: data.ownerContact.ownerTier,
      tinNumber: data.ownerContact.tinNumber,
      platformCommissionPct: data.agreement.commissionPct,
      payoutBankName: data.deliveryClearance.bankName,
      payoutAccountNumber: data.deliveryClearance.accountNumber,
      instantBookEnabled: true,
      createdAt: new Date().toISOString(),
    };
    this.fleetOwners.push(newTenant);

    // 3. Integrate Directly Into Fleet Registry (assets table)
    const isMachinery = data.assetCategory === "heavy_machinery" || data.assetCategory === "power_equipment";
    const meterUnit: any = isMachinery ? "engine_hours" : data.assetCategory === "attachment" ? "calendar_days_only" : "odometer_km";

    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      ownerId: tenantId,
      category: data.assetCategory,
      make: data.make,
      model: data.model,
      manufactureYear: data.manufactureYear,
      plateNumber: data.plateNumber,
      chassisOrSerialNumber: data.chassisOrSerialNumber,
      libreCertificateNo: data.libreCertificateNo,
      bolloExpiryDate: "2027-12-31",
      insuranceExpiryDate: "2027-12-31",
      meterUnit,
      currentMeterReading: isMachinery ? 1200 : 8500,
      requiresCompanyOperator: isMachinery,
      gpsTrackerImei: data.gps.gpsTrackerImei,
      status: "available",
      condition: data.condition,
      primaryImageUrl: data.images8Sides.front,
      images8Sides: data.images8Sides,
      partnerInfo: {
        ownerName: data.ownerContact.fullName,
        ownerPhone: data.ownerContact.phoneNumber,
        ownerTier: data.ownerContact.ownerTier,
        region: `${data.regionLocation.citySubcity}, ${data.regionLocation.region}`,
        commissionPct: data.agreement.commissionPct,
        libreDocUrl: data.libreDocUrl,
        agreementDocUrl: data.agreement.agreementDocUrl,
        deliveryClearance: data.deliveryClearance,
      },
      specs: data.specs || (isMachinery ? {
        operatingWeightTons: 20,
        bucketCapacityM3: 1.2,
        dailyEngineHourCap: 8,
        hydraulicAuxLines: true,
      } : {
        transmission: "automatic",
        fuelType: "diesel",
        seats: 5,
        dailyKmLimit: 200,
      }),
      gpsLocation: data.gps.hasGps ? {
        lat: 9.01 + (Math.random() - 0.5) * 0.05,
        lng: 38.75 + (Math.random() - 0.5) * 0.05,
        speed: 0,
        address: data.regionLocation.depotAddress,
        status: "idle",
        lastUpdated: "Host Verified",
      } : undefined,
      createdAt: new Date().toISOString(),
    };
    this.assets.push(newAsset);

    // 4. Register Asset Rate Card
    const newRateCard: AssetRateCard = {
      id: `rc-${Date.now()}`,
      assetId: newAsset.id,
      dailyRate: data.price.dailyRate,
      weeklyRate: data.price.weeklyRate || data.price.dailyRate * 6,
      monthlyRate: data.price.monthlyRate || data.price.dailyRate * 22,
      includedMeterUnitsPerDay: isMachinery ? 8 : 200,
      overtimeRatePerUnit: data.price.overtimeRatePerUnit || (isMachinery ? 4500 : 35),
      idleDayMinimumHours: isMachinery ? 4 : 0,
      operatorDailyRate: isMachinery ? 2500 : 1200,
      operatorPerDiemRate: isMachinery ? 1500 : 1000,
      defaultMobilizationFee: isMachinery ? 28000 : 0,
      securityDepositAmount: data.price.securityDepositAmount,
    };
    this.rateCards[newAsset.id] = newRateCard;

    return { partner: newPartner, asset: newAsset };
  }

  // ==========================================
  // BROKERS MODULE
  // ==========================================
  getBrokers(search?: string): Broker[] {
    if (!search) return this.brokers;
    const q = search.toLowerCase().trim();
    return this.brokers.filter((b) =>
      b.fullName.toLowerCase().includes(q) ||
      b.phoneNumber.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.regionLocation.region.toLowerCase().includes(q) ||
      (b.regionLocation.citySubcity && b.regionLocation.citySubcity.toLowerCase().includes(q)) ||
      (b.specialization && b.specialization.toLowerCase().includes(q))
    );
  }

  getBrokerById(id: string): Broker | undefined {
    return this.brokers.find((b) => b.id === id);
  }

  addBroker(data: Omit<Broker, 'id' | 'createdAt'>): Broker {
    const newBroker: Broker = {
      ...data,
      id: `brk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.brokers.unshift(newBroker);
    return newBroker;
  }

  updateBroker(id: string, updates: Partial<Broker>): Broker | null {
    const idx = this.brokers.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.brokers[idx] = {
      ...this.brokers[idx],
      ...updates,
    };
    return this.brokers[idx];
  }

  deleteBroker(id: string): boolean {
    const idx = this.brokers.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.brokers.splice(idx, 1);
    return true;
  }

  // Assets
  getAssets(ownerId?: string): Asset[] {
    if (!ownerId || ownerId === "all") return this.assets;
    return this.assets.filter((a) => a.ownerId === ownerId);
  }

  getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  getRateCard(assetId: string): AssetRateCard | undefined {
    return this.rateCards[assetId];
  }

  getBookings(): Booking[] {
    return this.bookings;
  }

  getBookingItems(): BookingItem[] {
    return this.bookingItems;
  }

  getInvoices(): Invoice[] {
    return this.invoices;
  }

  getSettlements(): OwnerSettlementLedger[] {
    return this.settlements;
  }

  // TSTZRANGE GiST Overlap Check
  checkPeriodOverlap(startA: string | Date, endA: string | Date, startB: string | Date, endB: string | Date): boolean {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();
    return Math.max(sA, sB) < Math.min(eA, eB);
  }

  validateBookingItemConflict(
    assetId: string,
    operatorId: string | null | undefined,
    start: string,
    end: string,
    excludeItemId?: string
  ): { hasConflict: boolean; code?: string; message?: string } {
    const activeStatuses: BookingStatus[] = ["confirmed", "dispatched", "active"];

    for (const item of this.bookingItems) {
      if (excludeItemId && item.id === excludeItemId) continue;
      if (!activeStatuses.includes(item.itemStatus)) continue;

      const overlaps = this.checkPeriodOverlap(
        start,
        end,
        item.rentalPeriodStart,
        item.rentalPeriodEnd
      );

      if (overlaps) {
        if (item.assetId === assetId) {
          const asset = this.getAssetById(assetId);
          return {
            hasConflict: true,
            code: "23P01",
            message: `PostgreSQL GiST Exclusion Violation: Asset '${asset?.make} ${asset?.model}' (${asset?.plateNumber || asset?.chassisOrSerialNumber}) is already booked for the overlapping period (${item.rentalPeriodStart} to ${item.rentalPeriodEnd}).`,
          };
        }

        if (operatorId && item.assignedOperatorId === operatorId) {
          const op = this.operators.find((o) => o.id === operatorId) || this.users.find((u) => u.id === operatorId);
          return {
            hasConflict: true,
            code: "23P01",
            message: `PostgreSQL GiST Exclusion Violation: Operator '${op?.fullName}' is already committed to another active dispatch for the requested time window.`,
          };
        }
      }
    }

    return { hasConflict: false };
  }

  createBookingWithItems(params: {
    renterId: string;
    bookingChannel?: 'internal_desk' | 'online_portal' | 'turo_p2p';
    pickupLocation: string;
    dropoffLocation: string;
    projectSiteRegion?: string;
    isOutOfCity?: boolean;
    destinationName?: string;
    destinationDistanceKm?: number;
    roundTripDistanceKm?: number;
    agreedDealKm?: number;
    items: {
      assetId: string;
      assignedOperatorId?: string | null;
      rentalPeriodStart: string;
      rentalPeriodEnd: string;
      mobilizationFeeCharged?: number;
      meterStart?: number;
      meterEnd?: number;
      actualUsedUnits?: number;
      agreedDealUnits?: number;
      overageUnits?: number;
      overageSurcharge?: number;
    }[];
  }): { booking: Booking; items: BookingItem[] } {
    for (const item of params.items) {
      const conflict = this.validateBookingItemConflict(
        item.assetId,
        item.assignedOperatorId,
        item.rentalPeriodStart,
        item.rentalPeriodEnd
      );
      if (conflict.hasConflict) {
        const err = new Error(conflict.message);
        (err as any).code = conflict.code || "23P01";
        throw err;
      }
    }

    const bookingRef = `DEL-BKG-2026-${String(this.bookings.length + 90).padStart(4, "0")}`;
    const renter = this.users.find((u) => u.id === params.renterId);
    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      bookingReference: bookingRef,
      renterId: params.renterId,
      renterName: renter?.fullName,
      renterPhone: renter?.phoneNumber,
      status: "draft",
      bookingChannel: params.bookingChannel || "internal_desk",
      pickupLocation: params.pickupLocation,
      dropoffLocation: params.dropoffLocation,
      projectSiteRegion: params.projectSiteRegion,
      isOutOfCity: params.isOutOfCity || false,
      destinationName: params.destinationName,
      destinationDistanceKm: params.destinationDistanceKm,
      roundTripDistanceKm: params.roundTripDistanceKm,
      agreedDealKm: params.agreedDealKm,
      contractDocumentUrl: params.contractDocumentUrl,
      contractDocumentName: params.contractDocumentName,
      contractDocumentSize: params.contractDocumentSize,
      contractDocumentType: params.contractDocumentType,
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(newBooking);

    const createdItems: BookingItem[] = [];
    for (const item of params.items) {
      const asset = this.getAssetById(item.assetId);
      const operator = item.assignedOperatorId
        ? this.operators.find((o) => o.id === item.assignedOperatorId) || this.users.find((u) => u.id === item.assignedOperatorId)
        : null;

      const newItem: BookingItem = {
        id: `bki-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        bookingId: newBooking.id,
        assetId: item.assetId,
        asset,
        assignedOperatorId: item.assignedOperatorId || null,
        assignedOperator: operator,
        rentalPeriodStart: item.rentalPeriodStart,
        rentalPeriodEnd: item.rentalPeriodEnd,
        itemStatus: "confirmed",
        meterStart: item.meterStart !== undefined ? item.meterStart : (asset?.currentMeterReading || 0),
        meterEnd: item.meterEnd,
        actualUsedUnits: item.actualUsedUnits,
        agreedDealUnits: item.agreedDealUnits,
        overageUnits: item.overageUnits,
        overageSurcharge: item.overageSurcharge,
        mobilizationFeeCharged: item.mobilizationFeeCharged || 0,
      };
      this.bookingItems.push(newItem);
      createdItems.push(newItem);

      if (asset) {
        asset.status = "on_rent";
      }
      if (operator) {
        const opInList = this.operators.find((o) => o.id === operator.id);
        if (opInList) opInList.status = "dispatched";
      }
    }

    return { booking: newBooking, items: createdItems };
  }

  recordCollateral(collateral: Omit<BookingCollateral, 'id' | 'createdAt'>): BookingCollateral {
    const newCol: BookingCollateral = {
      ...collateral,
      id: `col-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.collaterals.push(newCol);

    const booking = this.bookings.find((b) => b.id === collateral.bookingId);
    if (booking) {
      if (newCol.contractDocumentUrl) booking.contractDocumentUrl = newCol.contractDocumentUrl;
      if (newCol.contractDocumentName) booking.contractDocumentName = newCol.contractDocumentName;
      if (newCol.contractDocumentSize) booking.contractDocumentSize = newCol.contractDocumentSize;
      if (newCol.contractDocumentType) booking.contractDocumentType = newCol.contractDocumentType;
      if (newCol.isVerified && (booking.status === "draft" || booking.status === "kyc_pending")) {
        booking.status = "confirmed";
      }
    }

    return newCol;
  }

  recordInspection(inspection: Omit<AssetInspection, 'id' | 'signedAt'>): AssetInspection {
    const newInspection: AssetInspection = {
      ...inspection,
      id: `insp-${Date.now()}`,
      signedAt: new Date().toISOString(),
    };
    this.inspections.push(newInspection);

    const item = this.bookingItems.find((b) => b.id === inspection.bookingItemId);
    if (item) {
      const asset = this.getAssetById(item.assetId);
      if (asset && inspection.meterReading > asset.currentMeterReading) {
        asset.currentMeterReading = inspection.meterReading;

        const sched = this.maintenanceSchedules.find(
          (m) => m.assetId === asset.id && m.status !== "completed"
        );
        if (sched && inspection.meterReading >= sched.nextServiceMeter) {
          asset.status = "maintenance";
          sched.isSafetyCriticalLock = true;
          sched.status = "open";
        }
      }
    }

    return newInspection;
  }

  recordTimesheet(timesheet: Omit<MachineryDailyTimesheet, 'id' | 'createdAt'>): MachineryDailyTimesheet {
    const newTs: MachineryDailyTimesheet = {
      ...timesheet,
      id: `ts-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.timesheets.push(newTs);

    const item = this.bookingItems.find((b) => b.id === timesheet.bookingItemId);
    if (item) {
      const asset = this.getAssetById(item.assetId);
      if (asset && timesheet.engineHoursEnd > asset.currentMeterReading) {
        asset.currentMeterReading = timesheet.engineHoursEnd;

        const sched = this.maintenanceSchedules.find(
          (m) => m.assetId === asset.id && m.status !== "completed"
        );
        if (sched && timesheet.engineHoursEnd >= sched.nextServiceMeter) {
          asset.status = "maintenance";
          sched.isSafetyCriticalLock = true;
        }
      }
    }

    return newTs;
  }

  settleInvoice(invoiceId: string, paymentMethod: string = "Telebirr"): Invoice {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error("Invoice not found");

    inv.isPaid = true;
    inv.paidAt = new Date().toISOString();

    const item = this.bookingItems.find((i) => i.bookingId === inv.bookingId);
    const asset = item ? this.getAssetById(item.assetId) : null;
    const owner = asset ? this.fleetOwners.find((o) => o.id === asset.ownerId) : null;

    if (owner) {
      const gross = inv.baseRentalAmount + inv.overtimeUsageAmount + inv.mobilizationAmount;
      const commissionPct = owner.platformCommissionPct || 0;
      const commissionAmount = Math.round((gross * (commissionPct / 100)) * 100) / 100;
      const netPayout = Math.max(0, gross - commissionAmount);

      const settlement: OwnerSettlementLedger = {
        id: `stl-${Date.now()}`,
        invoiceId: inv.id,
        ownerId: owner.id,
        ownerName: owner.companyName,
        grossRevenue: gross,
        platformCommissionPct: commissionPct,
        platformCommissionAmount: commissionAmount,
        workshopRepairDeduction: 0,
        netPayoutAmount: netPayout,
        settlementStatus: owner.ownerType === "internal_company" ? "approved" : "pending",
        disbursedAt: owner.ownerType === "internal_company" ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      this.settlements.push(settlement);
    }

    return inv;
  }

  // ==========================================
  // ASSET CRUD
  // ==========================================
  updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.assets[idx] = {
      ...this.assets[idx],
      ...updates,
      specs: { ...this.assets[idx].specs, ...(updates.specs || {}) },
    };
    if (updates.rateCard && this.rateCards[id]) {
      this.rateCards[id] = { ...this.rateCards[id], ...updates.rateCard };
    }
    return this.assets[idx];
  }

  deleteAsset(id: string): boolean {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.assets.splice(idx, 1);
    delete this.rateCards[id];
    return true;
  }

  // ==========================================
  // OPERATOR CRUD (ODR)
  // ==========================================
  updateOperator(id: string, updates: Partial<OperatorDriver>): OperatorDriver | null {
    const idx = this.operators.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.operators[idx] = { ...this.operators[idx], ...updates };
    return this.operators[idx];
  }

  deleteOperator(id: string): boolean {
    const idx = this.operators.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.operators.splice(idx, 1);
    return true;
  }

  // ==========================================
  // PARTNER ONBOARDING CRUD
  // ==========================================
  updatePartner(id: string, updates: Partial<PartnerOnboarding>): PartnerOnboarding | null {
    const idx = this.partners.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.partners[idx] = { ...this.partners[idx], ...updates };

    // Update corresponding asset if present
    const partner = this.partners[idx];
    const asset = this.assets.find(
      (a) => a.plateNumber === partner.plateNumber || a.chassisOrSerialNumber === partner.chassisOrSerialNumber
    );
    if (asset) {
      if (updates.price?.dailyRate) {
        if (this.rateCards[asset.id]) {
          this.rateCards[asset.id].dailyRate = updates.price.dailyRate;
        }
      }
      if (updates.make) asset.make = updates.make;
      if (updates.model) asset.model = updates.model;
      if (updates.condition) asset.condition = updates.condition;
      if (updates.images8Sides?.front) asset.primaryImageUrl = updates.images8Sides.front;
    }
    return this.partners[idx];
  }

  deletePartner(id: string): boolean {
    const idx = this.partners.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const partner = this.partners[idx];
    this.partners.splice(idx, 1);

    // Also remove matching asset
    const assetIdx = this.assets.findIndex(
      (a) => a.plateNumber === partner.plateNumber || a.chassisOrSerialNumber === partner.chassisOrSerialNumber
    );
    if (assetIdx !== -1) {
      const assetId = this.assets[assetIdx].id;
      this.assets.splice(assetIdx, 1);
      delete this.rateCards[assetId];
    }
    return true;
  }

  // ==========================================
  // NOTIFICATIONS ENGINE (Role-Scoped & Strictly Partitioned per Division)
  // ==========================================
  getNotifications(role?: string, division?: string): SystemNotification[] {
    if (!role || role === "head_dispatcher" || division === "all") {
      return this.notifications.filter(
        (n) =>
          !n.recipientRole ||
          n.recipientRole === "head_dispatcher" ||
          n.recipientRole === "all" ||
          n.targetDivision === "all"
      );
    }

    if (role === "elshaday_admin") {
      return this.notifications.filter(
        (n) => n.recipientRole === "elshaday_admin" || n.targetDivision === "elshaday"
      );
    }

    if (role === "liora_admin") {
      return this.notifications.filter(
        (n) => n.recipientRole === "liora_admin" || n.targetDivision === "liora"
      );
    }

    if (role === "dalol_admin") {
      return this.notifications.filter(
        (n) => n.recipientRole === "dalol_admin" || n.targetDivision === "dalol"
      );
    }

    return this.notifications.filter((n) => {
      if (division && n.targetDivision === division) return true;
      if (role && (n.recipientRole === role || n.recipientRole === "all")) return true;
      return false;
    });
  }

  addNotification(notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read' | 'status'>): SystemNotification {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      read: false,
      targetDivision: notif.targetDivision || (notif.recipientRole === "elshaday_admin" ? "elshaday" : notif.recipientRole === "liora_admin" ? "liora" : notif.recipientRole === "dalol_admin" ? "dalol" : "all"),
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  approveKycNotification(id: string, approverName: string = "Yonas Bekele"): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.status = "approved";
    notif.read = true;
    notif.message += ` [Approved by Head Dispatcher ${approverName} at ${new Date().toLocaleTimeString()}]`;
    return true;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  markAllNotificationsRead(role?: string): boolean {
    const roleNotifs = this.getNotifications(role);
    roleNotifs.forEach((n) => {
      n.read = true;
      if (n.status === "pending") n.status = "approved";
    });
    return true;
  }

  deleteNotification(id: string): boolean {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.notifications.splice(idx, 1);
    return true;
  }

  clearNotifications(role?: string): boolean {
    if (!role || role === "head_dispatcher") {
      this.notifications = this.notifications.filter(
        (n) => n.recipientRole !== "head_dispatcher" && n.recipientRole !== "all" && n.targetDivision !== "all"
      );
      return true;
    }

    this.notifications = this.notifications.filter((n) => {
      if (role === "elshaday_admin" && (n.recipientRole === "elshaday_admin" || n.targetDivision === "elshaday")) {
        return false;
      }
      if (role === "liora_admin" && (n.recipientRole === "liora_admin" || n.targetDivision === "liora")) {
        return false;
      }
      if (role === "dalol_admin" && (n.recipientRole === "dalol_admin" || n.targetDivision === "dalol")) {
        return false;
      }
      return n.recipientRole !== role;
    });
    return true;
  }

  // ==========================================
  // AUTHENTICATION & PASSWORD RESET
  // ==========================================
  authenticateUser(email: string, pass: string): User | null {
    const normalizedEmail = email.trim().toLowerCase();
    const storedPass = this.passwords[normalizedEmail];
    
    // Check Head Dispatcher Yonas Bekele dispatch aliases
    if (
      (normalizedEmail === "yonas.bekele@delservices.et" ||
       normalizedEmail === "yonas.bekele@delrentals.et" ||
       normalizedEmail === "yonas.dispatch@delrentals.et" ||
       normalizedEmail === "admin@delservices.et") &&
      pass === "DispatcH2026!"
    ) {
      return this.users.find((u) => u.id === "usr-002") || null;
    }

    if (storedPass && storedPass === pass) {
      return this.users.find((u) => u.email?.toLowerCase() === normalizedEmail) || null;
    }

    // Default fallback for demo / test users with valid password
    const matchedUser = this.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (matchedUser && pass.length >= 6) {
      return matchedUser;
    }

    return null;
  }

  getUsers(): User[] {
    return this.users;
  }

  approveUser(userId: string, approverName: string = "Yonas Bekele"): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = "active";
    user.approvedBy = approverName;
    user.approvedAt = new Date().toISOString();

    // Mark matching notification as approved
    const notif = this.notifications.find((n) => n.message.includes(user.email || ""));
    if (notif) {
      notif.status = "approved";
      notif.read = true;
      notif.message += ` [Granted & Activated by ${approverName}]`;
    }
    return true;
  }

  rejectUser(userId: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    user.status = "rejected";
    return true;
  }

  deleteUser(userId: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    const removedUser = this.users[idx];
    this.users.splice(idx, 1);
    if (removedUser.email) {
      delete this.passwords[removedUser.email.toLowerCase()];
      delete this.resetTokens[removedUser.email.toLowerCase()];
    }
    return true;
  }

  addUser(userData: Partial<User> & { fullName: string; email: string; role: any; password?: string }): User {
    const normalizedEmail = userData.email.trim().toLowerCase();
    const division =
      userData.assignedDivision ||
      (userData.role === "elshaday_admin"
        ? "elshaday"
        : userData.role === "liora_admin"
        ? "liora"
        : userData.role === "dalol_admin"
        ? "dalol"
        : "all");

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: userData.fullName,
      email: normalizedEmail,
      phoneNumber: userData.phoneNumber || "",
      role: userData.role,
      status: (userData.status as any) || "active",
      assignedDivision: division,
      kycVerified: true,
      createdAt: new Date().toISOString(),
      approvedBy: "Head Dispatcher (Manual Entry)",
      approvedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    if (userData.password) {
      this.passwords[normalizedEmail] = userData.password;
    } else {
      this.passwords[normalizedEmail] = "DispatcH2026!";
    }
    return newUser;
  }

  registerUser(userData: Omit<User, 'id' | 'createdAt'>, pass: string): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    if (newUser.email) {
      this.passwords[newUser.email.toLowerCase()] = pass;
    }
    return newUser;
  }

  resetPasswordForEmail(email: string, newPass: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    this.passwords[normalizedEmail] = newPass;
    if (normalizedEmail === "yonas.bekele@delrentals.et" || normalizedEmail === "yonas.bekele@delservices.et") {
      this.passwords["yonas.dispatch@delrentals.et"] = newPass;
      this.passwords["yonas.bekele@delservices.et"] = newPass;
      this.passwords["yonas.bekele@delrentals.et"] = newPass;
    }
    return true;
  }

  assignRoleCredentials(
    email: string,
    role: string,
    fullName?: string
  ): { user: User; token: string; resetLink: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const division =
      role === "elshaday_admin"
        ? "elshaday"
        : role === "liora_admin"
        ? "liora"
        : role === "dalol_admin"
        ? "dalol"
        : "all";

    let user = this.users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (user) {
      user.role = role as any;
      user.assignedDivision = division;
      user.status = "active";
      user.kycVerified = true;
      user.approvedBy = "Super Admin (Credentials Provisioned)";
      user.approvedAt = new Date().toISOString();
      if (fullName) user.fullName = fullName;
    } else {
      const roleTitles: Record<string, string> = {
        head_dispatcher: "Head Dispatcher Lead",
        elshaday_admin: "Elshaday Fleet Manager",
        liora_admin: "Liora Machinery Director",
        dalol_admin: "Dalol Operations Director",
      };
      const name = fullName || roleTitles[role] || "System Role Operator";
      user = {
        id: `usr-${Date.now()}`,
        fullName: name,
        email: normalizedEmail,
        role: role as any,
        status: "active",
        assignedDivision: division,
        kycVerified: true,
        approvedBy: "Super Admin (Credentials Provisioned)",
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.users.push(user);
    }

    // Generate secure token
    const token = "RST-" + Math.floor(100000 + Math.random() * 900000);
    const tokenPayload = {
      token,
      email: normalizedEmail,
      role,
      expiresAt: Date.now() + 24 * 3600 * 1000,
    };
    this.resetTokens[token] = tokenPayload;
    this.resetTokens[normalizedEmail] = tokenPayload;

    const resetLink = `/reset-password?role=${encodeURIComponent(role)}&email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(token)}`;

    // Add audit notification
    this.addNotification({
      title: `Role Credentials Provisioned (${role.replace("_", " ").toUpperCase()})`,
      message: `Password setup & reset link dispatched to ${normalizedEmail} with ${role.replace("_", " ").toUpperCase()} authorization scope. Token: ${token}`,
      type: "safety",
      recipientRole: "all",
    });

    return { user, token, resetLink };
  }

  verifyAndResetPassword(
    email: string,
    newPass: string,
    token?: string,
    role?: string
  ): { success: boolean; user?: User; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();

    // Check token if provided
    if (token) {
      const stored = this.resetTokens[token] || this.resetTokens[normalizedEmail];
      if (stored && stored.token !== token) {
        return { success: false, error: "Invalid or expired reset token" };
      }
    }

    this.passwords[normalizedEmail] = newPass;
    if (normalizedEmail === "yonas.bekele@delrentals.et" || normalizedEmail === "yonas.bekele@delservices.et") {
      this.passwords["yonas.dispatch@delrentals.et"] = newPass;
      this.passwords["yonas.bekele@delservices.et"] = newPass;
      this.passwords["yonas.bekele@delrentals.et"] = newPass;
    }

    let user = this.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (user) {
      if (role) user.role = role as any;
      user.status = "active";
      user.kycVerified = true;
      user.approvedBy = user.approvedBy || "Super Admin (Password Reset)";
      user.approvedAt = user.approvedAt || new Date().toISOString();
    } else {
      const division =
        role === "elshaday_admin"
          ? "elshaday"
          : role === "liora_admin"
          ? "liora"
          : role === "dalol_admin"
          ? "dalol"
          : "all";
      user = {
        id: `usr-${Date.now()}`,
        fullName: role ? role.replace("_", " ").toUpperCase() : "Platform User",
        email: normalizedEmail,
        role: (role as any) || "elshaday_admin",
        status: "active",
        assignedDivision: division,
        kycVerified: true,
        createdAt: new Date().toISOString(),
      };
      this.users.push(user);
    }

    // Clean up used token
    if (token && this.resetTokens[token]) delete this.resetTokens[token];
    if (this.resetTokens[normalizedEmail]) delete this.resetTokens[normalizedEmail];

    this.addNotification({
      title: "Password Verified & Account Activated",
      message: `Account credentials for ${normalizedEmail} (${user.role}) were successfully set and verified. Account is now active.`,
      type: "safety",
      recipientRole: "all",
    });

    return { success: true, user };
  }
}

export const db = new DatabaseStore();
