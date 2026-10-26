export type UserRole = 
  | 'head_dispatcher'
  | 'elshaday_admin'
  | 'liora_admin'
  | 'dalol_admin'
  | 'super_admin'
  | 'dispatcher'
  | 'mechanic'
  | 'fleet_owner'
  | 'renter'
  | 'operator';

export type OwnerTier = 
  | 'internal_company'
  | 'corporate_partner'
  | 'individual_host';

export type AssetCategory = 
  | 'passenger_car'
  | 'suv_4x4'
  | 'commercial_van'
  | 'heavy_machinery'
  | 'power_equipment'
  | 'attachment';

export type MeterUnit = 
  | 'odometer_km'
  | 'engine_hours'
  | 'calendar_days_only';

export type AssetStatus = 
  | 'available'
  | 'on_rent'
  | 'in_transit'
  | 'maintenance'
  | 'pending_approval'
  | 'retired';

export type BookingStatus = 
  | 'draft'
  | 'pending_host_approval'
  | 'kyc_pending'
  | 'confirmed'
  | 'dispatched'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type CollateralType = 
  | 'cash_cpo'
  | 'bank_guarantee'
  | 'post_dated_check'
  | 'personal_guarantor_was'
  | 'corporate_po'
  | 'digital_wallet_hold';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  status?: 'active' | 'pending_approval' | 'rejected';
  assignedDivision?: 'all' | 'elshaday' | 'liora' | 'dalol';
  confirmationEmailSent?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  faydaFinNumber?: string;
  tinNumber?: string;
  driverLicenseGrade?: string; // e.g. 'Special Mobile Machinery' for heavy equipment, 'Public 1', 'Dry Freight 1'
  kycVerified: boolean;
  kycDocuments?: any[];
  createdAt: string;
}

// Certified Operator / Driver (ODR Module)
export interface OperatorDriver {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  driverLicenseGrade: string; // e.g. 'Special Mobile Machinery', 'Public 1', 'Dry Freight 1', 'Public 2'
  driverLicenseNo: string;
  licenseExpiryDate?: string;
  licenseImageUrl?: string;
  kycNidImageUrl?: string;
  faydaFinNumber?: string;
  workExperienceYears: number;
  experienceDetails: string;
  machineryHandled: string[]; // e.g. ['CAT 320D', 'Komatsu PC200', 'SDLG 956L']
  dispatchArea: string; // e.g. 'Addis Ababa & Oromia Zone', 'Nationwide Projects'
  livingArea: string; // e.g. 'Kality Sub-city, Addis Ababa', 'Bishoftu', 'Ayat'
  estimatedPerDiem: number; // Operator per-diem allowance in ETB/day (e.g. 1500)
  status: 'available' | 'dispatched' | 'on_leave';
  rating?: number;
  kycVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface FleetOwner {
  id: string;
  primaryUserId: string;
  companyName: string;
  ownerType: OwnerTier;
  tinNumber?: string;
  platformCommissionPct: number; // 0 for internal, 10-15% for P2P
  payoutBankName?: string;
  payoutAccountNumber?: string;
  instantBookEnabled: boolean;
  createdAt: string;
}

// 8-Side Asset Photos
export interface Images8Sides {
  front: string;
  front_right: string;
  right_side: string;
  rear_right: string;
  rear: string;
  rear_left: string;
  left_side: string;
  cabin_interior: string;
}

// Partner Onboarding Module
export interface PartnerOnboarding {
  id: string;
  ownerContact: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    companyName?: string;
    tinNumber?: string;
    ownerTier: 'individual_host' | 'corporate_partner';
  };
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
  price: {
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    securityDepositAmount: number;
    overtimeRatePerUnit?: number;
  };
  images8Sides: Images8Sides;
  regionLocation: {
    region: string; // Addis Ababa, Oromia, Sidama, Amhara
    citySubcity: string; // Bole, Gotera, Hawassa, Adama
    depotAddress: string;
  };
  agreement: {
    termsSigned: boolean;
    commissionPct: number; // 10% for corporate, 15% for individual
    signedDate: string;
    agreementDocUrl?: string;
  };
  gps: {
    hasGps: boolean;
    gpsTrackerImei?: string;
    trackerModel?: string;
  };
  deliveryClearance: {
    paymentMethod: string; // Telebirr, CBE, Awash
    bankName: string;
    accountNumber: string;
    durationAvailableMonths: number;
    handoverNotes?: string;
    confirmed: boolean;
    confirmedAt?: string;
  };
  status: 'active' | 'pending_approval' | 'maintenance';
  createdAt: string;
}

// Brokers Module
export interface Broker {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  regionLocation: {
    region: string; // Addis Ababa, Oromia, Amhara, Sidama, Tigray, Dire Dawa
    citySubcity: string; // Bole, Kirkos, Gotera, Hawassa, Adama, Bahir Dar
  };
  commissionPct: number; // e.g. 5, 8, 10
  tinNumber?: string;
  nationalIdNumber?: string;
  faydaFinNumber?: string;
  status: 'active' | 'inactive' | 'verified';
  specialization: 'all_categories' | 'heavy_machinery' | 'passenger_cars' | 'quarry_and_projects';
  payoutBank?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  dealsClosedCount: number;
  totalCommissionPaidETB: number;
  notes?: string;
  createdAt: string;
}

export interface AssetSpecs {
  transmission?: 'automatic' | 'manual';
  fuelType?: 'diesel' | 'benzin' | 'electric';
  seats?: number;
  dailyKmLimit?: number;
  operatingWeightTons?: number;
  bucketCapacityM3?: number;
  dailyEngineHourCap?: number;
  idleDayMinimumHours?: number;
  hydraulicAuxLines?: boolean;
  enginePowerHp?: number;
  boomLengthM?: number;
  hasAirConditioning?: boolean;
  driveType?: '4x4' | 'AWD' | 'FWD' | 'RWD';
  [key: string]: any;
}

export interface Asset {
  id: string;
  ownerId: string;
  parentAssetId?: string | null;
  category: AssetCategory;
  make: string;
  model: string;
  manufactureYear: number;
  plateNumber?: string;
  chassisOrSerialNumber: string;
  libreCertificateNo?: string;
  bolloExpiryDate?: string;
  insuranceExpiryDate?: string;
  meterUnit: MeterUnit;
  currentMeterReading: number;
  requiresCompanyOperator: boolean;
  gpsTrackerImei?: string;
  status: AssetStatus;
  specs: AssetSpecs;
  condition?: 'brand_new' | 'excellent' | 'good' | 'fair';
  primaryImageUrl?: string;
  images8Sides?: Images8Sides;
  partnerInfo?: {
    ownerName: string;
    ownerPhone: string;
    ownerTier: string;
    region: string;
    commissionPct: number;
    agreementDocUrl?: string;
    libreDocUrl?: string;
    deliveryClearance?: {
      paymentMethod: string;
      bankName: string;
      accountNumber: string;
      durationAvailableMonths: number;
      confirmed: boolean;
    };
  };
  gpsLocation?: {
    lat: number;
    lng: number;
    speed: number;
    address: string;
    status: 'moving' | 'idle' | 'geofence_breach';
    lastUpdated: string;
  };
  rateCard?: AssetRateCard;
  owner?: FleetOwner;
  createdAt: string;
}

export interface AssetRateCard {
  id: string;
  assetId: string;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  includedMeterUnitsPerDay: number;
  overtimeRatePerUnit: number;
  idleDayMinimumHours?: number;
  operatorDailyRate: number;
  operatorPerDiemRate: number; // Operator per-diem allowance
  defaultMobilizationFee: number; // Low-bed transport
  securityDepositAmount: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  renterId: string;
  renterName?: string;
  renterPhone?: string;
  status: BookingStatus;
  bookingChannel: 'internal_desk' | 'online_portal' | 'turo_p2p';
  pickupLocation: string;
  dropoffLocation: string;
  projectSiteRegion?: string;
  destinationName?: string;
  destinationDistanceKm?: number;
  roundTripDistanceKm?: number;
  agreedDealKm?: number;
  isOutOfCity: boolean;
  contractDocumentUrl?: string;
  contractDocumentName?: string;
  contractDocumentSize?: string;
  contractDocumentType?: 'pdf' | 'image';
  createdAt: string;
  items?: BookingItem[];
  collateral?: BookingCollateral;
  invoice?: Invoice;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  assetId: string;
  asset?: Asset;
  assignedOperatorId?: string | null;
  assignedOperator?: User | OperatorDriver | null;
  rentalPeriodStart: string; // ISO string
  rentalPeriodEnd: string;   // ISO string
  itemStatus: BookingStatus;
  meterStart?: number;
  meterEnd?: number;
  actualUsedUnits?: number;
  agreedDealUnits?: number;
  overageUnits?: number;
  overageSurcharge?: number;
  mobilizationFeeCharged: number;
}

export interface MachineryDailyTimesheet {
  id: string;
  bookingItemId: string;
  timesheetDate: string;
  engineHoursStart: number;
  engineHoursEnd: number;
  operatingHours: number;
  idleBreakdownHours: number;
  siteSupervisorName?: string;
  siteSupervisorPhone?: string;
  siteSignatureUrl?: string;
  syncedOffline: boolean;
  createdAt: string;
}

export interface BookingCollateral {
  id: string;
  bookingId: string;
  collateralType: CollateralType;
  amount: number;
  bankName?: string;
  instrumentReference?: string;
  guarantorFullName?: string;
  guarantorPhone?: string;
  guarantorFaydaFin?: string;
  guarantorEmployerTin?: string;
  contractDocumentUrl?: string;
  contractDocumentName?: string;
  contractDocumentSize?: string;
  contractDocumentType?: 'pdf' | 'image';
  contractUploadedAt?: string;
  isVerified: boolean;
  verifiedByUserId?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DamageMarker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  partName: string;
  severity: 'minor_scratch' | 'deep_dent' | 'hydraulic_leak' | 'glass_crack';
  notes: string;
  photoUrl?: string;
}

export interface AssetInspection {
  id: string;
  bookingItemId: string;
  inspectionType: 'check_out' | 'check_in';
  inspectorUserId: string;
  inspectorName?: string;
  meterReading: number;
  fuelPercentage: number;
  damageMarkers: DamageMarker[];
  walkaroundPhotos: { angle: string; url: string; timestamp: string }[];
  signedAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  asset?: Asset;
  serviceIntervalKm?: number;
  serviceIntervalHours?: number;
  lastServiceMeter: number;
  nextServiceMeter: number;
  status: 'open' | 'in_progress' | 'completed';
  isSafetyCriticalLock: boolean;
  mechanicNotes?: string;
  mechanicUserId?: string;
  mechanicName?: string;
  serviceType: 'preventative' | 'central_garage' | 'mobile_field';
  createdAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  baseRentalAmount: number;
  overtimeUsageAmount: number;
  operatorAndPerDiemAmount: number;
  mobilizationAmount: number;
  advancePaymentAmount?: number;
  brokerCommissionAmount?: number;
  brokerId?: string;
  brokerName?: string;
  brokerCommissionPct?: number;
  partnerPayoutAmount?: number;
  partnerName?: string;
  paymentMethod?: string;
  vat15PctAmount: number;
  withholding2PctAmount: number;
  withholdingReceiptNo?: string;
  totalPayable: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface OwnerSettlementLedger {
  id: string;
  invoiceId: string;
  ownerId: string;
  ownerName?: string;
  grossRevenue: number;
  platformCommissionPct: number;
  platformCommissionAmount: number;
  workshopRepairDeduction: number;
  netPayoutAmount: number;
  settlementStatus: 'pending' | 'approved' | 'disbursed';
  disbursedAt?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'kyc_validation' | 'safety' | 'maintenance' | 'booking' | 'role_approval' | 'payment';
  recipientRole?: 'head_dispatcher' | 'elshaday_admin' | 'liora_admin' | 'dalol_admin' | 'all' | 'dispatcher';
  targetDivision?: 'all' | 'elshaday' | 'liora' | 'dalol';
  bookingId?: string;
  renterName?: string;
  assetName?: string;
  collateralType?: string;
  contractFileName?: string;
  contractFileSize?: string;
  contractFileUrl?: string;
  contractFileType?: 'pdf' | 'image';
  status: 'pending' | 'approved' | 'rejected';
  read: boolean;
  createdAt: string;
}

export interface Broker {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  regionLocation: {
    region: string;
    citySubcity?: string;
  };
  commissionPct: number;
  tinNumber?: string;
  nationalIdNumber?: string;
  faydaFinNumber?: string;
  status: 'active' | 'inactive' | 'suspended';
  specialization?: 'Heavy Machinery' | 'Commercial & Transport' | 'Passenger Cars' | 'Quarry & Earthmoving' | 'All Assets';
  payoutBank?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  dealsClosedCount: number;
  totalCommissionPaidETB: number;
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// TENDER MODULE & DEL'S BOT INTELLIGENCE TYPES
// ----------------------------------------------------

export type TenderSource = 'merkato' | 'egp';
export type TenderStatus = 'open' | 'review' | 'bid_prepared' | 'submitted' | 'won' | 'closed';
export type TenderCategory = 'car_rental' | 'heavy_machinery' | 'mixed';

export interface TenderRequiredFleetItem {
  category: string;
  description: string;
  quantity: number;
  matchingAssetId?: string;
  matchingAssetName?: string;
  availableCount: number;
}

export interface TenderChecklistItem {
  id: string;
  taskEn: string;
  taskAm: string;
  category: 'cpo' | 'license' | 'technical' | 'financial' | 'submission';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface TenderItem {
  id: string;
  title: string;
  titleAmharic: string;
  refNumber: string;
  source: TenderSource;
  sourceName: string;
  sourceUrl: string;
  issuingOrganization: string;
  issuingOrganizationAmharic: string;
  targetDivision: 'elshaday' | 'liora' | 'both';
  category: TenderCategory;
  location: string;
  publishDate: string;
  closingDate: string;
  closingCountdown: string;
  estimatedBudgetETB: number;
  cpoAmountETB: number;
  matchScore: number; // 0 - 100
  matchGrade: 'high' | 'medium' | 'low';
  matchSummary: string;
  matchSummaryAmharic: string;
  requirements: {
    technical: string[];
    administrative: string[];
    compliance: string[];
  };
  requiredFleet: TenderRequiredFleetItem[];
  status: TenderStatus;
  purchasedDocUrl?: string;
  purchasedDocName?: string;
  checklist: TenderChecklistItem[];
  createdAt: string;
}

export interface DelsBotMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  contentAmharic?: string;
  language: 'en' | 'am';
  timestamp: string;
  roleScopedDivision?: 'elshaday' | 'liora' | 'dalol' | 'all';
  isRestricted?: boolean;
  metadata?: {
    relevantTenders?: string[];
    queriedStats?: Record<string, any>;
    fleetMatched?: string[];
    checklistGenerated?: boolean;
  };
}
