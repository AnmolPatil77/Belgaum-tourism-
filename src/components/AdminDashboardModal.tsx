import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ImagePlus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  GalleryCategory,
  GalleryPhoto,
  TripRequest,
  TripStatus,
} from '../types/belagavi';
import { formatINR } from '../utils/tripCalculator';

interface AdminDashboardModalProps {
  open: boolean;
  onClose: () => void;
  trips: TripRequest[];
  loadingTrips: boolean;
  onRefreshTrips: () => Promise<void>;
  onTripUpdated: (trip: TripRequest) => void;
  onTripDeleted: (id: string) => void;
  galleryCount: number;
  onPhotoAdded: (photo: GalleryPhoto) => void;
}

const STATUS_OPTIONS: TripStatus[] = ['Pending', 'Confirmed', 'Completed'];
const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Destinations',
  'Stays',
  'Food',
  'Culture',
];

export function AdminDashboardModal({
  open,
  onClose,
  trips,
  loadingTrips,
  onRefreshTrips,
  onTripUpdated,
  onTripDeleted,
  galleryCount,
  onPhotoAdded,
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'gallery'>('bookings');
  const [statusFilter, setStatusFilter] = useState<'All' | TripStatus>('All');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Gallery upload form state
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoLocation, setPhotoLocation] = useState('Belagavi, Karnataka');
  const [photoCategory, setPhotoCategory] = useState<GalleryCategory>('Destinations');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filteredTrips =
    statusFilter === 'All'
      ? trips
      : trips.filter((t) => t.status === statusFilter);

  const totalEstimatedRevenue = trips.reduce(
    (sum, t) => sum + (t.estimatedBudget || 0),
    0
  );
  const confirmedCount = trips.filter((t) => t.status === 'Confirmed').length;

  const handleStatusChange = async (id: string, nextStatus: TripStatus) => {
    setActionError('');
    setBusyId(id);
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Could not update booking status.');
        return;
      }
      onTripUpdated(data.trip);
    } catch {
      setActionError('Network error while updating status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    setActionError('');
    setBusyId(id);
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Could not delete trip entry.');
        return;
      }
      onTripDeleted(id);
    } catch {
      setActionError('Network error while deleting trip.');
    } finally {
      setBusyId(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActionError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setActionError('Please choose a JPEG, PNG, or WebP image file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setActionError('Image file must be 3 MB or smaller.');
      return;
    }
    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGallerySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setActionError('');
    setPhotoSuccess('');
    setUploadingPhoto(true);

    try {
      const payload =
        uploadMode === 'file'
          ? {
              title: photoTitle,
              category: photoCategory,
              location: photoLocation,
              imageDataUrl: photoDataUrl,
            }
          : {
              title: photoTitle,
              category: photoCategory,
              location: photoLocation,
              image: photoUrl,
            };

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Could not add gallery photo.');
        return;
      }
      onPhotoAdded(data.photo);
      setPhotoTitle('');
      setPhotoUrl('');
      setPhotoDataUrl('');
      setPhotoFileName('');
      setPhotoSuccess(`Added "${data.photo.title}" to the Belagavi Photo Gallery.`);
    } catch {
      setActionError('Network error while uploading photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Belagavi Tourism Admin Dashboard"
      className="fixed inset-0 z-50 bg-[#0D2118]/78 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-[#FAF9F6] rounded-[14px] shadow-2xl border border-[#1B4332]/15 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="bg-[#1B4332] text-[#FAF9F6] px-6 py-5 flex items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#FAF9F6]/70">
              Belagavi Tourism Operations
            </p>
            <h2 className="font-serif text-2xl font-semibold mt-0.5">
              Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void onRefreshTrips()}
              aria-label="Refresh bookings from server"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF9F6]/12 hover:bg-[#FAF9F6]/20 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingTrips ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Dashboard"
              className="w-9 h-9 rounded-lg bg-[#FAF9F6]/12 hover:bg-[#FAF9F6]/20 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-[#1B4332]/10 shrink-0">
          <div>
            <p className="text-xs text-[#1F2937]/60">Total Trip Requests</p>
            <p
              data-testid="admin-total-trips"
              className="font-serif text-2xl font-semibold text-[#1B4332] tabular-nums"
            >
              {trips.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#1F2937]/60">Confirmed Bookings</p>
            <p className="font-serif text-2xl font-semibold text-[#1F2937] tabular-nums">
              {confirmedCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#1F2937]/60">Estimated Booking Value</p>
            <p className="font-serif text-2xl font-semibold text-[#D97706] tabular-nums">
              {formatINR(totalEstimatedRevenue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#1F2937]/60">Gallery Photos</p>
            <p className="font-serif text-2xl font-semibold text-[#1B4332] tabular-nums">
              {galleryCount}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-3 border-b border-[#1B4332]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div role="tablist" className="flex items-center gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#1B4332] text-[#FAF9F6]'
                  : 'text-[#1F2937]/75 hover:bg-[#1B4332]/8'
              }`}
            >
              Trip &amp; Stay Requests ({trips.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'gallery'}
              onClick={() => setActiveTab('gallery')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#1B4332] text-[#FAF9F6]'
                  : 'text-[#1F2937]/75 hover:bg-[#1B4332]/8'
              }`}
            >
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              <span>Add Gallery Photo</span>
            </button>
          </div>

          {activeTab === 'bookings' && (
            <div className="flex items-center gap-1.5 text-xs">
              {(['All', ...STATUS_OPTIONS] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#1B4332]/12 text-[#1B4332] font-semibold'
                      : 'text-[#1F2937]/65 hover:text-[#1B4332]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {actionError && (
            <p
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
            >
              {actionError}
            </p>
          )}

          {activeTab === 'bookings' ? (
            filteredTrips.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#1B4332]/20 rounded-xl">
                <p className="text-sm text-[#1F2937]/70">
                  No trip or stay requests found in this view.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl border border-[#1B4332]/12">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#1B4332]/12 bg-[#FAF9F6] text-xs font-semibold text-[#1F2937]/70">
                      <th className="py-3.5 px-4">Ref ID &amp; Date</th>
                      <th className="py-3.5 px-4">Traveler</th>
                      <th className="py-3.5 px-4">Stay &amp; Route</th>
                      <th className="py-3.5 px-4 text-right">Estimate</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B4332]/10">
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id} className="hover:bg-[#FAF9F6]/60 align-top">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="font-mono text-xs font-bold text-[#1B4332] tabular-nums">
                            {trip.bookingId}
                          </p>
                          <p className="text-xs text-[#1F2937]/65 mt-1 tabular-nums">
                            {trip.travelDate} · {trip.duration}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-[#1F2937]">
                            {trip.fullName}
                          </p>
                          <p className="text-xs text-[#1F2937]/65 mt-0.5">
                            {trip.email}
                          </p>
                          <p className="text-xs text-[#1F2937]/65 tabular-nums">
                            {trip.phone} · {trip.adults}A / {trip.children}C
                          </p>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="font-medium text-[#1F2937]">
                            {trip.stayName}
                          </p>
                          <p className="text-xs text-[#1F2937]/65 mt-0.5">
                            {trip.roomType} ({trip.rooms} rm)
                          </p>
                          <p className="text-xs text-[#1B4332]/85 mt-1">
                            {trip.destinationNames.join(' · ')}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <p className="font-semibold text-[#1B4332] tabular-nums">
                            {formatINR(trip.estimatedBudget)}
                          </p>
                          <p className="text-xs text-[#1F2937]/60 mt-0.5 tabular-nums">
                            {trip.routeDistanceKm} km · {trip.budgetTier}
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            aria-label={`Update status for ${trip.bookingId}`}
                            value={trip.status}
                            disabled={busyId === trip.id}
                            onChange={(e) =>
                              void handleStatusChange(
                                trip.id,
                                e.target.value as TripStatus
                              )
                            }
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#1B4332]/25 bg-[#FAF9F6] text-[#1F2937] focus:outline-2 focus:outline-[#1B4332]"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={busyId === trip.id}
                            onClick={() => void handleDeleteTrip(trip.id)}
                            aria-label={`Delete booking ${trip.bookingId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <form
              onSubmit={handleGallerySubmit}
              className="max-w-2xl bg-white rounded-xl p-6 border border-[#1B4332]/12 space-y-5"
            >
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1B4332]">
                  Publish New Photo to Belagavi Gallery
                </h3>
                <p className="text-xs text-[#1F2937]/65 mt-1">
                  Add a tourist landmark, hotel suite, local delicacy, or cultural photo via URL or file upload.
                </p>
              </div>

              {photoSuccess && (
                <p
                  role="status"
                  className="p-3 rounded-lg bg-[#1B4332]/10 border border-[#1B4332]/25 text-xs font-semibold text-[#1B4332]"
                >
                  {photoSuccess}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="gal-title"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Photo Title *
                  </label>
                  <input
                    id="gal-title"
                    type="text"
                    required
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="e.g. Morning Mist at Jamboti Valley"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gal-category"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Category *
                  </label>
                  <select
                    id="gal-category"
                    value={photoCategory}
                    onChange={(e) =>
                      setPhotoCategory(e.target.value as GalleryCategory)
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  >
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gal-location"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Location in Belagavi
                  </label>
                  <input
                    id="gal-location"
                    type="text"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    placeholder="e.g. Khanapur, Belagavi"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              </div>

              {/* Upload source toggle */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                    uploadMode === 'url'
                      ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332]'
                      : 'bg-[#FAF9F6] text-[#1F2937]/75 border-[#1B4332]/20'
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-[#1B4332] text-[#FAF9F6] border-[#1B4332]'
                      : 'bg-[#FAF9F6] text-[#1F2937]/75 border-[#1B4332]/20'
                  }`}
                >
                  Upload Image File
                </button>
              </div>

              {uploadMode === 'url' ? (
                <div>
                  <label
                    htmlFor="gal-url"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Image URL (https:// or /src/assets/images/...) *
                  </label>
                  <input
                    id="gal-url"
                    type="text"
                    required
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="/src/assets/images/hero_gokak_falls_1795491751252.jpg"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#1B4332]/20 rounded-lg focus:outline-2 focus:outline-[#1B4332]"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="gal-file"
                    className="block text-xs font-semibold text-[#1F2937] mb-1.5"
                  >
                    Upload JPEG, PNG, or WebP (Max 3 MB) *
                  </label>
                  <label
                    htmlFor="gal-file"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1B4332]/25 rounded-xl bg-[#FAF9F6] hover:border-[#1B4332] transition-colors cursor-pointer text-center"
                  >
                    <Upload className="w-6 h-6 text-[#1B4332] mb-2" aria-hidden="true" />
                    <span className="text-sm font-medium text-[#1F2937]">
                      {photoFileName || 'Click to choose an image file'}
                    </span>
                    <input
                      id="gal-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 rounded-[10px] transition-colors cursor-pointer"
                >
                  {uploadingPhoto ? 'Publishing...' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
