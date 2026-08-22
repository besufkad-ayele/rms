"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, UtensilsCrossed, Menu, X, ArrowRight } from "lucide-react";
import { RESTAURANT_INFO } from "@/data/mockMenu";
import { useLanguage } from "@/context/LanguageContext";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAmharic, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-button bg-brand-primary text-white shadow-xs group-hover:bg-brand-accent transition">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <span className="font-abenet text-xl font-bold tracking-tight text-brand-primary block leading-none">
              {isAmharic ? RESTAURANT_INFO.amharicName : RESTAURANT_INFO.name}
            </span>
            <span className="font-nyala text-[11px] text-brand-secondary tracking-widest uppercase font-medium">
              {isAmharic ? "አዲስ አበባ • ባህላዊ እና ዘመናዊ ምግብ" : "Addis Ababa • Fine Dining"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium font-nyala text-brand-primary">
          <Link href="/#menu-preview" className="hover:text-brand-accent transition">
            {isAmharic ? "ልዩ ምግቦች" : "Signature Dishes"}
          </Link>
          <Link href="/#story" className="hover:text-brand-accent transition">
            {isAmharic ? "ታሪክ እና ባህል" : "Heritage & Story"}
          </Link>
          <Link href="/#location" className="hover:text-brand-accent transition">
            {isAmharic ? "አድራሻ እና ሰዓት" : "Hours & Location"}
          </Link>
        </nav>

        {/* Action Buttons: Language Toggle & Digital Menu Button */}
        <div className="hidden md:flex items-center gap-3 font-nyala">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-background-subtle border border-divider px-3.5 py-2 text-xs font-semibold text-brand-primary hover:bg-background-active transition"
            aria-label="Toggle website language"
          >
            <Globe className="h-4 w-4 text-brand-accent" />
            <span>{isAmharic ? "English" : "አማርኛ"}</span>
          </button>

          {/* Stand-Out Digital Menu Button (Last Item) */}
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-pill bg-brand-accent px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-accent-hover active:scale-95 transition-all duration-150 ease-out"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>{isAmharic ? "ዲጂታል ሜኑ" : "Digital Menu"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile controls: language toggle & menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            type="button"
            className="inline-flex items-center gap-1 rounded-pill bg-background-subtle border border-divider px-2.5 py-1 text-xs font-semibold font-nyala text-brand-primary"
          >
            <Globe className="h-3.5 w-3.5 text-brand-accent" />
            <span>{isAmharic ? "EN" : "አማርኛ"}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-button text-brand-primary hover:bg-background-subtle p-2"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-divider bg-white px-6 py-4 space-y-3 font-nyala animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/#menu-preview"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            {isAmharic ? "ልዩ ምግቦች" : "Signature Dishes"}
          </Link>
          <Link
            href="/#story"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            {isAmharic ? "ታሪክ እና ባህል" : "Heritage & Story"}
          </Link>
          <Link
            href="/#location"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-primary hover:text-brand-accent"
          >
            {isAmharic ? "አድራሻ እና ሰዓት" : "Hours & Location"}
          </Link>

          <div className="pt-3 border-t border-divider">
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-pill bg-brand-accent py-3 text-xs font-bold text-white shadow-md hover:bg-brand-accent-hover active:scale-95 transition font-nyala"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>{isAmharic ? "ዲጂታል ሜኑ" : "Digital Menu"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
