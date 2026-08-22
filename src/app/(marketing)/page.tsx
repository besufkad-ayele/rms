import { MarketingNav } from "@/components/marketing/MarketingNav";
import { LandingHero } from "@/components/marketing/LandingHero";
import { MenuPreview } from "@/components/marketing/MenuPreview";
import { RestaurantStory } from "@/components/marketing/RestaurantStory";
import { LocationContact } from "@/components/marketing/LocationContact";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata = {
  title: "Keren Addis — Artisan Ethiopian Gastronomy & Hospitality",
  description:
    "An elevated homage to ancient Ethiopian culinary traditions reimagined with contemporary culinary mastery in Keren Addis, Addis Ababa.",
};

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-background text-brand-primary selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <MarketingNav />

      {/* Main Sections */}
      <main>
        {/* 1. Hero: Asymmetric Layout with 60% Photographic Bleed & Oversized Abenet Typography */}
        <LandingHero />

        {/* 2. Menu Preview: Signature Dishes */}
        <MenuPreview />

        {/* 3. About / Heritage Story: Pull-Quote & Culinary Narrative */}
        <RestaurantStory />

        {/* 4. Location & Contact: Styled Map Card, Hours, Keren Addis Address */}
        <LocationContact />
      </main>

      {/* 5. Minimalist Luxury Footer */}
      <MarketingFooter />
    </div>
  );
}
