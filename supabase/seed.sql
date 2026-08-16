-- ==============================================================================
-- RESTAURANT MANAGEMENT SYSTEM (RMS) - MASTER SEED DATA
-- Seed File for Owner, Staff, Menu Items, Ingredients, & Recipes
-- ==============================================================================

-- 1. Default Restaurant Root
INSERT INTO restaurants (id, name, address, phone, currency)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Tibeb Ethiopian Gastronomy & Lounge',
  'Bole Medhanialem, Next to Atlas, Addis Ababa',
  '+251911000000',
  'ETB'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone;

-- 2. Seed Staff Accounts (Owner & Admin)
-- Owner Account
INSERT INTO staff (
  id, restaurant_id, full_name, personal_id_number, phone_number, email,
  emergency_contact_name, emergency_contact_phone, address, date_of_birth,
  employment_status, role, pin_code_hash, base_salary, permissions, performance_score
)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Abebe Kebede (Owner)',
  'ETH-FAYDA-98234120',
  '+251911001122',
  'owner@tibebrms.com',
  'Sara Kebede (Spouse)',
  '+251911998877',
  'Bole, House 412, Addis Ababa',
  '1985-04-12',
  'active',
  'admin',
  '123456',
  0.00,
  '{"can_manage_inventory":true,"can_view_finance":true,"can_manage_shifts":true,"can_manage_staff":true}',
  5.00
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, role = EXCLUDED.role, permissions = EXCLUDED.permissions;

-- Operations Manager Account
INSERT INTO staff (
  id, restaurant_id, full_name, personal_id_number, phone_number, email,
  emergency_contact_name, emergency_contact_phone, address, date_of_birth,
  employment_status, role, pin_code_hash, base_salary, permissions, performance_score
)
VALUES (
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
  'active',
  'manager',
  '123456',
  25000.00,
  '{"can_manage_inventory":true,"can_view_finance":true,"can_manage_shifts":true,"can_manage_staff":true}',
  4.95
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, role = EXCLUDED.role;

-- Waitstaff Account
INSERT INTO staff (
  id, restaurant_id, full_name, personal_id_number, phone_number, email,
  emergency_contact_name, emergency_contact_phone, address, date_of_birth,
  employment_status, role, pin_code_hash, base_salary, permissions, performance_score
)
VALUES (
  'b0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Michael Tadesse',
  'ETH-FAYDA-67291048',
  '+251933445566',
  'waiter@tibebrms.com',
  'Tadesse Wondimu (Father)',
  '+251933998877',
  'Megenaña, Addis Ababa',
  '1996-03-18',
  'active',
  'waiter',
  '123456',
  9500.00,
  '{"can_manage_inventory":false,"can_view_finance":false,"can_manage_shifts":false,"can_manage_staff":false}',
  4.92
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- 3. Seed Core Ingredients (for Inventory & Dynamic Pricing)
INSERT INTO ingredients (id, restaurant_id, name, unit, stock_qty, low_stock_threshold, cost_per_unit)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Prime Beef Tenderloin', 'gram', 3200.0, 8000.0, 0.4800),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Wild Highland Honey', 'ml', 1800.0, 5000.0, 0.3500),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Aged Berbere Spice Blend', 'gram', 1100.0, 3000.0, 0.2900),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Fresh Niter Kibbeh', 'gram', 2400.0, 6000.0, 0.5200),
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Yirgacheffe Specialty Coffee Beans', 'gram', 4500.0, 10000.0, 0.1800)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, cost_per_unit = EXCLUDED.cost_per_unit;

-- 4. Seed Signature Menu Items
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, photo_url, is_available, preparation_time_minutes)
VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Special Sizzling Awaze Tibs', 'Sautéed prime beef tenderloin cubes infused with rosemary, garlic, and aged berbere kibbeh served on a flaming clay skillet.', 680.00, 'main', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', true, 18),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Gourmet Kereyu Kitfo Royale', 'Finely minced beef tenderloin seasoned with mitmita and warm niter kibbeh, served with ayib and gomen.', 640.00, 'main', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80', true, 15),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Claypot Sizzling Shiro Misto', 'Slow-simmered chickpea flour stew enriched with clarified butter, garlic, and green chilies.', 380.00, 'main', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', true, 12),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Single-Origin Yirgacheffe Coffee', 'Artisanal pan-roasted coffee served with traditional frankincense ceremony.', 120.00, 'drink', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', true, 10),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Keren Sheba Honey Tej Decanter', 'Traditional barrel-aged honey wine infused with gesho root.', 450.00, 'drink', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', true, 5)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, price = EXCLUDED.price;

-- 5. Seed Recipes (Bill of Materials)
INSERT INTO recipes (menu_item_id, ingredient_id, quantity_required)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 350.0), -- 350g Beef
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 30.0),  -- 30g Berbere
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 50.0),  -- 50g Kibbeh
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 40.0),  -- 40g Coffee Beans
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 200.0) -- 200ml Honey
ON CONFLICT (menu_item_id, ingredient_id) DO NOTHING;
