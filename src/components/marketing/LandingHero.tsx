"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Sparkles, QrCode } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Text Block - 5 cols (Asymmetric Layout) */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Hours & Address Pill Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-pill bg-background-subtle border border-divider px-3.5 py-1.5 text-xs text-brand-primary shadow-2xs">
              <span className="flex items-center gap-1 text-brand-accent font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Now Open</span>
              </span>
              <span className="h-3 w-[1px] bg-divider" />
              <span className="flex items-center gap-1 text-brand-secondary">
                <MapPin className="h-3 w-3" />
                <span>Bole Medhanialem, Addis</span>
              </span>
            </div>

            {/* Restaurant Title in Oversized Lato Display */}
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-[0.25em] text-brand-accent uppercase block">
                Contemporary Ethiopian Hearth
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-primary leading-[1.08]">
                Keren Addis
              </h1>
              <p className="font-header text-lg sm:text-xl font-medium text-brand-secondary">
                {RESTAURANT_INFO.amharicName} • Artisan Gastronomy
              </p>
            </div>

            {/* Warm Editorial Statement */}
            <p className="text-base text-brand-secondary font-sans leading-relaxed max-w-lg">
              {RESTAURANT_INFO.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/menu"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-150 ease-out hover:bg-brand-accent-hover hover:-translate-y-0.5 active:scale-95"
              >
                <span>Browse Digital Menu</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/order/T-04"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-background-active px-5 py-3.5 text-sm font-semibold text-brand-primary border border-divider transition-all duration-150 ease-out hover:bg-background-card hover:-translate-y-0.5"
              >
                <QrCode className="h-4 w-4 text-brand-accent" />
                <span>Test Table QR Order</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 border-t border-divider pt-6 text-xs text-brand-secondary">
              <div>
                <span className="font-display text-xl font-bold text-brand-primary block">
                  100%
                </span>
                <span>Highland Teff</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-brand-primary block">
                  8-Hour
                </span>
                <span>Simmered Berbere</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-brand-primary block">
                  Grade 1
                </span>
                <span>Yirgacheffe Coffee</span>
              </div>
            </div>
          </div>

          {/* Photographic Bleed - 7 cols (60% width on desktop) */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-auto w-full rounded-card overflow-hidden shadow-elevated border border-divider">
              {/* Primary Large Photograph */}
              <div className="relative h-[380px] sm:h-[460px] lg:h-[540px] w-full bg-background-subtle">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=85"
                  alt="Keren Addis signature wood-fired hearth dining"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Floating Dish Badge Highlight */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs rounded-card bg-white/95 backdrop-blur-md p-4 shadow-elevated border border-divider">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                      alt="Signature Kitfo"
                      className="h-12 w-12 rounded-button object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider block">
                        Chef Recommendation
                      </span>
                      <p className="font-header text-sm font-bold text-brand-primary leading-tight">
                        Kereyu Kitfo Royale
                      </p>
                      <p className="text-xs font-bold text-brand-accent mt-0.5">
                        640 ETB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Soft decorative background tint behind asymmetric block */}
            <div className="absolute -bottom-8 -right-8 -z-10 h-72 w-72 rounded-full bg-background-active/80 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
