import type { Translations } from '../utils/i18n';

interface FooterProps {
  t: Translations;
  onOpenAdmin: () => void;
}

export function Footer({ t, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#133124] text-[#FAF9F6] border-t border-[#FAF9F6]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#FAF9F6]/12">
          <div className="md:col-span-5">
            <p className="font-serif text-2xl font-semibold text-[#FAF9F6]">
              {t.brand} Heritage &amp; Stays
            </p>
            <p className="mt-3 text-sm text-[#FAF9F6]/75 leading-relaxed max-w-md">
              An editorial travel dossier and stay-planning companion dedicated exclusively to Belagavi (Belgaum), Karnataka—where Western Ghats waterfalls, 12th-century Ratta stone forts, and North Karnataka culinary craft converge.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF9F6]/60 mb-3">
              Explore Belagavi
            </p>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-[#FAF9F6]/80">
              <li>
                <a href="#destinations" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.destinations}
                </a>
              </li>
              <li>
                <a href="#interactive-map" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.map}
                </a>
              </li>
              <li>
                <a href="#stays" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.stays}
                </a>
              </li>
              <li>
                <a href="#food-culture" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.culture}
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.gallery}
                </a>
              </li>
              <li>
                <a href="#plan-trip" className="hover:text-[#FBBF24] transition-colors">
                  {t.nav.planTrip}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FAF9F6]/60 mb-3">
              Regional Gateway
            </p>
            <ul className="space-y-1.5 text-sm text-[#FAF9F6]/80 leading-relaxed">
              <li>Belagavi Airport (IXG) · Sambra</li>
              <li>Belagavi Railway Station (BGM)</li>
              <li>NH-48 Mumbai–Bengaluru Corridor</li>
            </ul>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="mt-4 text-xs font-semibold text-[#FBBF24] hover:underline cursor-pointer"
            >
              Open {t.nav.admin} →
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#FAF9F6]/60">
          <p>© 2026 Belagavi Heritage &amp; Stays · Karnataka, India</p>
          <p className="tabular-nums">15.8497° N, 74.4977° E</p>
        </div>
      </div>
    </footer>
  );
}
