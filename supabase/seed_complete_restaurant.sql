-- =====================================================================
-- KEREN ADDIS RESTAURANT OS - COMPLETE IDEMPOTENT MASTER SEED FILE
-- Execute this query directly in your Supabase SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. DISABLE ROW LEVEL SECURITY FOR LOCAL DEVELOPMENT / SEED VISIBILITY
-- ---------------------------------------------------------------------
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    ALTER TABLE public.dining_sections DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.clock_in_logs DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.leave_requests DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.training_checklist DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- 1. RESTAURANT CREATION
-- ---------------------------------------------------------------------
INSERT INTO public.restaurants (id, name, address, phone, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Keren Addis Restaurant & Lounge',
  'Bole Road, Near Friendship Mall, Addis Ababa, Ethiopia',
  '+251911223344',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- ---------------------------------------------------------------------
-- 2. DINING SECTIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dining_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.dining_sections (id, restaurant_id, name, description, display_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Dining Hall', 'Spacious ground floor indoor hall featuring traditional seating and coffee ceremony hearth', 1),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Open Terrace', 'Scenic rooftop terrace with outdoor heating and city skyline view', 2),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Lounge & Bar', 'High-energy cocktail lounge with craft Tej, wine, and live acoustic music', 3),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'VIP Alcove', 'Private secluded booths with premium plush leather seating', 4),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Executive Private Room', 'Dedicated private banquet room for diplomatic and corporate dinners', 5)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- ---------------------------------------------------------------------
-- 3. DINING TABLES (FLOOR LAYOUT & QR CODES T-01 TO T-16)
-- ---------------------------------------------------------------------
ALTER TABLE public.tables ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT 'Main Dining Hall';

INSERT INTO public.tables (id, restaurant_id, table_number, unique_code, capacity, status, section_name, created_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, 'T-01', 2, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 2, 'T-02', 4, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 3, 'T-03', 4, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 4, 'T-04', 6, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 5, 'T-05', 4, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 6, 'T-06', 6, 'free', 'Main Dining Hall', NOW()),
  ('c0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 7, 'T-07', 2, 'free', 'Open Terrace', NOW()),
  ('c0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 8, 'T-08', 4, 'free', 'Open Terrace', NOW()),
  ('c0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 9, 'T-09', 4, 'free', 'Open Terrace', NOW()),
  ('c0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 10, 'T-10', 6, 'free', 'Open Terrace', NOW()),
  ('c0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 11, 'T-11', 2, 'free', 'Lounge & Bar', NOW()),
  ('c0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 12, 'T-12', 4, 'free', 'Lounge & Bar', NOW()),
  ('c0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 13, 'T-13', 4, 'free', 'Lounge & Bar', NOW()),
  ('c0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 14, 'T-14', 6, 'free', 'VIP Alcove', NOW()),
  ('c0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 15, 'T-15', 8, 'free', 'VIP Alcove', NOW()),
  ('c0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 16, 'T-16', 10, 'free', 'Executive Private Room', NOW())
ON CONFLICT (unique_code) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  capacity = EXCLUDED.capacity;

-- ---------------------------------------------------------------------
-- 4. STAFF MEMBERS & CREDENTIALS
-- ---------------------------------------------------------------------
INSERT INTO public.staff (
  id, restaurant_id, full_name, personal_id_number, phone_number, email,
  emergency_contact_name, emergency_contact_phone, address, date_of_birth,
  date_hired, employment_status, role, pin_code_hash, base_salary, permissions, performance_score, created_at
)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Abebe Kebede', 'ETH-FAYDA-98234120', '+251911001122', 'owner@tibebrms.com', 'Sara Kebede', '+251911998877', 'House 412, Bole, Addis Ababa', '1985-04-12', '2024-01-01', 'active', 'admin', 'Owner@2026', 0.0, '{"can_manage_inventory": true, "can_view_finance": true, "can_manage_shifts": true, "can_manage_staff": true}', 5.0, NOW()),
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Tigist Haile', 'ETH-FAYDA-48192031', '+251922334455', 'manager@tibebrms.com', 'Haile Wolde', '+251922887766', 'Gerji Condominium, Addis Ababa', '1991-08-20', '2024-02-15', 'active', 'manager', 'Admin@2026', 25000.0, '{"can_manage_inventory": true, "can_view_finance": true, "can_manage_shifts": true, "can_manage_staff": true}', 4.95, NOW()),
  ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Alemayehu Tura', 'ETH-FAYDA-77123984', '+251933445566', 'inventory@tibebrms.com', 'Tura Bekele', '+251933990011', 'Sarbet, House 104, Addis Ababa', '1989-11-05', '2024-03-01', 'active', 'manager', 'Inv@2026', 18000.0, '{"can_manage_inventory": true, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}', 4.8, NOW()),
  ('b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Chef Kassahun Lemma', 'ETH-FAYDA-11982345', '+251944556677', 'chef@tibebrms.com', 'Lemma Tefera', '+251944112233', 'CMC Tsehay Real Estate, Addis Ababa', '1983-02-14', '2024-01-10', 'active', 'cook', 'Chef@2026', 22000.0, '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}', 4.9, NOW()),
  ('b0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Michael Tadesse', 'ETH-FAYDA-55443322', '+251955667788', 'waiter@tibebrms.com', 'Tadesse Worku', '+251955001122', 'Kazanchis, Addis Ababa', '1996-07-22', '2024-04-01', 'active', 'waiter', 'Waiter@2026', 12000.0, '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}', 4.85, NOW()),
  ('b0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sara Mengistu', 'ETH-FAYDA-88990011', '+251966778899', 'sara@tibebrms.com', 'Mengistu Haile', '+251966112233', 'Piassa, Addis Ababa', '1997-12-01', '2024-05-01', 'active', 'waiter', 'Sara@2026', 11500.0, '{"can_manage_inventory": false, "can_view_finance": false, "can_manage_shifts": false, "can_manage_staff": false}', 4.75, NOW())
ON CONFLICT (personal_id_number) DO UPDATE SET
  pin_code_hash = EXCLUDED.pin_code_hash,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- ---------------------------------------------------------------------
-- 5. MENU ITEMS (ALL TYPES & CATEGORIES)
-- ---------------------------------------------------------------------
INSERT INTO public.menu_items (
  id, restaurant_id, name, amharic_name, description, category, price, image_url, is_available, is_spicy, created_at
)
VALUES
  -- Specials
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Special Sizzling Awaze Tibs', 'ልዩ የተጠበሰ አዋዜ ጥብስ', 'Prime beef tenderloin strips sautéed with spiced niter kibbeh, fresh rosemary, red onions, garlic, and aged chili awaze paste.', 'specials', 680.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, true, NOW()),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Gourmet Kitfo Royale', 'ልዩ ክትፎ ከጎመንና አይብ', 'Hand-minced lean beef tenderloin seasoned with korerima cardamom, toasted mitmita, warm kibbeh, served with cottage ayib and gomen.', 'specials', 640.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, true, NOW()),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Royal Doro Wat Feast', 'የዶሮ ወጥ በአይብና እንቁላል', 'Traditional slow-simmered chicken stew with aged berbere, caramelized onions, hard-boiled eggs, served with fresh teff injera.', 'specials', 750.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, true, NOW()),

  -- Mains
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Claypot Sizzling Shiro Misto', 'ሽሮ ሚስቶ በድንክ ድስት', 'Rich sun-dried chickpea flour stew simmered with garlic, shallots, beef cubes, and clarifyed kibbeh in a clay pot.', 'mains', 380.0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Beyaynetu Vegan Platter', 'የጾም በያይነቱ', 'Colorful array of yellow split peas kik, red lentils mesir, cabbage tikil gomen, beetroot keir, and spinach on injera.', 'mains', 340.0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Beef Zilzil Tibs', 'ዝልዝል ጥብስ', 'Long tender strips of pan-seared beef steak seasoned with green peppers, onions, and garlic butter.', 'mains', 580.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, false, NOW()),

  -- Starters
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Crispy Beef Sambusa', 'ሥጋ ሳምቡሳ (3 ፍሬ)', 'Crispy golden triangular pastries stuffed with spiced minced beef, green chilies, and onions.', 'starters', 180.0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Lentil Sambusa Platter', 'የምስር ሳምቡሳ (3 ፍሬ)', 'Flaky pastry pockets filled with green lentils, shallots, and spicy cardamom.', 'starters', 150.0, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', true, false, NOW()),

  -- Desserts
  ('d0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Cardamom & Honey Baklava', 'ባቅላቫ በጣዝማ ማር', 'Crispy phyllo layers with crushed pistachios, honey drizzle, and subtle highland cardamom.', 'desserts', 220.0, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Teff Flour Chocolate Fondant', 'የጤፍ ፎንዳንት', 'Warm chocolate fondant made with organic teff flour, served with vanilla bean ice cream.', 'desserts', 260.0, 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80', true, false, NOW()),

  -- Beverages & Drinks
  ('d0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Traditional Tej Honey Wine', 'የሀገር ባህል ጠጅ (ካራፌ)', 'Artisanal fermented honey mead flavored with gesho leaves, served in a glass flask.', 'beverages', 280.0, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Fresh Mango & Avocado Spris', 'ማንጎ አቮካዶ ስፕሪስ ጁስ', 'Layered thick smoothie of fresh Ethiopian avocados, ripe mangoes, and lime juice.', 'beverages', 160.0, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', true, false, NOW()),
  ('d0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Spiced Ethiopian Jebena Coffee', 'የጅብና ቡና ስነ-ስርዓት', 'Freshly roasted Yirgacheffe coffee brewed in a clay jebena with frankincense aroma.', 'beverages', 90.0, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true, false, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  amharic_name = EXCLUDED.amharic_name,
  price = EXCLUDED.price,
  category = EXCLUDED.category;
