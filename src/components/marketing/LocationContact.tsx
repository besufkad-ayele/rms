"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation, Layers, Compass, Copy, Check } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { useLanguage } from "@/context/LanguageContext";

export function LocationContact() {
  const { isAmharic } = useLanguage();
  const [mapMode, setMapMode] = useState<"styled" | "live">("styled");
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RESTAURANT_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="location" className="bg-background-subtle py-16 lg:py-24 border-t border-divider">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block font-zibriqriq">
            {isAmharic ? "አዲስ አበባ ውስጥ ይጎብኙን" : "Visit Us in Addis Ababa"}
          </span>
          <h2 className="font-abenet text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary leading-tight">
            {isAmharic ? "የስራ ሰዓት፣ አድራሻ እና መስተንግዶ" : "Hours, Location & Hospitality"}
          </h2>
          <p className="text-sm sm:text-base font-nyala text-brand-secondary">
            {isAmharic
              ? "በከረን አዲስ አካባቢ የሚገኝ፣ በየቀኑ ለእንግዶች እና ለጠረጴዛ முன்பreservation ክፍት የሆነ ልዩ ቦታ::"
              : "Located in the vibrant culinary corridor of Keren Addis, welcoming walk-in guests and table bookings daily."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-nyala">
          {/* Contact Details & Hours Card - 6 cols */}
          <div className="lg:col-span-6 rounded-card border border-divider/80 bg-white p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Address & Phone */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-background-active text-brand-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-abenet text-base font-bold text-brand-primary">
                      {isAmharic ? "የሬስቶራንቱ አድራሻ" : "Restaurant Location"}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-secondary mt-0.5 font-nyala">
                      {RESTAURANT_INFO.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 font-nyala">
                      <a
                        href={RESTAURANT_INFO.googleBusinessUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
                      >
                        <span>{isAmharic ? "በጉግል ካርታ ይክፈቱ" : "Open in Google Maps"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={handleCopyAddress}
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-brand-secondary hover:text-brand-primary transition"
                      >
                        {copied ? <Check className="h-3 w-3 text-status-available" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? (isAmharic ? "ተኮፒ አድርጓል" : "Copied!") : (isAmharic ? "ኮፒ አድርግ" : "Copy")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-background-active text-brand-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-abenet text-base font-bold text-brand-primary">
                      {isAmharic ? "ስልክ እና የጠረጴዛ முன்பreservation" : "Phone & Table Reservations"}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-brand-secondary mt-0.5">
                      {RESTAURANT_INFO.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-background-active text-brand-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-abenet text-base font-bold text-brand-primary">
                      {isAmharic ? "ኢሜይል አድራሻ" : "Direct Inquiries"}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-secondary mt-0.5 font-nyala">
                      {RESTAURANT_INFO.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours Table */}
              <div className="pt-4 border-t border-divider">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-brand-accent" />
                  <h3 className="font-abenet text-sm font-bold text-brand-primary uppercase tracking-wide">
                    {isAmharic ? "የአገልግሎት ሰዓታት" : "Service Hours"}
                  </h3>
                </div>

                <div className="divide-y divide-divider/70 rounded-button bg-background-subtle border border-divider p-3 text-xs space-y-2 font-nyala">
                  {RESTAURANT_INFO.openingHours.map((schedule, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                      <span className="font-medium text-brand-primary">{schedule.day}</span>
                      <span className="text-brand-secondary font-mono">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next-Level Branded Map Card - 6 cols */}
          <div className="lg:col-span-6 rounded-card border border-brand-accent/20 bg-brand-primary overflow-hidden shadow-elevated relative flex flex-col min-h-[420px] group">
            
            {/* Top Toolbar overlay */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
              <div className="inline-flex items-center gap-1.5 rounded-pill bg-brand-primary/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white border border-white/10 shadow-md font-zibriqriq">
                <Compass className="h-3.5 w-3.5 text-brand-accent animate-spin-slow" />
                <span>{isAmharic ? "ከረን አዲስ ካርታ" : "Keren Addis Location Map"}</span>
              </div>

              {/* Map Mode Switcher */}
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-pill border border-white/10 font-nyala">
                <button
                  onClick={() => setMapMode("styled")}
                  type="button"
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-pill transition ${
                    mapMode === "styled"
                      ? "bg-brand-accent text-white shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {isAmharic ? "የብራንድ ካርታ" : "Branded Map"}
                </button>
                <button
                  onClick={() => setMapMode("live")}
                  type="button"
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-pill transition ${
                    mapMode === "live"
                      ? "bg-brand-accent text-white shadow-xs"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {isAmharic ? "ቀጥታ ካርታ" : "Live OSM"}
                </button>
              </div>
            </div>

            {/* Map Canvas Rendering */}
            <div className="relative flex-1 w-full h-full min-h-[350px] overflow-hidden">
              {mapMode === "live" ? (
                /* Live OpenStreetMap view centered on exact coordinates 9.0611313959925, 38.762250376615036 */
                <iframe
                  title="Keren Addis Exact Coordinates Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=38.75225%2C9.05113%2C38.77225%2C9.07113&amp;layer=mapnik&amp;marker=9.0611313959925%2C38.762250376615036"
                  className="w-full h-full min-h-[360px] border-0 filter contrast-125 saturate-125 hue-rotate-310 opacity-90 transition-opacity duration-300"
                />
              ) : (
                /* Luxury Dark & Rosewood Custom Styled Vector Map */
                <div className="relative w-full h-full min-h-[360px] bg-[#1a1718] flex items-center justify-center p-6 text-center overflow-hidden">
                  
                  {/* Decorative Map Vector Grid & Arterials */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8B4254_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                  
                  {/* Styled Vector Roads (SVG overlay) */}
                  <svg className="absolute inset-0 w-full h-full opacity-30 text-brand-accent" xmlns="http://www.w3.org/2000/svg">
                    <path d="M -50,120 Q 150,180 400,100 T 800,220" fill="none" stroke="#8B4254" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 120,-50 L 180,500" fill="none" stroke="#8B4254" strokeWidth="6" strokeDasharray="4 4" />
                    <path d="M 280,-50 L 320,500" fill="none" stroke="#D97706" strokeWidth="4" />
                    <circle cx="250" cy="200" r="140" fill="none" stroke="#8B4254" strokeWidth="1" strokeDasharray="6 6" />
                  </svg>

                  {/* Pulsing Radar Beacon Center Piece */}
                  <div className="relative z-10 space-y-4 max-w-sm">
                    {/* Animated Pulsing Pin Icon */}
                    <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-brand-accent/40 animate-ping" />
                      <span className="absolute inset-2 rounded-full bg-brand-accent/60 animate-pulse" />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-white shadow-elevated border-2 border-white/40">
                        <Navigation className="h-7 w-7 text-white animate-bounce" />
                      </div>
                    </div>

                    {/* Floating Glassmorphism Location Box */}
                    <div className="rounded-card bg-brand-primary/90 border border-brand-accent/40 p-4 backdrop-blur-md shadow-elevated text-left space-y-1 font-nyala">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-zibriqriq">
                          {isAmharic ? "ከረን አዲስ አካባቢ" : "Keren Addis Precinct"}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-status-available animate-pulse" />
                      </div>
                      <h3 className="font-abenet text-lg font-bold text-white">
                        {isAmharic ? RESTAURANT_INFO.amharicName : RESTAURANT_INFO.name}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-1 font-nyala">
                        Cape Verde Street, Addis Ababa, Ethiopia
                      </p>
                      <p className="text-[10px] font-mono text-brand-accent/90 pt-0.5">
                        GPS: 9.06113° N, 38.76225° E
                      </p>
                    </div>

                    <a
                      href={RESTAURANT_INFO.googleBusinessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-accent-hover transition font-nyala active:scale-95"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{isAmharic ? "የመንዳት አቅጣጫ በጉግል ካርታ" : "Get Driving Directions"}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom info banner matching brand */}
            <div className="bg-brand-primary/95 p-3.5 border-t border-white/10 flex items-center justify-between text-xs font-nyala text-white/90">
              <span className="text-white/70">{isAmharic ? "የመኪና ማቆሚያ እና VIP መግቢያ ይገኛል" : "Valet parking & VIP entrance available"}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isAmharic ? "ዛሬ ማታ ክፍት ነው" : "Open Tonight"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
