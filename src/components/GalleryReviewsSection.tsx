import { useEffect, useState, type FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Star,
  X,
} from 'lucide-react';
import type {
  GalleryCategory,
  GalleryPhoto,
  VisitorReview,
} from '../types/belagavi';
import type { Translations } from '../utils/i18n';
import { SafeImage } from './SafeImage';

interface GalleryReviewsSectionProps {
  gallery: GalleryPhoto[];
  reviews: VisitorReview[];
  onReviewAdded: (review: VisitorReview) => void;
  t: Translations;
}

const GALLERY_FILTERS: ('All' | GalleryCategory)[] = [
  'All',
  'Destinations',
  'Stays',
  'Food',
  'Culture',
];

export function GalleryReviewsSection({
  gallery,
  reviews,
  onReviewAdded,
  t,
}: GalleryReviewsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [visitedSeason, setVisitedSeason] = useState('November 2026');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const filteredPhotos =
    activeCategory === 'All'
      ? gallery
      : gallery.filter((photo) => photo.category === activeCategory);

  const activePhoto =
    lightboxIndex !== null && filteredPhotos[lightboxIndex]
      ? filteredPhotos[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredPhotos.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredPhotos.length) % filteredPhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location,
          visitedSeason,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Could not submit your review.');
        return;
      }
      onReviewAdded(data.review);
      setName('');
      setLocation('');
      setComment('');
      setRating(5);
      setReviewModalOpen(false);
    } catch {
      setReviewError('Network error while saving your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="gallery" className="py-20 lg:py-24 border-b border-[#1B4332]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masonry Photo Gallery */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
              05. Editorial Archive
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
              {t.sections.galleryTitle}
            </h2>
            <p className="mt-3 text-[15px] text-[#1F2937]/75 leading-relaxed">
              {t.sections.gallerySub}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter gallery photos by category"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-[#1B4332]/6 rounded-xl self-start lg:self-auto"
          >
            {GALLERY_FILTERS.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveCategory(cat);
                    setLightboxIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1B4332] text-[#FAF9F6] shadow-xs'
                      : 'text-[#1F2937]/75 hover:text-[#1B4332]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* CSS Columns Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((photo, index) => (
            <figure
              key={photo.id}
              className="break-inside-avoid group bg-white rounded-[14px] overflow-hidden shadow-[0_8px_28px_-10px_rgba(27,67,50,0.12)]"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Enlarge photo: ${photo.title}`}
                className="w-full text-left block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]"
              >
                <div
                  className={`overflow-hidden bg-[#E9E5DC] ${
                    index % 3 === 0 ? 'aspect-[4/3]' : index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[16/11]'
                  }`}
                >
                  <SafeImage
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-4">
                  <p className="text-xs font-medium text-[#1B4332]/75">
                    {photo.category} · {photo.location}
                  </p>
                  <p className="mt-1 font-serif text-base font-medium text-[#1F2937] group-hover:text-[#1B4332] transition-colors">
                    {photo.title}
                  </p>
                </figcaption>
              </button>
            </figure>
          ))}
        </div>

        {/* Visitor Stories & Reviews */}
        <div className="mt-24 pt-16 border-t border-[#1B4332]/12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#1B4332]/75 mb-2">
                06. Traveler Reflections
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1B4332] leading-tight">
                {t.sections.reviewsTitle}
              </h2>
              <p className="mt-2.5 text-[15px] text-[#1F2937]/75">
                {t.sections.reviewsSub}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] rounded-[10px] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" aria-hidden="true" />
              <span>Leave a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {reviews.map((rev) => (
              <article
                key={rev.id}
                className="bg-white rounded-[14px] p-6 shadow-[0_8px_28px_-10px_rgba(27,67,50,0.1)] flex flex-col justify-between border border-[#1B4332]/8"
              >
                <div>
                  <div
                    className="flex items-center gap-1 mb-4"
                    aria-label={`Rated ${rev.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-[#D97706] text-[#D97706]'
                            : 'text-[#1F2937]/20'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-xs font-medium text-[#1F2937]/60 tabular-nums">
                      {rev.rating}.0 / 5
                    </span>
                  </div>

                  <p className="text-[15px] text-[#1F2937]/85 leading-relaxed">
                    “{rev.comment}”
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1B4332]/10">
                  <p className="font-serif text-base font-semibold text-[#1B4332]">
                    {rev.name}
                  </p>
                  <p className="text-xs text-[#1F2937]/60 mt-0.5">
                    {rev.location} · Visited {rev.visitedSeason}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo lightbox: ${activePhoto.title}`}
          className="fixed inset-0 z-50 bg-[#0D2118]/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#FAF9F6] rounded-[14px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close photo lightbox"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#133124]/80 text-white hover:bg-[#133124] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-[#133124] max-h-[70vh] flex items-center justify-center overflow-hidden">
              <SafeImage
                src={activePhoto.image}
                alt={activePhoto.title}
                className="w-full max-h-[70vh] object-contain"
              />
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous gallery photo"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredPhotos.length) %
                          filteredPhotos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#133124]/75 text-white hover:bg-[#133124] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next gallery photo"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#133124]/75 text-white hover:bg-[#133124] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#1B4332]/75">
                  {activePhoto.category} · {activePhoto.location}
                </p>
                <h3 className="font-serif text-xl font-semibold text-[#1F2937] mt-1">
                  {activePhoto.title}
                </h3>
              </div>
              <p className="text-xs text-[#1F2937]/60 tabular-nums">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leave a Review Modal */}
      {reviewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Leave a Belagavi visitor review"
          className="fixed inset-0 z-50 bg-[#0D2118]/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#FAF9F6] rounded-[14px] p-6 sm:p-8 shadow-2xl border border-[#1B4332]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1B4332]/12">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#1B4332]">
                  Share Your Belagavi Story
                </h3>
                <p className="text-xs text-[#1F2937]/65 mt-1">
                  Your review is saved immediately to our visitor archive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                aria-label="Close review form"
                className="w-9 h-9 rounded-lg hover:bg-[#1B4332]/10 flex items-center justify-center text-[#1F2937] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              {reviewError && (
                <p
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                >
                  {reviewError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rev-name"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anjali Patil"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rev-location"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    City / State
                  </label>
                  <input
                    id="rev-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mysuru, Karnataka"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rev-rating"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Rating
                  </label>
                  <select
                    id="rev-rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    <option value={5}>5 Stars — Extraordinary</option>
                    <option value={4}>4 Stars — Wonderful</option>
                    <option value={3}>3 Stars — Good</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Needs Improvement</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rev-season"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Month Visited
                  </label>
                  <input
                    id="rev-season"
                    type="text"
                    value={visitedSeason}
                    onChange={(e) => setVisitedSeason(e.target.value)}
                    placeholder="e.g. November 2026"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rev-comment"
                  className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                >
                  Your Experience
                </label>
                <textarea
                  id="rev-comment"
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share highlights from your visit to Belagavi’s forts, falls, stays, or local food..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-[#1F2937]/75 hover:text-[#1F2937] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-[10px] transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
