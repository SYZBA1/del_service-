-- =========================================================================
-- DEL Platform: Hybrid Car & Heavy Machinery Rental ERP + Turo P2P Marketplace
-- Target: PostgreSQL 16
-- Locale: Ethiopia (ETB / Fayda FIN / VAT / Withholding)
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'super_admin', 'dispatcher', 'mechanic', 'fleet_owner', 'renter', 'operator'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE owner_tier_type AS ENUM (
    'internal_company', 'corporate_partner', 'individual_host'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE asset_category_type AS ENUM (
    'passenger_car', 'commercial_van', 'heavy_machinery', 'power_equipment', 'attachment'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE meter_unit_type AS ENUM (
    'odometer_km', 'engine_hours', 'calendar_days_only'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE asset_status_type AS ENUM (
    'available', 'on_rent', 'in_transit', 'maintenance', 'pending_approval', 'retired'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status_type AS ENUM (
    'draft', 'pending_host_approval', 'kyc_pending', 'confirmed', 'dispatched', 'active', 'completed', 'cancelled', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE collateral_type AS ENUM (
    'cash_cpo', 'bank_guarantee', 'post_dated_check', 'personal_guarantor_was', 'corporate_po', 'digital_wallet_hold'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TABLES

-- Users & Ethiopian Identity KYC
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  role user_role_type NOT NULL DEFAULT 'renter',
  fayda_fin_number VARCHAR(50) UNIQUE,
  tin_number VARCHAR(30),
  driver_license_grade VARCHAR(30), -- e.g., 'ልዩ ተንቀሳቃሽ' for heavy equipment, 'ህዝብ 1', 'ደረቅ 1'
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  kyc_documents JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-Tenant Fleet Owners (Internal DEL Fleet vs Turo P2P Hosts)
CREATE TABLE IF NOT EXISTS fleet_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES users(id),
  company_name VARCHAR(150),
  owner_type owner_tier_type NOT NULL DEFAULT 'internal_company',
  tin_number VARCHAR(30) UNIQUE,
  platform_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  payout_bank_name VARCHAR(80),
  payout_account_number VARCHAR(50),
  instant_book_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Polymorphic Fleet Assets (Cars, SUVs, Excavators, Loaders, Attachments)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES fleet_owners(id),
  parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Hydraulic attachments link to host machinery
  category asset_category_type NOT NULL,
  make VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  manufacture_year INT NOT NULL,
  plate_number VARCHAR(30) UNIQUE,
  chassis_or_serial_number VARCHAR(80) UNIQUE NOT NULL,
  libre_certificate_no VARCHAR(50),
  bollo_expiry_date DATE,
  insurance_expiry_date DATE,
  meter_unit meter_unit_type NOT NULL,
  current_meter_reading NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  requires_company_operator BOOLEAN NOT NULL DEFAULT FALSE,
  gps_tracker_imei VARCHAR(50) UNIQUE,
  status asset_status_type NOT NULL DEFAULT 'available',
  specs JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asset Rate Cards & Pricing Matrix
CREATE TABLE IF NOT EXISTS asset_rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL UNIQUE REFERENCES assets(id) ON DELETE CASCADE,
  daily_rate NUMERIC(12,2) NOT NULL,
  weekly_rate NUMERIC(12,2),
  monthly_rate NUMERIC(12,2),
  included_meter_units_per_day NUMERIC(8,2) NOT NULL DEFAULT 8.00, -- 200 km/day for cars, 8 hrs/day for machinery
  overtime_rate_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  idle_day_minimum_hours NUMERIC(5,2) DEFAULT 4.00,
  operator_daily_rate NUMERIC(10,2) DEFAULT 0.00,
  operator_per_diem_rate NUMERIC(10,2) DEFAULT 0.00, -- ውሎ አበል
  default_mobilization_fee NUMERIC(12,2) DEFAULT 0.00, -- Low-bed flatbed truck transport
  security_deposit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

-- Bookings (Master Header)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(25) UNIQUE NOT NULL,
  renter_id UUID NOT NULL REFERENCES users(id),
  status booking_status_type NOT NULL DEFAULT 'draft',
  booking_channel VARCHAR(30) NOT NULL DEFAULT 'internal_desk',
  pickup_location VARCHAR(200) NOT NULL,
  dropoff_location VARCHAR(200) NOT NULL,
  project_site_region VARCHAR(100),
  is_out_of_city BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Items with GiST Anti-Double-Booking Exclusion Constraints
CREATE TABLE IF NOT EXISTS booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id),
  assigned_operator_id UUID REFERENCES users(id),
  rental_period TSTZRANGE NOT NULL,
  item_status booking_status_type NOT NULL DEFAULT 'confirmed',
  meter_start NUMERIC(12,2),
  meter_end NUMERIC(12,2),
  mobilization_fee_charged NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT no_overlapping_asset_bookings EXCLUDE USING gist (
    asset_id WITH =,
    rental_period WITH &&
  ) WHERE (item_status IN ('confirmed', 'dispatched', 'active')),
  CONSTRAINT no_overlapping_operator_bookings EXCLUDE USING gist (
    assigned_operator_id WITH =,
    rental_period WITH &&
  ) WHERE (item_status IN ('confirmed', 'dispatched', 'active') AND assigned_operator_id IS NOT NULL)
);

-- Machinery Daily Timesheets (Offline-Ready)
CREATE TABLE IF NOT EXISTS machinery_daily_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE CASCADE,
  timesheet_date DATE NOT NULL,
  engine_hours_start NUMERIC(10,2) NOT NULL,
  engine_hours_end NUMERIC(10,2) NOT NULL,
  operating_hours NUMERIC(10,2) NOT NULL,
  idle_breakdown_hours NUMERIC(10,2) DEFAULT 0.00,
  site_supervisor_name VARCHAR(120),
  site_supervisor_phone VARCHAR(25),
  site_signature_url TEXT,
  synced_offline BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ethiopian Trust Collateral & Guarantor (ዋስ) Vault
CREATE TABLE IF NOT EXISTS booking_collaterals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  collateral_type collateral_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  bank_name VARCHAR(80),
  instrument_reference VARCHAR(60),
  guarantor_full_name VARCHAR(150),
  guarantor_phone VARCHAR(20),
  guarantor_fayda_fin VARCHAR(50),
  guarantor_employer_tin VARCHAR(30),
  contract_document_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by_user_id UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Field Inspections (8-Angle Walkaround & Damage Map)
CREATE TABLE IF NOT EXISTS asset_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE CASCADE,
  inspection_type VARCHAR(20) NOT NULL, -- 'check_out', 'check_in'
  inspector_user_id UUID NOT NULL REFERENCES users(id),
  meter_reading NUMERIC(12,2) NOT NULL,
  fuel_percentage INT NOT NULL DEFAULT 100,
  damage_markers JSONB DEFAULT '[]'::JSONB,
  walkaround_photos JSONB DEFAULT '[]'::JSONB,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preventative Maintenance & Service Locks
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  service_interval_km NUMERIC(10,2) DEFAULT 5000.00,
  service_interval_hours NUMERIC(10,2) DEFAULT 250.00,
  last_service_meter NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  next_service_meter NUMERIC(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'completed'
  is_safety_critical_lock BOOLEAN NOT NULL DEFAULT FALSE,
  mechanic_notes TEXT,
  mechanic_user_id UUID REFERENCES users(id),
  service_type VARCHAR(50) DEFAULT 'preventative', -- 'central_garage', 'mobile_field'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices & Ethiopian Tax Computation (15% VAT, 2% Withholding)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number VARCHAR(40) UNIQUE NOT NULL,
  base_rental_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  overtime_usage_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  operator_and_per_diem_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  mobilization_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  vat_15_pct_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  withholding_2_pct_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  withholding_receipt_no VARCHAR(50),
  total_payable NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-Tenant Host Payout Settlement Ledgers
CREATE TABLE IF NOT EXISTS owner_settlement_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES fleet_owners(id),
  gross_revenue NUMERIC(12,2) NOT NULL,
  platform_commission_pct NUMERIC(5,2) NOT NULL,
  platform_commission_amount NUMERIC(12,2) NOT NULL,
  workshop_repair_deduction NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  net_payout_amount NUMERIC(12,2) NOT NULL,
  settlement_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'disbursed'
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SAFETY TRIGGER: AUTO-SYNC METER & TRIGGER MAINTENANCE LOCK
CREATE OR REPLACE FUNCTION fn_after_inspection_meter_sync()
RETURNS TRIGGER AS $$
DECLARE
  v_asset_id UUID;
  v_meter_unit meter_unit_type;
  v_curr_meter NUMERIC(12,2);
  v_next_maint NUMERIC(12,2);
BEGIN
  -- Retrieve asset details
  SELECT bi.asset_id, a.meter_unit, a.current_meter_reading
  INTO v_asset_id, v_meter_unit, v_curr_meter
  FROM booking_items bi
  JOIN assets a ON a.id = bi.asset_id
  WHERE bi.id = NEW.booking_item_id;

  IF NEW.meter_reading > v_curr_meter THEN
    -- Update asset meter reading
    UPDATE assets
    SET current_meter_reading = NEW.meter_reading
    WHERE id = v_asset_id;

    -- Check if maintenance threshold is exceeded
    SELECT next_service_meter INTO v_next_maint
    FROM maintenance_schedules
    WHERE asset_id = v_asset_id AND status != 'completed'
    ORDER BY next_service_meter ASC
    LIMIT 1;

    IF v_next_maint IS NOT NULL AND NEW.meter_reading >= v_next_maint THEN
      UPDATE assets SET status = 'maintenance' WHERE id = v_asset_id;
      UPDATE maintenance_schedules
      SET is_safety_critical_lock = TRUE
      WHERE asset_id = v_asset_id AND status != 'completed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_inspection_meter_sync ON asset_inspections;
CREATE TRIGGER trg_after_inspection_meter_sync
AFTER INSERT ON asset_inspections
FOR EACH ROW
EXECUTE FUNCTION fn_after_inspection_meter_sync();
