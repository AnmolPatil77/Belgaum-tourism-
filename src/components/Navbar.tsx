import { useState } from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import type { LanguageCode } from '../types/belagavi';
import type { Translations } from '../utils/i18n';

interface NavbarProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  t: Translations;
  onOpenAdmin: () => void;
  selectedTripCount: number;
}

const LANG_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'EN', label: 'EN' },
  { code: 'KN', label: 'ಕನ್ನಡ' },
  { code: 'MR', label: 'मराठी' },
];

export function Navbar({
  language,
  onLanguageChange,
  t,
  onOpenAdmin,
  selectedTripCount,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#destinations', label: t.nav.destinations },
    { href: '#interactive-map', label: t.nav.map },
    { href: '#stays', label: t.nav.stays },
    { href: '#food-culture', label: t.nav.culture },
    { href: '#gallery', label: t.nav.gallery },
    {
      href: '#plan-trip',
      label:
        selectedTripCount > 0
          ? `${t.nav.planTrip} (${selectedTripCount})`
          : t.nav.planTrip,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/88 backdrop-blur-md border-b border-[#1B4332]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1B4332] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D97706]"
        >
          {t.brand}
        </a>

        {/* Zone 2: Clean single-line typography nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden xl:flex items-center gap-6 text-[13.5px] font-medium text-[#1F2937]/80"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-1 hover:text-[#1B4332] border-b border-transparent hover:border-[#1B4332]/50 transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language Switcher + Admin Dashboard Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label="Select display language"
            className="hidden sm:flex items-center text-xs font-medium text-[#1F2937]/70 divide-x divide-[#1B4332]/20"
          >
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => onLanguageChange(opt.code)}
                aria-pressed={language === opt.code}
                className={`px-2 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === opt.code
                    ? 'text-[#1B4332] font-semibold underline underline-offset-4'
                    : 'hover:text-[#1B4332]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-[13px] font-medium text-[#FAF9F6] bg-[#1B4332] hover:bg-[#133124] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.nav.admin}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#1B4332] hover:bg-[#1B4332]/8 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-[#1B4332]/10 bg-[#FAF9F6] px-4 py-4 space-y-3">
          <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-[#1F2937] hover:text-[#1B4332] hover:bg-[#1B4332]/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#1B4332]/10 flex items-center justify-between sm:hidden">
            <span className="text-xs text-[#1F2937]/65">Language</span>
            <div className="flex items-center divide-x divide-[#1B4332]/20 text-xs">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(opt.code);
                    setMobileOpen(false);
                  }}
                  className={`px-2.5 py-1.5 ${
                    language === opt.code
                      ? 'text-[#1B4332] font-semibold'
                      : 'text-[#1F2937]/70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
