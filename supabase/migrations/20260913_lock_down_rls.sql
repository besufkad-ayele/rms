-- Lock down PostgREST access. The Next.js app uses the service role, which
-- bypasses RLS. Anon/authenticated must not read or write operational tables.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'restaurants',
    'staff',
    'shifts',
    'training_checklist',
    'clock_in_logs',
    'leave_requests',
    'dining_sections',
    'tables',
    'ingredients',
    'menu_items',
    'recipes',
    'orders',
    'order_items',
    'payments',
    'feedback',
    'expenses'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Storage: receipts and staff docs stay private. Menu photos stay public-read.
UPDATE storage.buckets SET public = false WHERE id IN ('payment-receipts', 'staff-docs');
UPDATE storage.buckets SET public = true WHERE id = 'menu-photos';

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public menu photos" ON storage.objects;

CREATE POLICY "Public menu photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-photos');
