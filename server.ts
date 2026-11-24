import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type {
  BudgetTier,
  GalleryCategory,
  TripDuration,
  TripFormInput,
  TripStatus,
} from './src/types/belagavi.ts';
import {
  calculateTripEstimate,
  isSafeImageUrl,
  validateTripForm,
} from './src/utils/tripCalculator.ts';
import {
  SEED_CULTURE_ITEMS,
  SEED_DESTINATIONS,
  SEED_STAYS,
} from './server/seedData.ts';
import {
  addGalleryPhoto,
  addReview,
  createTrip,
  deleteTripById,
  getAllTrips,
  getContentPayload,
  saveBase64ImageUpload,
  updateTripStatus,
  UPLOADS_DIR,
} from './server/store.ts';

const PORT = Number(process.env.PORT) || 3000;
const VALID_STATUSES: TripStatus[] = ['Pending', 'Confirmed', 'Completed'];
const VALID_DURATIONS: TripDuration[] = [
  '1 Day',
  '2 Days / 1 Night',
  '3 Days / 2 Nights',
];
const VALID_BUDGETS: BudgetTier[] = ['Budget', 'Standard', 'Premium'];
const VALID_GALLERY_CATEGORIES: GalleryCategory[] = [
  'Destinations',
  'Stays',
  'Food',
  'Culture',
];

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Serve confined uploaded gallery photos safely
  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }
    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'File not found.' });
      return;
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(resolved);
  });

  // GET /api/content — All Belagavi destinations, stays, food/art/culture, food spots, gallery, reviews
  app.get('/api/content', (_req, res) => {
    res.json(getContentPayload());
  });

  // GET /api/trips — Fetch all trip & stay requests for Admin Dashboard
  app.get('/api/trips', (_req, res) => {
    res.json({ trips: getAllTrips() });
  });

  // POST /api/trips — Validate and store visitor trip + hotel room request
  app.post('/api/trips', (req, res) => {
    const body = req.body ?? {};

    const destinationIds = Array.isArray(body.destinationIds)
      ? body.destinationIds
          .filter((id: unknown): id is string => typeof id === 'string')
          .filter((id: string) => SEED_DESTINATIONS.some((d) => d.id === id))
      : [];

    const stayIdRaw = sanitizeText(body.stayId, 80);
    const stayRecord = SEED_STAYS.find((s) => s.id === stayIdRaw);
    const stayId = stayRecord ? stayRecord.id : '';

    const roomType = sanitizeText(body.roomType, 60) || 'Standard / Deluxe Room';
    const rooms = Math.max(1, Math.min(10, Math.round(Number(body.rooms) || 1)));
    const duration: TripDuration = VALID_DURATIONS.includes(body.duration)
      ? body.duration
      : '2 Days / 1 Night';
    const budgetTier: BudgetTier = VALID_BUDGETS.includes(body.budgetTier)
      ? body.budgetTier
      : 'Standard';
    const adults = Math.round(Number(body.adults) || 0);
    const children = Math.max(0, Math.round(Number(body.children) || 0));

    const experiences = Array.isArray(body.experiences)
      ? body.experiences
          .filter((item: unknown): item is string => typeof item === 'string')
          .map((item: string) => item.trim().slice(0, 80))
          .filter(Boolean)
          .slice(0, 12)
      : [];

    const bookmarkedCultureIds = Array.isArray(body.bookmarkedCultureIds)
      ? body.bookmarkedCultureIds
          .filter((id: unknown): id is string => typeof id === 'string')
          .filter((id: string) => SEED_CULTURE_ITEMS.some((c) => c.id === id))
      : [];

    const input: TripFormInput = {
      destinationIds,
      stayId,
      roomType: stayRecord ? roomType : 'No Stay Needed - Day Trip',
      rooms,
      experiences,
      bookmarkedCultureIds,
      fullName: sanitizeText(body.fullName, 100),
      email: sanitizeText(body.email, 120),
      phone: sanitizeText(body.phone, 30),
      travelDate: sanitizeText(body.travelDate, 20),
      duration,
      adults,
      children,
      budgetTier,
      notes: sanitizeText(body.notes, 600),
    };

    const validationErrors = validateTripForm(input);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        error: 'Please check the highlighted trip details.',
        fields: validationErrors,
      });
      return;
    }

    const destinationNames = SEED_DESTINATIONS.filter((d) =>
      destinationIds.includes(d.id)
    ).map((d) => d.name);

    const bookmarkedCultureNames = SEED_CULTURE_ITEMS.filter((c) =>
      bookmarkedCultureIds.includes(c.id)
    ).map((c) => c.title);

    const estimate = calculateTripEstimate(
      input,
      SEED_DESTINATIONS,
      SEED_STAYS,
      bookmarkedCultureNames
    );

    const saved = createTrip({
      ...input,
      stayName: stayRecord ? stayRecord.name : 'Day Trip (No Stay)',
      destinationNames,
      bookmarkedCultureNames,
      estimatedBudget: estimate.totalCost,
      routeDistanceKm: estimate.totalRouteKm,
      estimatedDriveTime: estimate.formattedDriveTime,
    });

    res.status(201).json({ trip: saved, estimate });
  });

  // PATCH /api/trips/:id — Update booking status
  app.patch('/api/trips/:id', (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const status = req.body?.status as TripStatus;
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({
        error: 'Status must be Pending, Confirmed, or Completed.',
      });
      return;
    }

    const updated = updateTripStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }
    res.json({ trip: updated });
  });

  // DELETE /api/trips/:id — Delete a trip entry
  app.delete('/api/trips/:id', (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const removed = deleteTripById(id);
    if (!removed) {
      res.status(404).json({ error: 'Trip request not found.' });
      return;
    }
    res.json({ deleted: true, id });
  });

  // POST /api/gallery — Add new tourist or hotel photo (URL or uploaded file)
  app.post('/api/gallery', (req, res) => {
    const body = req.body ?? {};
    const title = sanitizeText(body.title, 120);
    const location = sanitizeText(body.location, 80) || 'Belagavi, Karnataka';
    const category = body.category as GalleryCategory;

    if (title.length < 3) {
      res.status(400).json({ error: 'Photo title must be at least 3 characters.' });
      return;
    }
    if (!VALID_GALLERY_CATEGORIES.includes(category)) {
      res.status(400).json({ error: 'Please select a valid photo category.' });
      return;
    }

    let finalImageUrl = '';
    if (typeof body.imageDataUrl === 'string' && body.imageDataUrl.trim()) {
      try {
        finalImageUrl = saveBase64ImageUpload(body.imageDataUrl);
      } catch (err) {
        res.status(400).json({
          error: err instanceof Error ? err.message : 'Invalid image file upload.',
        });
        return;
      }
    } else if (typeof body.image === 'string' && isSafeImageUrl(body.image)) {
      finalImageUrl = body.image.trim();
    } else {
      res.status(400).json({
        error: 'Please provide a valid http(s) image URL or upload a JPEG/PNG/WebP image.',
      });
      return;
    }

    const photo = addGalleryPhoto({
      title,
      category,
      location,
      image: finalImageUrl,
    });
    res.status(201).json({ photo });
  });

  // POST /api/reviews — Save new visitor review
  app.post('/api/reviews', (req, res) => {
    const body = req.body ?? {};
    const name = sanitizeText(body.name, 80);
    const location = sanitizeText(body.location, 80);
    const visitedSeason = sanitizeText(body.visitedSeason, 40) || 'Recent Visit';
    const comment = sanitizeText(body.comment, 600);
    const rating = Math.round(Number(body.rating));

    if (name.length < 2) {
      res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
      return;
    }
    if (location.length < 2) {
      res.status(400).json({ error: 'Please enter your city or state.' });
      return;
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
      return;
    }
    if (comment.length < 10) {
      res.status(400).json({ error: 'Please write at least 10 characters in your review.' });
      return;
    }

    const review = addReview({
      name,
      location,
      rating,
      visitedSeason,
      comment,
    });
    res.status(201).json({ review });
  });

  // Mount Vite middleware in development, or serve static dist in production
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Belagavi Heritage & Stays running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
