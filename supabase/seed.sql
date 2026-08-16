-- ==============================================================================
-- RESTAURANT MANAGEMENT SYSTEM (RMS) - MASTER DATABASE SEED DATA
-- Run this in your Supabase SQL Editor to populate all MVP data.
-- ==============================================================================

-- 1. RESTAURANT ROOT ENTITY
INSERT INTO restaurants (
    id,
    name,
    address,
    phone,
    currency,
    google_business_url,
    opening_hours
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Admas Luxury Dining & Lounge',
    'Bole Sub-City, Cape Verde Street / Africa Avenue, Addis Ababa, Ethiopia',
    '+251911223344',
    'ETB',
    'https://maps.google.com/?q=Admas+Lounge+Addis+Ababa',
    '{"mon":{"open":"11:00","close":"23:00"},"tue":{"open":"11:00","close":"23:00"},"wed":{"open":"11:00","close":"23:00"},"thu":{"open":"11:00","close":"23:00"},"fri":{"open":"11:00","close":"01:00"},"sat":{"open":"11:00","close":"01:00"},"sun":{"open":"10:00","close":"22:30"}}'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. STAFF & HR PERSONNEL RECORDS (PIN: 123456)
INSERT INTO staff (
    id,
    restaurant_id,
    full_name,
    personal_id_number,
    phone_number,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    address,
    date_of_birth,
    date_hired,
    employment_status,
    role,
    pin_code_hash,
    base_salary,
    performance_score,
    permissions
) VALUES 
-- 2.1 Owner (Super Admin)
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Abebe Kebede',
    'ETH-FAYDA-98234120',
    '+251911001122',
    'owner@admasrms.com',
    'Sara Kebede (Spouse)',
    '+251911998877',
    'Bole, House 412, Addis Ababa',
    '1985-04-12',
    '2024-01-01',
    'active',
    'admin',
    '123456',
    0.00,
    5.00,
    '{"can_manage_inventory":true,"can_view_finance":true,"can_manage_shifts":true,"can_manage_staff":true}'
),
-- 2.2 Operations Manager
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Tigist Haile',
    'ETH-FAYDA-48192031',
    '+251922334455',
    'manager@admasrms.com',
    'Haile Wolde (Father)',
    '+251922887766',
    'Gerji, Condominium Blk 14, Addis Ababa',
    '1991-08-20',
    '2024-02-15',
    'active',
    'manager',
    '123456',
    25000.00,
    4.95,
    '{"can_manage_inventory":true,"can_view_finance":true,"can_manage_shifts":true,"can_manage_staff":true}'
),
-- 2.3 Inventory Specialist
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Alemayehu Tura',
    'ETH-FAYDA-39201948',
    '+251944556677',
    'inventory@admasrms.com',
    'Tura Bekele (Brother)',
    '+251944112233',
    'Bole Bulbula, Addis Ababa',
    '1993-06-14',
    '2024-03-01',
    'active',
    'manager',
    '123456',
    16000.00,
    4.88,
    '{"can_manage_inventory":true,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
),
-- 2.4 Head Kitchen Chef
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Kassahun Lemma',
    'ETH-FAYDA-51920384',
    '+251955667788',
    'chef@admasrms.com',
    'Lemma Assefa (Father)',
    '+251955001122',
    'Piazza, Kebele 12, Addis Ababa',
    '1988-11-23',
    '2024-01-10',
    'active',
    'cook',
    '123456',
    22000.00,
    4.96,
    '{"can_manage_inventory":true,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
),
-- 2.5 Lead Floor Waiter (Michael)
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Michael Tadesse',
    'ETH-FAYDA-67291048',
    '+251933445566',
    'waiter@admasrms.com',
    'Tadesse Wondimu (Father)',
    '+251933998877',
    'Megenaña, Kebele 08, Addis Ababa',
    '1996-03-18',
    '2024-02-01',
    'active',
    'waiter',
    '123456',
    9500.00,
    4.92,
    '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
),
-- 2.6 Terrace Waiter (Sara)
(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'Sara Mengistu',
    'ETH-FAYDA-19203847',
    '+251966778899',
    'sara.m@admasrms.com',
    'Mengistu Hailu (Father)',
    '+251966001122',
    'Sarbet, House 812, Addis Ababa',
    '1998-07-09',
    '2024-03-15',
    'active',
    'waiter',
    '123456',
    9000.00,
    4.88,
    '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
),
-- 2.7 Lounge Waiter (Eden)
(
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'Eden Haile',
    'ETH-FAYDA-71829304',
    '+251977889900',
    'eden.h@admasrms.com',
    'Haile Berhe (Father)',
    '+251977112233',
    'Hayahulet, Addis Ababa',
    '1999-01-25',
    '2024-04-01',
    'active',
    'waiter',
    '123456',
    8800.00,
    4.75,
    '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
),
-- 2.8 VIP Host (Dawit)
(
    'b0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'Dawit Bekele',
    'ETH-FAYDA-82910394',
    '+251988990011',
    'dawit.b@admasrms.com',
    'Bekele Tolessa (Father)',
    '+251988223344',
    'Kazanchis, Addis Ababa',
    '1995-10-11',
    '2024-01-20',
    'active',
    'host',
    '123456',
    12000.00,
    4.96,
    '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    pin_code_hash = EXCLUDED.pin_code_hash,
    permissions = EXCLUDED.permissions;

-- 3. RAW INGREDIENTS DIRECTORY
INSERT INTO ingredients (
    id,
    restaurant_id,
    name,
    unit,
    stock_qty,
    low_stock_threshold,
    cost_per_unit
) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Prime Beef Tenderloin', 'gram', 3200, 8000, 0.4800),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Free-Range Chicken Drumsticks', 'gram', 14500, 10000, 0.3200),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Niter Kibbeh (Clarified Butter)', 'gram', 2400, 6000, 0.5200),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Aged Berbere Spice Blend', 'gram', 1100, 3000, 0.2900),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Wild Highland Honey', 'ml', 1800, 5000, 0.3500),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '100% Pure Teff Flour', 'gram', 48000, 20000, 0.0950),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Sun-Dried Shiro Powder', 'gram', 18000, 10000, 0.1400),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Specialty Yirgacheffe Beans', 'gram', 9500, 5000, 0.4100),
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Fresh Ayib Curd Cheese', 'gram', 6200, 4000, 0.1800),
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Organic Red Onions', 'gram', 32000, 15000, 0.0450)
ON CONFLICT (id) DO NOTHING;

-- 4. DIGITAL MENU CATALOG
INSERT INTO menu_items (
    id,
    restaurant_id,
    name,
    description,
    price,
    category,
    is_available,
    preparation_time_minutes
) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Special Sizzling Awaze Tibs', 'Prime beef tenderloin seared in spiced butter, rosemary, shallots and stone-ground awaze.', 520.00, 'main', true, 14),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Royal Doro Wat Feast', 'Slow-simmered chicken drumsticks in rich berbere gravy, farm egg and fresh ayib.', 580.00, 'main', true, 18),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Gourmet Kereyu Kitfo Royale', 'Minced lean beef warmed in korerima cardamom and niter kibbeh with seasoned gomen.', 640.00, 'main', true, 12),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Claypot Sizzling Shiro Misto', 'Bubbling sun-dried chickpea flour stew enriched with beef cubes and garlic.', 360.00, 'main', true, 12),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Crispy Lentil & Beef Sambusa', 'Crisp hand-rolled pastry triangles with cumin, spiced lentils and ground beef.', 220.00, 'starter', true, 8),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Keren Sheba Honey Tej (Decanter)', 'Naturally fermented mead made with pure wild highland forest honey.', 320.00, 'drink', true, 3),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Single-Origin Yirgacheffe Pour-Over', 'Grade-1 specialty coffee brewed tableside with frankincense smoke.', 160.00, 'drink', true, 6),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Cardamom & Honey Baklava', 'Flaky phyllo pastry layered with pistachios and drenched in orange-blossom honey.', 240.00, 'dessert', true, 5)
ON CONFLICT (id) DO NOTHING;

-- 5. RECIPE BILL OF MATERIALS (BOM)
INSERT INTO recipes (menu_item_id, ingredient_id, quantity_required)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 280),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 40),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 20),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 150),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 350),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 80),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 50),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 500),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 200)
ON CONFLICT DO NOTHING;

-- 6. PHYSICAL TABLES FLOOR MAP (25 Tables)
INSERT INTO tables (
    restaurant_id,
    table_number,
    capacity,
    unique_code,
    status,
    assigned_staff_id
) VALUES
('a0000000-0000-0000-0000-000000000001', 1, 2, 'T-01', 'occupied', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 2, 4, 'T-02', 'occupied', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 3, 4, 'T-03', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 4, 4, 'T-04', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 5, 6, 'T-05', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 6, 2, 'T-06', 'free', 'b0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000001', 7, 4, 'T-07', 'occupied', 'b0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000001', 8, 8, 'T-08', 'reserved', 'b0000000-0000-0000-0000-000000000008'),
('a0000000-0000-0000-0000-000000000001', 9, 4, 'T-09', 'free', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 10, 2, 'T-10', 'free', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 11, 4, 'T-11', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 12, 4, 'T-12', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 13, 6, 'T-13', 'free', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 14, 4, 'T-14', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 15, 2, 'T-15', 'occupied', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 16, 4, 'T-16', 'free', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 17, 2, 'T-17', 'occupied', 'b0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000001', 18, 4, 'T-18', 'occupied', 'b0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000001', 19, 4, 'T-19', 'free', 'b0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000001', 20, 10, 'T-20', 'occupied', 'b0000000-0000-0000-0000-000000000008'),
('a0000000-0000-0000-0000-000000000001', 21, 4, 'T-21', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 22, 4, 'T-22', 'occupied', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 23, 6, 'T-23', 'reserved', 'b0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000001', 24, 4, 'T-24', 'occupied', 'b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000001', 25, 2, 'T-25', 'free', 'b0000000-0000-0000-0000-000000000006')
ON CONFLICT (unique_code) DO UPDATE SET
    capacity = EXCLUDED.capacity,
    status = EXCLUDED.status;

-- 7. OPERATIONAL EXPENSES LOG (OPEX)
INSERT INTO expenses (
    restaurant_id,
    category,
    title,
    amount,
    expense_date,
    logged_by
) VALUES
('a0000000-0000-0000-0000-000000000001', 'rent', 'Bole Medhanialem Commercial Premises Rent (August)', 140000.00, '2026-08-01', 'b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000001', 'salaries', 'Kitchen, Attendant & Host Payroll Base', 185000.00, '2026-08-05', 'b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000001', 'utilities', 'Electricity, Commercial Water & 100Mbps Fiber', 28500.00, '2026-08-08', 'b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000001', 'supplies', 'Takeout Kraft Eco-Boxes, Napkins & Cleaning Agents', 14200.00, '2026-08-12', 'b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000001', 'maintenance', 'Espresso Machine Boiler Servicing & Acacia Hearth Charcoal', 8600.00, '2026-08-14', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 8. SHIFTS & ROSTER (Dynamic table lookup)
INSERT INTO shifts (
    id,
    restaurant_id,
    staff_id,
    shift_date,
    scheduled_start,
    scheduled_end,
    actual_clock_in,
    clock_in_code,
    status,
    assigned_tables,
    notes
) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', CURRENT_DATE, (CURRENT_DATE || ' 11:30:00')::timestamptz, (CURRENT_DATE || ' 20:30:00')::timestamptz, (CURRENT_DATE || ' 11:28:00')::timestamptz, '381940', 'checked_in', ARRAY(SELECT id FROM tables WHERE unique_code IN ('T-03','T-04','T-05','T-09','T-11','T-12')), 'Main Dining Hall Section Lead'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', CURRENT_DATE, (CURRENT_DATE || ' 11:00:00')::timestamptz, (CURRENT_DATE || ' 19:00:00')::timestamptz, (CURRENT_DATE || ' 10:52:00')::timestamptz, '749201', 'checked_in', ARRAY(SELECT id FROM tables WHERE unique_code IN ('T-01','T-02','T-10','T-15','T-16')), 'Terrace Garden Lead Attendant'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', CURRENT_DATE, (CURRENT_DATE || ' 14:00:00')::timestamptz, (CURRENT_DATE || ' 23:00:00')::timestamptz, (CURRENT_DATE || ' 13:55:00')::timestamptz, '592013', 'checked_in', ARRAY(SELECT id FROM tables WHERE unique_code IN ('T-06','T-07','T-17','T-18')), 'Lounge & Bar Evening Shift'),
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', CURRENT_DATE, (CURRENT_DATE || ' 10:00:00')::timestamptz, (CURRENT_DATE || ' 18:30:00')::timestamptz, (CURRENT_DATE || ' 09:50:00')::timestamptz, '918234', 'checked_in', '{}', 'Head Kitchen & Hearth Chef')
ON CONFLICT (id) DO NOTHING;

-- 9. LIVE ORDERS & FULFILLMENT (Dynamic table UUID lookups)
INSERT INTO orders (
    id,
    restaurant_id,
    table_id,
    staff_id,
    channel,
    status,
    total_amount,
    calculated_cogs,
    customer_notes,
    created_at
) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', (SELECT id FROM tables WHERE unique_code = 'T-04' LIMIT 1), 'b0000000-0000-0000-0000-000000000005', 'dine_in', 'placed', 1160.00, 366.50, 'Extra awaze on side, mild spice for kitfo', now() - interval '8 minutes'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', (SELECT id FROM tables WHERE unique_code = 'T-15' LIMIT 1), 'b0000000-0000-0000-0000-000000000006', 'dine_in', 'placed', 780.00, 245.00, null, now() - interval '12 minutes'),
('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', (SELECT id FROM tables WHERE unique_code = 'T-03' LIMIT 1), 'b0000000-0000-0000-0000-000000000005', 'dine_in', 'preparing', 2180.00, 690.00, null, now() - interval '18 minutes'),
('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', (SELECT id FROM tables WHERE unique_code = 'T-01' LIMIT 1), 'b0000000-0000-0000-0000-000000000006', 'dine_in', 'ready', 840.00, 274.00, null, now() - interval '24 minutes'),
('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', (SELECT id FROM tables WHERE unique_code = 'T-12' LIMIT 1), 'b0000000-0000-0000-0000-000000000005', 'dine_in', 'served', 1420.00, 460.00, null, now() - interval '38 minutes')
ON CONFLICT (id) DO NOTHING;

-- 10. ORDER ITEMS
INSERT INTO order_items (
    order_id,
    menu_item_id,
    quantity,
    unit_price,
    subtotal
) VALUES
('10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, 520.00, 520.00),
('10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 1, 640.00, 640.00),
('10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 1, 360.00, 360.00),
('10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', 1, 320.00, 320.00),
('10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000007', 1, 100.00, 100.00),
('10000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 2, 520.00, 1040.00),
('10000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 1, 580.00, 580.00),
('10000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000008', 2, 240.00, 480.00)
ON CONFLICT (id) DO NOTHING;

-- 11. PAYMENTS
INSERT INTO payments (
    order_id,
    method,
    amount,
    transaction_reference,
    status,
    confirmed_by,
    confirmed_at
) VALUES
('10000000-0000-0000-0000-000000000005', 'cash', 1420.00, null, 'confirmed', 'b0000000-0000-0000-0000-000000000005', now() - interval '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- 12. CUSTOMER FEEDBACK & GOOGLE REVIEWS
INSERT INTO feedback (
    order_id,
    staff_id,
    staff_rating_q1,
    staff_rating_q2,
    experience_rating_food,
    experience_rating_speed,
    experience_rating_ambience,
    weighted_score,
    customer_comment,
    redirected_to_google
) VALUES
('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 5, 5, 5, 5, 5, 5.00, 'The Sizzling Awaze Tibs was extraordinary. Michael anticipated our every request!', true)
ON CONFLICT (order_id) DO NOTHING;

-- 13. TRAINING CHECKLIST
INSERT INTO training_checklist (
    staff_id,
    item_name,
    category,
    completed,
    completed_at,
    verified_by
) VALUES
('b0000000-0000-0000-0000-000000000005', 'Table Etiquette & Greeting Standards', 'Customer Service', true, now(), 'b0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000005', 'Digital Menu & Allergen Knowledge', 'Menu & Food', true, now(), 'b0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000005', 'QR Table System & CBE/Telebirr Verification', 'POS & Payments', true, now(), 'b0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000005', 'Complaint Handling & Escalation Protocol', 'Customer Service', false, null, null)
ON CONFLICT (id) DO NOTHING;
