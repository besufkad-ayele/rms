-- =====================================================================
-- Keren Addis Restaurant OS - Production Database Seed File
-- =====================================================================

-- 1. Create Default Restaurant Record
INSERT INTO public.restaurants (id, name, address, phone, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Keren Addis Restaurant & Lounge',
  'Keren Addis, Cape Verde Street, Addis Ababa, Ethiopia',
  '+251911234567',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- 2. Seed Personnel / Staff Accounts (Including Super Admin Owner & Manager)
INSERT INTO public.staff (
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
  permissions,
  performance_score,
  created_at
) VALUES
-- Super Admin / Owner Account
(
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Abebe Kebede (Owner)',
  'ETH-FAYDA-98234120',
  '+251911001122',
  'owner@tibebrms.com',
  'Sara Kebede (Spouse)',
  '+251911998877',
  'Keren Addis, House 412, Addis Ababa',
  '1985-04-12',
  '2024-01-01',
  'active',
  'admin',
  'Owner@2026',
  0.00,
  '{"can_manage_inventory": true, "can_view_finance": true, "can_manage_shifts": true, "can_manage_staff": true}',
  5.00,
  NOW()
),
-- Operations Manager Account
(
  'b0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Tigist Haile (Manager)',
  'ETH-FAYDA-48192031',
  '+251922334455',
  'manager@tibebrms.com',
  'Haile Wolde (Father)',
  '+251922887766',
  'Gerji Condominium, Addis Ababa',
  '1991-08-20',
  '2024-02-15',
  'active',
  'manager',
  'Admin@2026',
  25000.00,
  '{"can_manage_inventory": true, "can_view_finance": true, "can_manage_shifts": true, "can_manage_staff": true}',
  4.95,
  NOW()
),
-- Inventory Manager Account
(
  'b0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Alemayehu Tura (Inventory)',
  'ETH-FAYDA-39201948',
  '+251944556677',
  'inventory@tibebrms.com',
  'Tura Bekele (Brother)',
  '+251944112233',
  'Keren Addis, Addis Ababa',
  '1993-06-14',
  '2024-03-01',
  'active',
  'manager',
  'Inv@2026',
  16000.00,
  '{"can_manage_inventory": true, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}',
  4.88,
  NOW()
),
-- Head Chef Account
(
  'b0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Chef Kassahun Lemma',
  'ETH-FAYDA-51920384',
  '+251955667788',
  'chef@tibebrms.com',
  'Lemma Assefa (Father)',
  '+251955001122',
  'Piazza, Kebele 12, Addis Ababa',
  '1988-11-23',
  '2024-01-10',
  'active',
  'cook',
  'Chef@2026',
  22000.00,
  '{"can_manage_inventory": true, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}',
  4.96,
  NOW()
),
-- Lead Waiter Account (Michael Tadesse)
(
  'b0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Michael Tadesse',
  'ETH-FAYDA-67291048',
  '+251933445566',
  'waiter@tibebrms.com',
  'Tadesse Wondimu (Father)',
  '+251933998877',
  'Megenaña, Kebele 08, Addis Ababa',
  '1996-03-18',
  '2024-02-01',
  'active',
  'waiter',
  'Waiter@2026',
  9500.00,
  '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}',
  4.92,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  pin_code_hash = EXCLUDED.pin_code_hash,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- 3. Seed Dining Sections (Dynamic Zones)
INSERT INTO public.dining_sections (id, restaurant_id, name, description, display_order, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Dining Hall', 'Primary indoor dining hall', 1, NOW()),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Terrace Garden', 'Outdoor garden dining patio', 2, NOW()),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Lounge & Bar', 'Highland coffee & cocktail lounge', 3, NOW()),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'VIP Alcove', 'Exclusive private dining rooms', 4, NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 4. Seed Initial 20 Dining Tables for Keren Addis
INSERT INTO public.tables (id, restaurant_id, table_number, unique_code, section_name, capacity, status, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, 'T-01', 'Terrace Garden', 2, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 2, 'T-02', 'Terrace Garden', 2, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 3, 'T-03', 'Terrace Garden', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 4, 'T-04', 'Terrace Garden', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 5, 'T-05', 'Main Dining Hall', 4, 'occupied', NOW()),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 6, 'T-06', 'Main Dining Hall', 6, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 7, 'T-07', 'Main Dining Hall', 4, 'reserved', NOW()),
  ('c0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 8, 'T-08', 'Main Dining Hall', 8, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 9, 'T-09', 'Main Dining Hall', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 10, 'T-10', 'Main Dining Hall', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 11, 'T-11', 'Main Dining Hall', 2, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 12, 'T-12', 'Main Dining Hall', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 13, 'T-13', 'Main Dining Hall', 6, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 14, 'T-14', 'Main Dining Hall', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 15, 'T-15', 'Main Dining Hall', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 16, 'T-16', 'Main Dining Hall', 2, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 17, 'T-17', 'Lounge & Bar', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 18, 'T-18', 'Lounge & Bar', 4, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 19, 'T-19', 'Lounge & Bar', 6, 'free', NOW()),
  ('c0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 20, 'T-20', 'VIP Alcove', 10, 'free', NOW())
ON CONFLICT (unique_code) DO UPDATE SET
  table_number = EXCLUDED.table_number,
  capacity = EXCLUDED.capacity,
  section_name = EXCLUDED.section_name,
  status = EXCLUDED.status;
