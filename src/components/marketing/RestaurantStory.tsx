"use client";

import React from "react";
import { TibebDivider } from "@/components/ui/TibebDivider";

export function RestaurantStory() {
  return (
    <section id="story" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 space-y-16">
        {/* Editorial Pull-Quote Moment */}
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase block">
            Our Culinary Philosophy
          </span>
          <blockquote className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary leading-[1.18]">
            “Food is not simply sustenance in Ethiopia — it is Gursha, unity, memory, and the warmth of gathering around a single mesob.”
          </blockquote>
          <p className="font-header text-sm sm:text-base text-brand-secondary font-medium italic">
            — Executive Chef Kaleb Zewde & The Keren Addis Kitchen Hearth
          </p>
        </div>

        <TibebDivider />

        {/* Narrative & Secondary Photography Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Visual Canvas - 6 cols */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative h-64 sm:h-80 rounded-card overflow-hidden shadow-card border border-divider">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="Ethiopian Coffee Roasting Ceremony with Frankincense"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative h-64 sm:h-80 rounded-card overflow-hidden shadow-card border border-divider mt-6">
              <img
                src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
                alt="Highland honey mead decanter"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Narrative Copy - 6 cols */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                Preserving Ancient Terroir
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">
                Where Ancient Red-Clay Stewing Meets Modern Culinary Finesse
              </h3>
            </div>

            <p className="text-sm sm:text-base text-brand-secondary font-sans leading-relaxed">
              At Keren Addis, we source our single-origin red teff from farmers across Debre Zeit, our organic butter from Gojjam highland dairies, and our sun-dried berbere from heirloom pepper growers in Wollo.
            </p>

            <p className="text-sm sm:text-base text-brand-secondary font-sans leading-relaxed">
              Every dish that leaves our kitchen is an ode to patience — slow claypot simmering, wood-fired charring over wild acacia coals, and tableside coffee ceremonies scented with natural frankincense resin.
            </p>

            <div className="flex items-center gap-6 pt-2 border-t border-divider text-xs text-brand-primary">
              <div>
                <span className="font-bold text-base block text-brand-accent">25 Tables</span>
                <span className="text-brand-secondary">Intimate Dining Space</span>
              </div>
              <div className="h-8 w-[1px] bg-divider" />
              <div>
                <span className="font-bold text-base block text-brand-accent">Zero Detours</span>
                <span className="text-brand-secondary">QR-to-Kitchen Speed</span>
              </div>
              <div className="h-8 w-[1px] bg-divider" />
              <div>
                <span className="font-bold text-base block text-brand-accent">Organic</span>
                <span className="text-brand-secondary">Ethically Sourced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
