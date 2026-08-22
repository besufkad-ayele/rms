-- =====================================================================
-- Keren Addis Restaurant OS - Standalone Dining Sections Seed File
-- Execute this query directly in Supabase SQL Editor for Sections only
-- =====================================================================

-- 1. Create Dining Sections Table if not exists
CREATE TABLE IF NOT EXISTS public.dining_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add section_name column to tables if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='tables' 
          AND column_name='section_name'
    ) THEN
        ALTER TABLE public.tables ADD COLUMN section_name TEXT DEFAULT 'Main Dining Hall';
    END IF;
END $$;

-- 3. Seed Initial 4 Dining Sections
INSERT INTO public.dining_sections (id, restaurant_id, name, description, display_order, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Dining Hall', 'Primary indoor dining hall', 1, NOW()),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Terrace Garden', 'Outdoor garden dining patio', 2, NOW()),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Lounge & Bar', 'Highland coffee & cocktail lounge', 3, NOW()),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'VIP Alcove', 'Exclusive private dining rooms', 4, NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 4. Update Existing Tables with Section Names
UPDATE public.tables SET section_name = 'Terrace Garden' WHERE table_number <= 4;
UPDATE public.tables SET section_name = 'Main Dining Hall' WHERE table_number > 4 AND table_number <= 16;
UPDATE public.tables SET section_name = 'Lounge & Bar' WHERE table_number > 16 AND table_number <= 19;
UPDATE public.tables SET section_name = 'VIP Alcove' WHERE table_number >= 20;
