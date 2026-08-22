-- ==============================================================================
-- RESTAURANT MANAGEMENT SYSTEM (RMS) - MASTER DATABASE SCHEMA
-- PostgreSQL / Supabase Migration
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE employment_status_enum AS ENUM ('active', 'on_leave', 'terminated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE staff_role_enum AS ENUM ('waiter', 'cook', 'cleaner', 'host', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status_enum AS ENUM ('scheduled', 'checked_in', 'completed', 'missed', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE table_status_enum AS ENUM ('free', 'occupied', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ingredient_unit_enum AS ENUM ('gram', 'ml', 'piece');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE menu_category_enum AS ENUM ('starter', 'main', 'drink', 'dessert', 'side');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_channel_enum AS ENUM ('dine_in', 'takeout', 'delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('placed', 'preparing', 'ready', 'served', 'paid', 'disputed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cbe_transfer', 'telegram', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'confirmed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category_enum AS ENUM ('rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'misc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- 3.1 Restaurants (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    opening_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"23:00"},"tue":{"open":"08:00","close":"23:00"},"wed":{"open":"08:00","close":"23:00"},"thu":{"open":"08:00","close":"23:00"},"fri":{"open":"08:00","close":"23:30"},"sat":{"open":"08:00","close":"23:30"},"sun":{"open":"09:00","close":"22:30"}}',
    google_business_url TEXT,
    currency TEXT DEFAULT 'ETB',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 Staff (HR & Legal Records)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    personal_id_number TEXT NOT NULL,
    personal_id_doc_url TEXT,
    profile_photo_url TEXT,
    phone_number TEXT NOT NULL,
    email TEXT,
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    date_hired DATE DEFAULT CURRENT_DATE,
    employment_status employment_status_enum DEFAULT 'active',
    role staff_role_enum DEFAULT 'waiter',
    pin_code_hash TEXT NOT NULL,
    base_salary NUMERIC(12,2) DEFAULT 0.00,
    permissions JSONB DEFAULT '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}',
    performance_score NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.3 Shifts (Roster & Clock-In Tracking)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_clock_in TIMESTAMPTZ,
    actual_clock_out TIMESTAMPTZ,
    clock_in_code TEXT NOT NULL,
    status shift_status_enum DEFAULT 'scheduled',
    assigned_tables UUID[] DEFAULT '{}',
    created_by UUID REFERENCES staff(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.4 Training Checklist (Onboarding & Qualifications)
CREATE TABLE IF NOT EXISTS training_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    verified_by UUID REFERENCES staff(id)
);

-- 3.4.2 Clock-In Logs & Attendance Records
CREATE TABLE IF NOT EXISTS clock_in_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    clock_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out_time TIMESTAMPTZ,
    status TEXT DEFAULT 'on_time',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.4.3 Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL DEFAULT 'Annual Leave',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.4.1 Dining Sections (Dynamic Floor Zones)
CREATE TABLE IF NOT EXISTS dining_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Tables (Floor Layout & QR Codes)
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INT NOT NULL,
    capacity INT DEFAULT 4,
    unique_code TEXT UNIQUE NOT NULL,
    section_name TEXT DEFAULT 'Main Dining Hall',
    assigned_staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    status table_status_enum DEFAULT 'free',
    current_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.6 Ingredients (Raw Inventory)
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit ingredient_unit_enum NOT NULL,
    stock_qty NUMERIC(12,3) DEFAULT 0.000,
    low_stock_threshold NUMERIC(12,3) NOT NULL DEFAULT 10.000,
    cost_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.7 Menu Items (Food & Drink Catalog)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category menu_category_enum NOT NULL,
    photo_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time_minutes INT DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.8 Recipes (Bill of Materials)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_required NUMERIC(12,3) NOT NULL,
    UNIQUE (menu_item_id, ingredient_id)
);

-- 3.9 Orders (Headers & Lifecycle)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    channel order_channel_enum DEFAULT 'dine_in',
    status order_status_enum DEFAULT 'placed',
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    calculated_cogs NUMERIC(10,2) DEFAULT 0.00,
    customer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.10 Order Items (Line Items)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    is_cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.11 Payments (Settlement & Validation)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method payment_method_enum NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    transaction_reference TEXT,
    receipt_image_url TEXT,
    status payment_status_enum DEFAULT 'pending',
    confirmed_by UUID REFERENCES staff(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.12 Feedback (Multi-factor Rating & Reputation Engine)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    staff_rating_q1 INT CHECK (staff_rating_q1 BETWEEN 1 AND 5),
    staff_rating_q2 INT CHECK (staff_rating_q2 BETWEEN 1 AND 5),
    experience_rating_food INT CHECK (experience_rating_food BETWEEN 1 AND 5),
    experience_rating_speed INT CHECK (experience_rating_speed BETWEEN 1 AND 5),
    experience_rating_ambience INT CHECK (experience_rating_ambience BETWEEN 1 AND 5),
    weighted_score NUMERIC(3,2) NOT NULL,
    customer_comment TEXT,
    redirected_to_google BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.13 Expenses (Operational Expenditure / OPEX)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category expense_category_enum NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    expense_date DATE DEFAULT CURRENT_DATE,
    logged_by UUID REFERENCES staff(id),
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AUTOMATED BUSINESS FUNCTIONS & TRIGGERS

-- 4.1 Automatic Inventory Deduction & COGS Calculation on Order Item Insertion
CREATE OR REPLACE FUNCTION fn_deduct_recipe_inventory()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    item_cost NUMERIC(10,2) := 0.00;
BEGIN
    -- Loop through all ingredients required for this menu item
    FOR r IN (
        SELECT rc.ingredient_id, rc.quantity_required, ing.cost_per_unit
        FROM recipes rc
        JOIN ingredients ing ON ing.id = rc.ingredient_id
        WHERE rc.menu_item_id = NEW.menu_item_id
    ) LOOP
        -- Deduct from ingredient stock
        UPDATE ingredients
        SET stock_qty = GREATEST(0, stock_qty - (r.quantity_required * NEW.quantity)),
            updated_at = now()
        WHERE id = r.ingredient_id;

        -- Accumulate cost
        item_cost := item_cost + (r.quantity_required * r.cost_per_unit * NEW.quantity);
    END LOOP;

    -- Update order's calculated COGS
    UPDATE orders
    SET calculated_cogs = COALESCE(calculated_cogs, 0) + item_cost
    WHERE id = NEW.order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_recipe_inventory ON order_items;
CREATE TRIGGER trg_deduct_recipe_inventory
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION fn_deduct_recipe_inventory();

-- 4.2 Reverse Inventory Deduction on Order/Item Cancellation or Dispute
CREATE OR REPLACE FUNCTION fn_reverse_recipe_inventory()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    oi RECORD;
    refund_cost NUMERIC(10,2) := 0.00;
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'disputed') AND OLD.status NOT IN ('cancelled', 'disputed')) THEN
        FOR oi IN (SELECT menu_item_id, quantity FROM order_items WHERE order_id = NEW.id AND is_cancelled = false) LOOP
            FOR r IN (
                SELECT rc.ingredient_id, rc.quantity_required, ing.cost_per_unit
                FROM recipes rc
                JOIN ingredients ing ON ing.id = rc.ingredient_id
                WHERE rc.menu_item_id = oi.menu_item_id
            ) LOOP
                UPDATE ingredients
                SET stock_qty = stock_qty + (r.quantity_required * oi.quantity),
                    updated_at = now()
                WHERE id = r.ingredient_id;

                refund_cost := refund_cost + (r.quantity_required * r.cost_per_unit * oi.quantity);
            END LOOP;
        END LOOP;

        NEW.calculated_cogs := GREATEST(0, COALESCE(NEW.calculated_cogs, 0) - refund_cost);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reverse_recipe_inventory ON orders;
CREATE TRIGGER trg_reverse_recipe_inventory
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION fn_reverse_recipe_inventory();

-- 4.3 Rolling Staff Performance Score Calculation
CREATE OR REPLACE FUNCTION fn_update_staff_performance()
RETURNS TRIGGER AS $$
DECLARE
    avg_score NUMERIC(3,2);
BEGIN
    IF NEW.staff_id IS NOT NULL THEN
        SELECT ROUND(AVG(weighted_score), 2)
        INTO avg_score
        FROM feedback
        WHERE staff_id = NEW.staff_id;

        UPDATE staff
        SET performance_score = COALESCE(avg_score, 5.00)
        WHERE id = NEW.staff_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_staff_performance ON feedback;
CREATE TRIGGER trg_update_staff_performance
AFTER INSERT OR UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION fn_update_staff_performance();

-- 4.4 Table Status Synchronizer
CREATE OR REPLACE FUNCTION fn_sync_table_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.table_id IS NOT NULL THEN
        UPDATE tables
        SET status = 'occupied',
            current_order_id = NEW.id
        WHERE id = NEW.table_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'paid' AND NEW.table_id IS NOT NULL THEN
        UPDATE tables
        SET status = 'free',
            current_order_id = NULL
        WHERE id = NEW.table_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_table_status ON orders;
CREATE TRIGGER trg_sync_table_status
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION fn_sync_table_status();

-- 5. STORAGE BUCKETS SETUP (Run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('staff-docs', 'staff-docs', false),
    ('menu-photos', 'menu-photos', true),
    ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- -- Storage RLS
CREATE POLICY "Public menu photos" ON storage.objects FOR SELECT USING (bucket_id = 'menu-photos');
CREATE POLICY "Public payment receipts" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts');
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (true);
;
