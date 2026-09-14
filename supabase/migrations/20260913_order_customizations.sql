-- Guest order customizations, tips, and table service log

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS kitchen_notes TEXT,
  ADD COLUMN IF NOT EXISTS customization JSONB;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(10,2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.table_service_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'assignment',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS table_service_log_table_idx ON public.table_service_log (table_id, created_at DESC);
