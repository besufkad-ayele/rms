-- Activity / audit log for admin actions across modules
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    actor_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    actor_name TEXT,
    module_id TEXT NOT NULL DEFAULT 'hr',
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON public.activity_logs (module_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON public.activity_logs (actor_staff_id);

-- Clock-in approval workflow columns
ALTER TABLE public.clock_in_logs
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.clock_in_logs.approval_status IS 'pending | approved | rejected';
COMMENT ON COLUMN public.clock_in_logs.status IS 'on_time | late | early | missed';

-- RLS lock-down consistent with existing migrations
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.activity_logs FROM anon, authenticated;
