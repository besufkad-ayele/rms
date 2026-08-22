"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Utensils, Calendar } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { useLanguage } from "@/context/LanguageContext";

export function LandingHero() {
  const { isAmharic } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Text Block - 5 cols (Asymmetric Layout) */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Hours & Address Pill Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-pill bg-background-subtle border border-divider px-3.5 py-1.5 text-xs text-brand-primary shadow-2xs font-nyala">
              <span className="flex items-center gap-1 text-brand-accent font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAmharic ? "በየቀኑ ክፍት ነው" : "Now Open Daily"}</span>
              </span>
              <span className="h-3 w-[1px] bg-divider" />
              <span className="flex items-center gap-1 text-brand-secondary">
                <MapPin className="h-3 w-3" />
                <span>{isAmharic ? "ከረን አዲስ፣ አዲስ አበባ" : "Keren Addis, Addis Ababa"}</span>
              </span>
            </div>

            {/* Restaurant Title Display */}
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-[0.25em] text-brand-accent uppercase block font-zibriqriq">
                {isAmharic ? "ከረን አዲስ የኢትዮጵያ ባህላዊ እና ዘመናዊ ምግብ" : "Keren Addis Ethiopian Gastronomy"}
              </span>
              <h1 className="font-abenet text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-primary leading-[1.08]">
                {isAmharic ? RESTAURANT_INFO.amharicName : RESTAURANT_INFO.name}
              </h1>
              <p className="font-nyala text-lg sm:text-xl font-medium text-brand-secondary">
                {isAmharic ? "አርቲሳን ባህላዊ ምግብ እና ዘመናዊ አስተናጋጅነት" : "Artisan Ethiopian Gastronomy & Living Hospitality"}
              </p>
            </div>

            {/* Editorial Statement */}
            <p className="text-base text-brand-secondary font-nyala leading-relaxed max-w-lg">
              {isAmharic
                ? "በከረን አዲስ የጥንታውያን የኢትዮጵያ ምግብ አዘገጃጀት ጥበብ ከዘመናዊ የሙያ ጥራት እና የማዕድ ሞቅታ ጋር ተቀናጅቶ የቀረበበት ልዩ መስተንግዶ።"
                : RESTAURANT_INFO.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-nyala">
              <Link
                href="/menu"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-150 ease-out hover:bg-brand-accent-hover hover:-translate-y-0.5 active:scale-95"
              >
                <Utensils className="h-4 w-4" />
                <span>{isAmharic ? "ዲጂታል ሜኑ ይመልከቱ" : "Explore Digital Menu"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/#location"
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-background-card px-5 py-3.5 text-sm font-semibold text-brand-primary border border-divider transition-all duration-150 ease-out hover:bg-background-active hover:-translate-y-0.5"
              >
                <Calendar className="h-4 w-4 text-brand-accent" />
                <span>{isAmharic ? "አድራሻ እና ሰዓት" : "Hours & Location"}</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 border-t border-divider pt-6 text-xs text-brand-secondary font-nyala">
              <div>
                <span className="font-abenet text-xl font-bold text-brand-primary block">
                  100%
                </span>
                <span>{isAmharic ? "ንጹህ የሀገር ጤፍ" : "Highland Teff"}</span>
              </div>
              <div>
                <span className="font-abenet text-xl font-bold text-brand-primary block">
                  {isAmharic ? "8-ሰዓት" : "8-Hour"}
                </span>
                <span>{isAmharic ? "የበሰለ በርበሬ" : "Simmered Berbere"}</span>
              </div>
              <div>
                <span className="font-abenet text-xl font-bold text-brand-primary block">
                  {isAmharic ? "ደረጃ 1" : "Grade 1"}
                </span>
                <span>{isAmharic ? "የይርጋጨፌ ቡና" : "Yirgacheffe Coffee"}</span>
              </div>
            </div>
          </div>

          {/* Photographic Bleed - 7 cols */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-auto w-full rounded-card overflow-hidden shadow-elevated border border-divider">
              {/* Primary Large Photograph */}
              <div className="relative h-[380px] sm:h-[460px] lg:h-[540px] w-full bg-background-subtle">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=85"
                  alt="Keren Addis Ethiopian wood-fired hearth dining"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Floating Highlight */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs rounded-card bg-white/95 backdrop-blur-md p-4 shadow-elevated border border-divider">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80"
                      alt="Signature Kitfo"
                      className="h-12 w-12 rounded-button object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider block font-zibriqriq">
                        {isAmharic ? "የሼፍ ልዩ ምርጥ" : "Chef Specialty"}
                      </span>
                      <p className="font-abenet text-sm font-bold text-brand-primary leading-tight">
                        {isAmharic ? "ክብርት ክትፎ" : "Gourmet Kereyu Kitfo Royale"}
                      </p>
                      <p className="text-xs font-bold text-brand-accent mt-0.5 font-nyala">
                        ETB 640
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
