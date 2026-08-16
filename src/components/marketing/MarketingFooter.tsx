"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowUpRight, Heart } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { TibebDivider } from "@/components/ui/TibebDivider";

export function MarketingFooter() {
  return (
    <footer className="border-t border-divider bg-white text-brand-primary">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Brand Column - 5 cols */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary text-white">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="font-header text-xl font-bold tracking-tight text-brand-primary">
                {RESTAURANT_INFO.name}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-brand-secondary max-w-sm leading-relaxed">
              {RESTAURANT_INFO.description}
            </p>

            <p className="text-xs text-brand-muted">
              Bole Medhanialem • Addis Ababa, Ethiopia
            </p>
          </div>

          {/* Navigation Columns - 7 cols */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <p className="font-header font-bold text-brand-primary uppercase tracking-wider">
                Experience
              </p>
              <ul className="space-y-2 text-brand-secondary">
                <li>
                  <Link href="/menu" className="hover:text-brand-accent transition">
                    Digital Menu
                  </Link>
                </li>
                <li>
                  <Link href="/order/T-04" className="hover:text-brand-accent transition">
                    Table QR Ordering
                  </Link>
                </li>
                <li>
                  <Link href="/#story" className="hover:text-brand-accent transition">
                    Heritage Philosophy
                  </Link>
                </li>
                <li>
                  <Link href="/#location" className="hover:text-brand-accent transition">
                    Reservations
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-header font-bold text-brand-primary uppercase tracking-wider">
                RMS Operating
              </p>
              <ul className="space-y-2 text-brand-secondary">
                <li>
                  <Link href="/admin/staff" className="hover:text-brand-accent transition">
                    Staff HR & Shifts
                  </Link>
                </li>
                <li>
                  <span className="text-brand-muted">Live Floor Engine</span>
                </li>
                <li>
                  <span className="text-brand-muted">Kitchen KDS Board</span>
                </li>
                <li>
                  <span className="text-brand-muted">Inventory & COGS</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="font-header font-bold text-brand-primary uppercase tracking-wider">
                Connect
              </p>
              <ul className="space-y-2 text-brand-secondary">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-accent transition"
                  >
                    <span>Instagram</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-accent transition"
                  >
                    <span>Telegram Channel</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href={RESTAURANT_INFO.googleBusinessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-brand-accent transition"
                  >
                    <span>Google Business</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <TibebDivider subtle />

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-brand-secondary">
          <p>© {new Date().getFullYear()} {RESTAURANT_INFO.name} PLC. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for Ethiopian Hospitality Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
