"use client";

import React from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";

export function LocationContact() {
  return (
    <section id="location" className="bg-background-subtle py-16 lg:py-24 border-t border-divider">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-brand-accent uppercase tracking-wider block">
            Visit Us in Addis Ababa
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
            Hours, Location & Hospitality
          </h2>
          <p className="text-sm text-brand-secondary">
            Located in the vibrant culinary corridor of Bole, welcoming walk-in guests and table bookings daily.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details & Hours Card - 6 cols */}
          <div className="lg:col-span-6 rounded-card border border-divider bg-white p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Address & Phone */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-background-active text-brand-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-header text-sm font-bold text-brand-primary">
                      Restaurant Location
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
                      {RESTAURANT_INFO.address}
                    </p>
                    <a
                      href={RESTAURANT_INFO.googleBusinessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline mt-1.5"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-background-active text-brand-accent">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-header text-sm font-bold text-brand-primary">
                      Phone & Table Reservations
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
                    <h3 className="font-header text-sm font-bold text-brand-primary">
                      Direct Inquiries
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
                      {RESTAURANT_INFO.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours Table */}
              <div className="pt-4 border-t border-divider">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-brand-accent" />
                  <h3 className="font-header text-sm font-bold text-brand-primary uppercase tracking-wide">
                    Service Hours
                  </h3>
                </div>

                <div className="divide-y divide-divider/70 rounded-button bg-background-subtle border border-divider p-3 text-xs space-y-2">
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

          {/* Map Preview Card - 6 cols */}
          <div className="lg:col-span-6 rounded-card border border-divider bg-white overflow-hidden shadow-card relative flex flex-col min-h-[360px]">
            {/* Styled Map Visual Representation */}
            <div className="relative flex-1 bg-background-active flex items-center justify-center p-6 text-center overflow-hidden">
              {/* Background map grid illustration */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#231F20_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 space-y-3 max-w-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent text-white shadow-elevated animate-pulse-subtle">
                  <Navigation className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-brand-primary">
                    Bole Medhanialem Precinct
                  </h3>
                  <p className="text-xs text-brand-secondary mt-1">
                    Cape Verde Street, Opposite Edna Mall & Medhanialem Cathedral
                  </p>
                </div>
                <a
                  href={RESTAURANT_INFO.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Get Driving Directions</span>
                </a>
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="bg-white p-4 border-t border-divider flex items-center justify-between text-xs">
              <span className="text-brand-secondary">Valet parking & VIP entrance available</span>
              <span className="font-semibold text-status-available">● Open Tonight</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
