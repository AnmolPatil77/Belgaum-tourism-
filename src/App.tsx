import { useCallback, useEffect, useState } from 'react';
import type {
  ContentPayload,
  GalleryPhoto,
  LanguageCode,
  Stay,
  TripFormInput,
  TripRequest,
  VisitorReview,
} from './types/belagavi';
import { TRANSLATIONS } from './utils/i18n';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DestinationsSection } from './components/DestinationsSection';
import { InteractiveMapSection } from './components/InteractiveMapSection';
import { StaysSection } from './components/StaysSection';
import { FoodCultureSection } from './components/FoodCultureSection';
import { GalleryReviewsSection } from './components/GalleryReviewsSection';
import { TripPlannerSection } from './components/TripPlannerSection';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { Footer } from './components/Footer';

const DEFAULT_TRAVEL_DATE = '2026-12-18';

const INITIAL_TRIP_FORM: TripFormInput = {
  destinationIds: ['gokak-falls', 'belagavi-fort'],
  stayId: 'welcomhotel-kakati',
  roomType: 'Executive Suite',
  rooms: 1,
  experiences: ['Local Food Trail', 'Heritage & Fort Walk'],
  bookmarkedCultureIds: ['belagavi-kunda'],
  fullName: '',
  email: '',
  phone: '',
  travelDate: DEFAULT_TRAVEL_DATE,
  duration: '2 Days / 1 Night',
  adults: 2,
  children: 0,
  budgetTier: 'Standard',
  notes: '',
};

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('EN');
  const [content, setContent] = useState<ContentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [tripForm, setTripForm] = useState<TripFormInput>(INITIAL_TRIP_FORM);
  const [adminOpen, setAdminOpen] = useState(false);
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const t = TRANSLATIONS[language];

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/content');
      if (!res.ok) throw new Error('Failed to load Belagavi guide content.');
      const data = (await res.json()) as ContentPayload;
      setContent(data);
    } catch {
      setLoadError('Unable to load Belagavi tourism data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) return;
      const data = (await res.json()) as { trips: TripRequest[] };
      setTrips(data.trips || []);
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    void fetchContent();
    void fetchTrips();
  }, [fetchContent, fetchTrips]);

  const handleToggleDestination = useCallback((id: string) => {
    setTripForm((prev) => ({
      ...prev,
      destinationIds: prev.destinationIds.includes(id)
        ? prev.destinationIds.filter((item) => item !== id)
        : [...prev.destinationIds, id],
    }));
  }, []);

  const handleSelectStay = useCallback((stay: Stay) => {
    setTripForm((prev) => ({
      ...prev,
      stayId: stay.id,
      roomType: stay.defaultRoomType,
      duration: prev.duration === '1 Day' ? '2 Days / 1 Night' : prev.duration,
    }));
    const el = document.getElementById('plan-trip');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSelectStayById = useCallback(
    (stayId: string) => {
      const found = content?.stays.find((s) => s.id === stayId);
      setTripForm((prev) => ({
        ...prev,
        stayId,
        roomType: found ? found.defaultRoomType : prev.roomType,
      }));
    },
    [content]
  );

  const handleClearRoute = useCallback(() => {
    setTripForm((prev) => ({
      ...prev,
      destinationIds: [],
      stayId: '',
      roomType: 'No Stay Needed - Day Trip',
    }));
  }, []);

  const handleToggleCultureBookmark = useCallback((id: string) => {
    setTripForm((prev) => ({
      ...prev,
      bookmarkedCultureIds: prev.bookmarkedCultureIds.includes(id)
        ? prev.bookmarkedCultureIds.filter((item) => item !== id)
        : [...prev.bookmarkedCultureIds, id],
    }));
  }, []);

  const handleReviewAdded = useCallback((review: VisitorReview) => {
    setContent((prev) =>
      prev ? { ...prev, reviews: [review, ...prev.reviews] } : prev
    );
  }, []);

  const handlePhotoAdded = useCallback((photo: GalleryPhoto) => {
    setContent((prev) =>
      prev ? { ...prev, gallery: [photo, ...prev.gallery] } : prev
    );
  }, []);

  const handleTripCreated = useCallback((trip: TripRequest) => {
    setTrips((prev) => [trip, ...prev]);
  }, []);

  const handleTripUpdated = useCallback((updated: TripRequest) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleTripDeleted = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleOpenAdmin = () => {
    setAdminOpen(true);
    void fetchTrips();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <p className="font-serif text-2xl text-[#1B4332]">Belagavi</p>
        <p className="mt-2 text-sm text-[#1F2937]/65">
          Loading Belagavi destinations, stays, and heritage archive...
        </p>
      </div>
    );
  }

  if (loadError || !content) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <p className="font-serif text-2xl text-[#1B4332]">Belagavi Heritage &amp; Stays</p>
        <p className="mt-2 text-sm text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={() => void fetchContent()}
          className="mt-4 px-5 py-2.5 text-sm font-semibold text-white bg-[#D97706] rounded-[10px] cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const heroImage =
    content.destinations[0]?.image ||
    '/src/assets/images/hero_gokak_falls_1795491751252.jpg';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2937]">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        t={t}
        onOpenAdmin={handleOpenAdmin}
        selectedTripCount={tripForm.destinationIds.length}
      />

      <main>
        <HeroSection t={t} heroImage={heroImage} />

        <DestinationsSection
          destinations={content.destinations}
          selectedDestinationIds={tripForm.destinationIds}
          onToggleDestination={handleToggleDestination}
          t={t}
        />

        <InteractiveMapSection
          destinations={content.destinations}
          stays={content.stays}
          foodSpots={content.foodSpots}
          selectedDestinationIds={tripForm.destinationIds}
          selectedStayId={tripForm.stayId}
          onToggleDestination={handleToggleDestination}
          onSelectStay={handleSelectStayById}
          onClearRoute={handleClearRoute}
          t={t}
        />

        <StaysSection
          stays={content.stays}
          selectedStayId={tripForm.stayId}
          onSelectStay={handleSelectStay}
          t={t}
        />

        <FoodCultureSection
          items={content.cultureItems}
          bookmarkedIds={tripForm.bookmarkedCultureIds}
          onToggleBookmark={handleToggleCultureBookmark}
          t={t}
        />

        <GalleryReviewsSection
          gallery={content.gallery}
          reviews={content.reviews}
          onReviewAdded={handleReviewAdded}
          t={t}
        />

        <TripPlannerSection
          destinations={content.destinations}
          stays={content.stays}
          cultureItems={content.cultureItems}
          form={tripForm}
          onChangeForm={setTripForm}
          onTripCreated={handleTripCreated}
          t={t}
        />
      </main>

      <Footer t={t} onOpenAdmin={handleOpenAdmin} />

      <AdminDashboardModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        trips={trips}
        loadingTrips={loadingTrips}
        onRefreshTrips={fetchTrips}
        onTripUpdated={handleTripUpdated}
        onTripDeleted={handleTripDeleted}
        galleryCount={content.gallery.length}
        onPhotoAdded={handlePhotoAdded}
      />
    </div>
  );
}
