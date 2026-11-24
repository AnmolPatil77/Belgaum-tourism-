import { ArrowDownRight, CalendarRange } from 'lucide-react';
import type { Translations } from '../utils/i18n';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  t: Translations;
  heroImage: string;
}

export function HeroSection({ t, heroImage }: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative w-full min-h-[600px] lg:min-h-[680px] flex flex-col justify-end overflow-hidden bg-[#133124]"
    >
      {/* Full-bleed scenic Gokak Falls backdrop */}
      <div className="absolute inset-0">
        <SafeImage
          src={heroImage}
          alt="Gokak Falls thundering over sandstone cliffs beneath the historic suspension bridge in Belagavi, Karnataka"
          loading="eager"
          className="w-full h-full object-cover object-center"
        />
        {/* Measured editorial gradient scrim for crisp 4.5:1+ legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0D2118]/95 via-[#0D2118]/68 to-[#0D2118]/36 sm:via-[#0D2118]/58 sm:to-[#0D2118]/28"
        />
      </div>

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pb-16">
        <div className="max-w-3xl">
          <p className="text-[11px] sm:text-sm font-medium tracking-[0.1em] sm:tracking-[0.14em] uppercase text-[#F3EDE2]/95 mb-4">
            {t.hero.kicker}
          </p>

          <h1
            className="font-serif font-semibold text-[#FAF9F6] tracking-tight leading-[1.12] drop-shadow-[0_2px_12px_rgba(0,0,0,0.28)]"
            style={{ fontSize: 'clamp(2.25rem, 4.3vw, 3.75rem)' }}
          >
            {t.hero.headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#FAF9F6]/92 leading-relaxed max-w-2xl">
            {t.hero.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#destinations"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-[10px] shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>{t.hero.ctaExplore}</span>
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <a
              href="#plan-trip"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#FAF9F6] bg-[#FAF9F6]/16 hover:bg-[#FAF9F6]/24 border border-[#FAF9F6]/40 backdrop-blur-sm rounded-[10px] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <CalendarRange className="w-4 h-4" aria-hidden="true" />
              <span>{t.hero.ctaPlan}</span>
            </a>
          </div>
        </div>

        {/* Quiet Editorial Operational Ribbon */}
        <div className="mt-12 pt-5 border-t border-[#FAF9F6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-[13px] text-[#FAF9F6]/85">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>Belagavi (Belgaum), Karnataka</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">15.8497° N, 74.4977° E</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">Elevation 751 m</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>Monsoon Cascades: Jul–Nov</span>
            <span aria-hidden="true">·</span>
            <span>Heritage &amp; Wildlife: Oct–Mar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
