import { Asset, AssetRateCard } from './types';

export interface QuoteInput {
  asset: Asset;
  rateCard: AssetRateCard;
  days: number;
  estimatedExtraUnits?: number; // extra KM or extra Engine Hours
  includeOperator?: boolean;
  isSelfDrive?: boolean;
  isOutOfCity?: boolean;
  includeMobilization?: boolean;
  isB2BCustomer?: boolean;
  customerHasTin?: boolean;
  operatorDailyWage?: number;
  operatorPerDiemWage?: number;
  agreedDealKm?: number;
  routeDistanceCost?: number;
  startGauge?: number;
  endGauge?: number;
  actualUsedUnits?: number;
  agreedDealUnits?: number;
  overageSurcharge?: number;
}

export interface QuoteBreakdown {
  dailyRate: number;
  days: number;
  baseRental: number;
  includedUnitsTotal: number;
  meterUnit: string;
  overtimeUnits: number;
  overtimeRate: number;
  overtimeAmount: number;
  operatorDailyRate: number;
  operatorDailyTotal: number;
  operatorPerDiemRate: number; // Operator per-diem allowance
  operatorPerDiemTotal: number;
  operatorTotal: number;
  mobilizationFee: number;
  routeDistanceCost: number;
  agreedDealKm?: number;
  startGauge?: number;
  endGauge?: number;
  actualUsedUnits?: number;
  agreedDealUnits?: number;
  subtotal: number;
  taxableSubtotal: number;
  vat15Pct: number;
  withholding2Pct: number;
  isWithholdingApplicable: boolean;
  totalPayable: number;
  securityDeposit: number;
  // Multi-tenant P2P Split
  hostGrossRevenue: number;
  platformCommissionPct: number;
  platformCommissionAmount: number;
  hostNetPayoutEstimate: number;
}

export function calculateEthiopianQuote(input: QuoteInput, platformCommissionPct: number = 0): QuoteBreakdown {
  const {
    asset,
    rateCard,
    days,
    estimatedExtraUnits = 0,
    includeOperator = false,
    isSelfDrive = false,
    isOutOfCity = false,
    includeMobilization = false,
    isB2BCustomer = true,
    customerHasTin = true,
    operatorDailyWage,
    operatorPerDiemWage,
    agreedDealKm = 0,
    routeDistanceCost = 0,
    startGauge,
    endGauge,
    actualUsedUnits,
    agreedDealUnits,
    overageSurcharge,
  } = input;

  const validDays = Math.max(1, days);
  const baseRental = rateCard.dailyRate * validDays;
  const standardIncludedUnits = (rateCard.includedMeterUnitsPerDay || 0) * validDays;
  const resolvedAgreedUnits = agreedDealUnits !== undefined 
    ? agreedDealUnits 
    : (agreedDealKm > 0 ? Math.max(standardIncludedUnits, agreedDealKm) : standardIncludedUnits);

  // Gauge Overtime / Excess Usage Calculation
  let calculatedOvertimeUnits = Math.max(0, estimatedExtraUnits);
  let calculatedOvertimeAmount = 0;

  if (actualUsedUnits !== undefined && resolvedAgreedUnits !== undefined) {
    calculatedOvertimeUnits = Math.max(0, actualUsedUnits - resolvedAgreedUnits);
    calculatedOvertimeAmount = overageSurcharge !== undefined 
      ? overageSurcharge 
      : calculatedOvertimeUnits * (rateCard.overtimeRatePerUnit || 0);
  } else if (overageSurcharge !== undefined) {
    calculatedOvertimeAmount = overageSurcharge;
  } else {
    calculatedOvertimeAmount = calculatedOvertimeUnits * (rateCard.overtimeRatePerUnit || 0);
  }

  // Operator & Per Diem Allowance
  let opDailyRate = 0;
  let opPerDiemRate = 0;
  let operatorDailyTotal = 0;
  let operatorPerDiemTotal = 0;

  if (!isSelfDrive && (includeOperator || asset.requiresCompanyOperator)) {
    opDailyRate = operatorDailyWage !== undefined ? operatorDailyWage : (rateCard.operatorDailyRate || 0);
    operatorDailyTotal = opDailyRate * validDays;

    opPerDiemRate = operatorPerDiemWage !== undefined ? operatorPerDiemWage : (rateCard.operatorPerDiemRate || 0);
    // Per diem is strictly applied if out of city or project site
    if (isOutOfCity || (opPerDiemRate > 0 && isOutOfCity)) {
      operatorPerDiemTotal = opPerDiemRate * validDays;
    }
  }

  const operatorTotal = operatorDailyTotal + operatorPerDiemTotal;

  // Mobilization (Low-bed truck transport for heavy machinery)
  const mobilizationFee = (includeMobilization && asset.category === 'heavy_machinery')
    ? (rateCard.defaultMobilizationFee || 0)
    : 0;

  // Taxable Subtotal before Ethiopian VAT: Sum of all active billing items
  const taxableSubtotal = baseRental + calculatedOvertimeAmount + operatorDailyTotal + operatorPerDiemTotal + mobilizationFee + routeDistanceCost;
  const subtotal = taxableSubtotal;

  // Ethiopian 15% VAT
  const vat15Pct = Math.round((taxableSubtotal * 0.15) * 100) / 100;

  // Conditional 2% Withholding Tax (WHT):
  // Applicable only if client is B2B Corporate (or has TIN) and taxableSubtotal > 10,000 ETB
  const isWithholdingApplicable = isB2BCustomer && customerHasTin && taxableSubtotal > 10000;
  const withholding2Pct = isWithholdingApplicable
    ? Math.round((taxableSubtotal * 0.02) * 100) / 100
    : 0;

  // Total payable by client = Taxable Subtotal + VAT (15%) - WHT (2%)
  const totalPayable = Math.round((taxableSubtotal + vat15Pct - withholding2Pct) * 100) / 100;

  // Host Settlement Split
  const hostGrossRevenue = subtotal;
  const platformCommissionAmount = Math.round((hostGrossRevenue * (platformCommissionPct / 100)) * 100) / 100;
  const hostNetPayoutEstimate = Math.max(0, hostGrossRevenue - platformCommissionAmount);

  return {
    dailyRate: rateCard.dailyRate,
    days: validDays,
    baseRental,
    includedUnitsTotal: resolvedAgreedUnits,
    meterUnit: asset.meterUnit === 'odometer_km' ? 'KM' : asset.meterUnit === 'engine_hours' ? 'Engine Hours' : 'Days',
    overtimeUnits: calculatedOvertimeUnits,
    overtimeRate: rateCard.overtimeRatePerUnit || 0,
    overtimeAmount: calculatedOvertimeAmount,
    operatorDailyRate: opDailyRate,
    operatorDailyTotal,
    operatorPerDiemRate: opPerDiemRate,
    operatorPerDiemTotal,
    operatorTotal,
    mobilizationFee,
    routeDistanceCost,
    agreedDealKm,
    startGauge,
    endGauge,
    actualUsedUnits,
    agreedDealUnits: resolvedAgreedUnits,
    subtotal: taxableSubtotal,
    taxableSubtotal,
    vat15Pct,
    withholding2Pct,
    isWithholdingApplicable,
    totalPayable,
    securityDeposit: rateCard.securityDepositAmount || 0,
    hostGrossRevenue,
    platformCommissionPct,
    platformCommissionAmount,
    hostNetPayoutEstimate,
  };
}
