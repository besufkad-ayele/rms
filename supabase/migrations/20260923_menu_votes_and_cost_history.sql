-- Menu popularity votes + ingredient cost history (up to 12 retained via app/trigger)

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS vote_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.ingredient_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  cost_per_unit NUMERIC(10,4) NOT NULL,
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingredient_cost_history_ingredient_idx
  ON public.ingredient_cost_history (ingredient_id, recorded_at DESC);

-- Backfill initial history for existing ingredients that have no rows yet
INSERT INTO public.ingredient_cost_history (ingredient_id, cost_per_unit, note, recorded_at)
SELECT i.id, i.cost_per_unit, 'Initial', COALESCE(i.updated_at, now())
FROM public.ingredients i
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient_cost_history h WHERE h.ingredient_id = i.id
);

-- Increment vote_count on each order line (quantity units sold)
CREATE OR REPLACE FUNCTION public.fn_increment_menu_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items
  SET vote_count = COALESCE(vote_count, 0) + NEW.quantity
  WHERE id = NEW.menu_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_menu_votes ON public.order_items;
CREATE TRIGGER trg_increment_menu_votes
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.fn_increment_menu_votes();

-- Reverse votes when an order is cancelled/disputed
CREATE OR REPLACE FUNCTION public.fn_reverse_menu_votes()
RETURNS TRIGGER AS $$
DECLARE
  oi RECORD;
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'disputed') AND OLD.status NOT IN ('cancelled', 'disputed')) THEN
    FOR oi IN (
      SELECT menu_item_id, quantity
      FROM public.order_items
      WHERE order_id = NEW.id AND is_cancelled = false
    ) LOOP
      UPDATE public.menu_items
      SET vote_count = GREATEST(0, COALESCE(vote_count, 0) - oi.quantity)
      WHERE id = oi.menu_item_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reverse_menu_votes ON public.orders;
CREATE TRIGGER trg_reverse_menu_votes
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_reverse_menu_votes();

-- Keep only the latest 12 cost history rows per ingredient
CREATE OR REPLACE FUNCTION public.fn_trim_ingredient_cost_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.ingredient_cost_history
  WHERE id IN (
    SELECT id FROM public.ingredient_cost_history
    WHERE ingredient_id = NEW.ingredient_id
    ORDER BY recorded_at DESC
    OFFSET 12
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trim_ingredient_cost_history ON public.ingredient_cost_history;
CREATE TRIGGER trg_trim_ingredient_cost_history
AFTER INSERT ON public.ingredient_cost_history
FOR EACH ROW
EXECUTE FUNCTION public.fn_trim_ingredient_cost_history();

-- Record cost history when cost_per_unit changes on ingredients
CREATE OR REPLACE FUNCTION public.fn_record_ingredient_cost_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ingredient_cost_history (ingredient_id, cost_per_unit, note)
    VALUES (NEW.id, NEW.cost_per_unit, 'Initial');
  ELSIF TG_OP = 'UPDATE' AND NEW.cost_per_unit IS DISTINCT FROM OLD.cost_per_unit THEN
    INSERT INTO public.ingredient_cost_history (ingredient_id, cost_per_unit, note)
    VALUES (NEW.id, NEW.cost_per_unit, 'Cost update');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_record_ingredient_cost_change ON public.ingredients;
CREATE TRIGGER trg_record_ingredient_cost_change
AFTER INSERT OR UPDATE OF cost_per_unit ON public.ingredients
FOR EACH ROW
EXECUTE FUNCTION public.fn_record_ingredient_cost_change();
