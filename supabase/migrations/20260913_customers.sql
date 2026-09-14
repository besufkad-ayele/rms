-- Customer directory keyed by phone (loyalty / gamification ready)

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  full_name TEXT,
  visit_count INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tips NUMERIC(12,2) NOT NULL DEFAULT 0,
  loyalty_points INT NOT NULL DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One record per phone per restaurant
CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_uidx
  ON public.customers (restaurant_id, phone);

-- Link orders to a customer (nullable — phone is always optional)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

CREATE INDEX IF NOT EXISTS orders_customer_idx ON public.orders (customer_id);
