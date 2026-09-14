"use client";

import React, { useEffect, useState } from "react";
import { X, Clock, Check, Plus, ChefHat } from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatETB, cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import {
  ItemCustomization,
  MenuExtraOption,
  MenuIngredientOption,
} from "@/types/order-customization";
import { getMenuItemOptionsAction } from "@/app/order/[tableCode]/actions";

interface DishDetailModalProps {
  item: MenuItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItemData, customization?: ItemCustomization, lineTotal?: number) => void;
  isOrderMode?: boolean;
}

export function DishDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isOrderMode = false,
}: DishDetailModalProps) {
  const { isAmharic } = useLanguage();

  const [ingredients, setIngredients] = useState<MenuIngredientOption[]>([]);
  const [extras, setExtras] = useState<MenuExtraOption[]>([]);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [selectedExtras, setSelectedExtras] = useState<MenuExtraOption[]>([]);
  const [chefNote, setChefNote] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (!isOpen || !item || !isOrderMode) return;
    const currentItem = item;
    let cancelled = false;
    async function load() {
      setLoadingOptions(true);
      const res = await getMenuItemOptionsAction(
        currentItem.id,
        currentItem.name,
        currentItem.ingredients
      );
      if (cancelled) return;
      setIngredients(res.ingredients);
      setExtras(res.extras);
      const nextIncluded: Record<string, boolean> = {};
      res.ingredients.forEach((ing) => {
        nextIncluded[ing.id] = true;
      });
      setIncluded(nextIncluded);
      setSelectedExtras([]);
      setChefNote("");
      setLoadingOptions(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, item, isOrderMode]);

  if (!isOpen || !item) return null;

  const isAvailable = item.isAvailable && item.status !== "sold_out";
  const titleText = isAmharic ? item.amharicName || item.name : item.name;
  const subtitleText = isAmharic ? item.name : item.amharicName;

  const extrasPrice = selectedExtras.reduce((s, e) => s + e.price, 0);
  const lineTotal = item.price + extrasPrice;

  const omittedIngredients = ingredients
    .filter((ing) => included[ing.id] === false)
    .map((ing) => ing.name);

  const toggleExtra = (extra: MenuExtraOption) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  };

  const handleAdd = () => {
    if (!isAvailable) return;
    const customization: ItemCustomization = {
      omittedIngredients,
      selectedExtras,
      chefNote: chefNote.trim() || undefined,
    };
    const hasCustomization =
      omittedIngredients.length > 0 || selectedExtras.length > 0 || !!customization.chefNote;
    onAddToCart?.(item, hasCustomization ? customization : undefined, lineTotal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-card bg-white shadow-drawer border border-divider/80 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/85 text-brand-primary backdrop-blur-md shadow-card transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Hero Image */}
        <div className="relative h-64 w-full bg-background-subtle">
          <img
            src={item.photoUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              {subtitleText && (
                <span className="text-xs font-medium text-amber-200/90 tracking-wide block font-nyala">
                  {subtitleText}
                </span>
              )}
              <h3 className="font-abenet text-2xl font-bold text-white leading-tight">
                {titleText}
              </h3>
            </div>
            <span className="font-nyala text-lg font-bold text-white bg-brand-accent px-3.5 py-1 rounded-pill backdrop-blur-md shadow-md border border-white/20">
              {formatETB(item.price)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto font-nyala">
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2">
            {item.isChefSpecial && <StatusBadge variant="chef_pick" size="md" />}
            {item.isSpicy && <StatusBadge variant="spicy" size="md" />}
            {item.isVegetarian && <StatusBadge variant="vegetarian" size="md" />}
            {item.isGlutenFree && <StatusBadge variant="gluten_free" size="md" />}
            <span className="inline-flex items-center gap-1 text-xs text-brand-secondary bg-background-subtle px-3 py-1 rounded-pill border border-divider">
              <Clock className="h-3.5 w-3.5 text-brand-accent" />
              <span>~{item.preparationMinutes} {isAmharic ? "ደቂቃ የማዘጋጀት ሰዓት" : "min prep"}</span>
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-zibriqriq text-xs font-bold uppercase tracking-wider text-brand-accent">
              {isAmharic ? "የምግብ መግለጫ እና አዘገጃጀት" : "Culinary Description"}
            </h4>
            <p className="mt-1.5 text-sm text-brand-primary leading-relaxed font-nyala">
              {item.description}
            </p>
          </div>

          {/* Ingredient customization (order mode) */}
          {isOrderMode ? (
            <>
              <div>
                <h4 className="font-zibriqriq text-xs font-bold uppercase tracking-wider text-brand-accent">
                  {isAmharic ? "ንጥረ ነገሮች (ለማስወገድ ምልክት ያንሱ)" : "Ingredients (uncheck to remove)"}
                </h4>
                {loadingOptions ? (
                  <p className="mt-2 text-xs text-brand-secondary">
                    {isAmharic ? "በመጫን ላይ…" : "Loading ingredients…"}
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {ingredients.map((ing) => {
                      const checked = included[ing.id] !== false;
                      return (
                        <label
                          key={ing.id}
                          className={cn(
                            "flex items-center gap-3 rounded-button border p-2.5 cursor-pointer text-sm",
                            checked
                              ? "border-divider bg-background-subtle"
                              : "border-status-sold-out/40 bg-status-sold-out/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={ing.required}
                            onChange={() => {
                              if (ing.required) return;
                              setIncluded((prev) => ({ ...prev, [ing.id]: !checked }));
                            }}
                            className="h-4 w-4 accent-brand-accent"
                          />
                          <span className="flex-1 font-medium text-brand-primary">{ing.name}</span>
                          {ing.required ? (
                            <span className="text-[10px] font-bold text-brand-accent uppercase">
                              {isAmharic ? "አስፈላጊ" : "Required"}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {extras.length > 0 ? (
                <div>
                  <h4 className="font-zibriqriq text-xs font-bold uppercase tracking-wider text-brand-accent">
                    {isAmharic ? "ተጨማሪ አማራጮች" : "Optional Extras"}
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {extras.map((extra) => {
                      const picked = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtra(extra)}
                          className={cn(
                            "flex items-center justify-between rounded-button border p-2.5 text-left text-sm transition",
                            picked
                              ? "border-brand-accent bg-brand-accent/10"
                              : "border-divider bg-white hover:bg-background-subtle"
                          )}
                        >
                          <span className="font-medium text-brand-primary">{extra.name}</span>
                          <span className="flex items-center gap-1 font-bold text-brand-accent">
                            {picked ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            {formatETB(extra.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="font-zibriqriq text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5" />
                  {isAmharic ? "ለሼፉ ማስታወሻ" : "Note for the chef"}
                </h4>
                <textarea
                  value={chefNote}
                  onChange={(e) => setChefNote(e.target.value)}
                  rows={2}
                  placeholder={isAmharic ? "ለምሳሌ፦ ቅመም መጠነኛ ይሁን…" : "e.g. mild spice, extra injera on the side…"}
                  className="mt-2 w-full rounded-button border border-divider bg-background-subtle p-2.5 text-sm text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            </>
          ) : (
            item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h4 className="font-zibriqriq text-xs font-bold uppercase tracking-wider text-brand-accent">
                  {isAmharic ? "የተመረጡ ንጥረ ነገሮች" : "Selected Ingredients & Aromatics"}
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-button bg-background-active px-2.5 py-1 text-xs text-brand-primary border border-divider font-nyala"
                    >
                      <Check className="h-3 w-3 text-brand-accent" />
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-divider p-4 bg-background-subtle flex items-center justify-between gap-3 font-nyala">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-brand-secondary hover:text-brand-primary transition"
          >
            {isAmharic ? "ወደ ሜኑ ተመልስ" : "Back to Menu"}
          </button>

          {isOrderMode && (
            <button
              onClick={handleAdd}
              disabled={!isAvailable}
              className="min-h-[44px] flex-1 max-w-[240px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>
                {isAmharic ? "ወደ ትእዛዝ ጨምር" : "Add to Order"} · {formatETB(lineTotal)}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
