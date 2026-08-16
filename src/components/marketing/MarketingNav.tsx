"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UtensilsCrossed, QrCode, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-button bg-brand-primary text-white shadow-xs group-hover:bg-brand-accent transition">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <span className="font-header text-xl font-bold tracking-tight text-brand-primary block leading-none">
              {RESTAURANT_INFO.name}
            </span>
            <span className="text-[11px] text-brand-secondary tracking-widest uppercase font-medium">
              Addis Ababa
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-primary">
          <Link href="/#menu-preview" className="hover:text-brand-accent transition">
            Signatures
          </Link>
          <Link href="/menu" className="hover:text-brand-accent transition">
            Full Menu
          </Link>
          <Link href="/#story" className="hover:text-brand-accent transition">
            Heritage & Story
          </Link>
          <Link href="/#location" className="hover:text-brand-accent transition">
            Hours & Location
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/order/T-04"
            className="inline-flex items-center gap-2 rounded-pill bg-background-active px-3.5 py-2 text-xs font-semibold text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition shadow-2xs"
          >
            <QrCode className="h-4 w-4" />
            <span>Simulate QR Order (T-04)</span>
          </Link>

          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 rounded-button bg-brand-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-accent-hover transition"
          >
            <span>Explore Menu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button text-brand-primary hover:bg-background-subtle p-2"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-divider bg-white px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/#menu-preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            Signature Dishes
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            Digital Menu
          </Link>
          <Link
            href="/#story"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            Heritage & Story
          </Link>
          <Link
            href="/#location"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            Hours & Location
          </Link>
          <div className="pt-2 border-t border-divider flex flex-col gap-2">
            <Link
              href="/order/T-04"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-button bg-background-active py-2.5 text-xs font-semibold text-brand-accent border border-brand-accent/20"
            >
              <QrCode className="h-4 w-4" />
              <span>Simulate Table 04 QR Order</span>
            </Link>
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-button bg-brand-accent py-2.5 text-xs font-semibold text-white"
            >
              <span>View Full Menu</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
