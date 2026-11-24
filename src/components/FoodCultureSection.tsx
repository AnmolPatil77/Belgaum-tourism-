import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { CultureItem, CultureTab } from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import { SafeImage } from './SafeImage';

interface FoodCultureSectionProps {
  items: CultureItem[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  t: Translations;
}

const TABS: { id: CultureTab; label: string }[] = [
  { id: 'food', label: 'Local Food & Culinary Heritage' },
  { id: 'art', label: 'Traditional Art & Handicrafts' },
  { id: 'activities', label: 'Cultural Activities & Festivals' },
];

export function FoodCultureSection({
  items,
  bookmarkedIds,
  onToggleBookmark,
  t,
}: FoodCultureSectionProps) {
  const [activeTab, setActiveTab] = useState<CultureTab>('food');

  const visibleItems = items.filter((item) => item.tab === activeTab);

  return (
    <section
      id="food-culture"
      className="py-20 lg:py-24 bg-[#F3EFE6]/65 border-b border-[#1B4332]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
            04. Living Traditions
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
            {t.sections.cultureTitle}
          </h2>
          <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
            {t.sections.cultureSub}
          </p>
        </div>

        {/* 3-Tab Showcase Bar */}
        <div
          role="tablist"
          aria-label="Belagavi food, art, and cultural activity categories"
          className="flex flex-wrap items-center gap-2 border-b border-[#1B4332]/15 pb-3 mb-10"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-[10px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1B4332] text-[#FAF9F6]'
                    : 'text-[#1F2937]/75 hover:text-[#1B4332] hover:bg-[#1B4332]/6'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4-Card Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleItems.map((item) => {
            const saved = bookmarkedIds.includes(item.id);
            return (
              <article
                key={item.id}
                className="group bg-white rounded-[14px] overflow-hidden shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)] flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#E9E5DC]">
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#1B4332]/75 mb-1.5">
                    <span>{item.metaPrimary}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.metaSecondary}</span>
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-[#1F2937] leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-[#1F2937]/75 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(item.id)}
                    aria-pressed={saved}
                    aria-label={
                      saved
                        ? `Remove ${item.title} from saved trip bucket list`
                        : `Save ${item.title} to trip bucket list`
                    }
                    className={`mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-[10px] border transition-colors whitespace-nowrap cursor-pointer ${
                      saved
                        ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332] hover:bg-[#133124]'
                        : 'bg-[#FAF9F6] text-[#1B4332] border-[#1B4332]/25 hover:border-[#1B4332] hover:bg-[#1B4332]/5'
                    }`}
                  >
                    {saved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                        <span>Saved to Trip</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" aria-hidden="true" />
                        <span>Save to Trip</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
