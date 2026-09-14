-- Sequential restaurant receipts. This is an internal invoice number,
-- not a certified MoR/ERCA fiscal device (EFD) invoice.

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS tin TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS receipt_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_receipt_number_uidx
  ON public.payments (receipt_number)
  WHERE receipt_number IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.next_receipt_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'KA-' || to_char(timezone('Africa/Addis_Ababa', now()), 'YYYYMMDD') || '-' ||
         lpad(nextval('public.receipt_number_seq')::text, 5, '0');
$$;

REVOKE ALL ON FUNCTION public.next_receipt_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_receipt_number() TO service_role;

REVOKE ALL ON SEQUENCE public.receipt_number_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.receipt_number_seq TO service_role;

UPDATE public.restaurants
SET tin = COALESCE(tin, '0000000000'),
    vat_number = COALESCE(vat_number, tin, '0000000000')
WHERE tin IS NULL OR vat_number IS NULL;
