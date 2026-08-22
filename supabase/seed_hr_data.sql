-- =====================================================================
-- Keren Addis Restaurant OS - Standalone HR & Attendance Seed File
-- Execute this query directly in Supabase SQL Editor
-- =====================================================================

-- 1. Create Tables if missing
CREATE TABLE IF NOT EXISTS public.clock_in_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    clock_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out_time TIMESTAMPTZ,
    status TEXT DEFAULT 'on_time',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL DEFAULT 'Annual Leave',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed Clock-In Records (Valid UUID hex 0-9, a-f)
INSERT INTO public.clock_in_logs (id, restaurant_id, staff_id, clock_in_time, clock_out_time, status, created_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '7 HOURS', NOW() - INTERVAL '30 MINUTES', 'on_time', NOW()),
  ('e0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '8 HOURS', NULL, 'on_time', NOW()),
  ('e0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '6 HOURS', NULL, 'late', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Leave Requests (Valid UUID hex)
INSERT INTO public.leave_requests (id, restaurant_id, staff_id, leave_type, start_date, end_date, reason, status, created_at)
VALUES
  ('f0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Annual Leave', '2026-09-01', '2026-09-05', 'Family celebration in Hawassa', 'pending', NOW()),
  ('f0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Sick Leave', '2026-08-10', '2026-08-11', 'Medical checkup', 'approved', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Training Checklist Items (Valid UUID hex: c0000000-...)
INSERT INTO public.training_checklist (id, staff_id, item_name, category, completed, completed_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Ethiopian Hospitality & Gursha Protocol', 'General', true, NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'Food Safety, Temp Control & Kitchen Hygiene', 'Kitchen', true, NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'POS Terminal, Table QR & Order Flow', 'Operations', true, NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'Fire Safety & First Aid Certification', 'Safety', false, NULL)
ON CONFLICT (id) DO NOTHING;
