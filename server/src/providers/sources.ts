/**
 * Live-data provider layer.
 *
 * Each app binds one authoritative public feed. The feed is optional: the app
 * ships with a small embedded snapshot so a fresh clone, the test suite, and
 * any offline machine stay fully functional and deterministic. Setting
 * `SOURCE_MODE=live` makes the server query the real endpoint (with a timeout
 * and a TTL cache) and fall back to the snapshot when the network is away.
 *
 * Nothing in the request path can block on the network being up.
 */

import { z } from 'zod';

import type { SourceMode } from '@chronos/shared';

export interface SourceEvent {
  id: string;
  title: string;
  category: string;
  lat: number;
  lon: number;
  date: string;
}

export interface SourceSnapshot {
  id: string;
  label: string;
  url: string;
  mode: SourceMode;
  fetchedAt: string | null;
  note: string | null;
  events: SourceEvent[];
}

export interface SourceProvider {
  id: string;
  label: string;
  url: string;
  /** Offline, deterministic stand-in committed with the repository. */
  embedded: SourceEvent[];
  /** Query the public endpoint and normalise it into SourceEvent[]. */
  fetchLive: (signal: AbortSignal) => Promise<SourceEvent[]>;
}

const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=40';

const eonetSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      categories: z.array(z.object({ id: z.string(), title: z.string() })).default([]),
      geometry: z
        .array(
          z.object({
            date: z.string(),
            coordinates: z.array(z.number()).min(2)
          })
        )
        .default([])
    })
  )
});

/**
 * A representative slice of open natural events. Kept intentionally small and
 * clearly dated; it exists to keep the product usable offline, not to pretend
 * the data is current.
 */
const EMBEDDED_EVENTS: SourceEvent[] = [
  { id: 'EONET-1', title: 'Wildfire complex, Northern California', category: 'Wildfires', lat: 39.8, lon: -121.2, date: '2026-09-18' },
  { id: 'EONET-2', title: 'Wildfire front, Amazonas', category: 'Wildfires', lat: -5.1, lon: -62.4, date: '2026-09-21' },
  { id: 'EONET-3', title: 'Tropical storm, Bay of Bengal', category: 'Severe Storms', lat: 18.4, lon: 88.9, date: '2026-09-25' },
  { id: 'EONET-4', title: 'Iceberg calving, Weddell Sea', category: 'Sea and Lake Ice', lat: -72.6, lon: -38.1, date: '2026-09-12' },
  { id: 'EONET-5', title: 'Volcanic ash plume, Kamchatka', category: 'Volcanoes', lat: 56.1, lon: 160.4, date: '2026-09-27' },
  { id: 'EONET-6', title: 'Flood extent, Punjab', category: 'Floods', lat: 30.9, lon: 75.4, date: '2026-09-09' },
  { id: 'EONET-7', title: 'Dust storm, Sahel', category: 'Dust and Haze', lat: 15.2, lon: 8.7, date: '2026-09-14' }
];

export const chronosProvider: SourceProvider = {
  id: 'nasa-eonet',
  label: 'NASA EONET open events',
  url: EONET_URL,
  embedded: EMBEDDED_EVENTS,
  async fetchLive(signal) {
    const response = await fetch(EONET_URL, {
      signal,
      headers: { accept: 'application/json', 'user-agent': 'Chronos/1.1 (+https://github.com/shivang-jindal/Chronos)' }
    });
    if (!response.ok) throw new Error(`EONET responded ${response.status}`);

    const parsed = eonetSchema.parse(await response.json());
    return parsed.events.flatMap((event) => {
      const point = event.geometry[event.geometry.length - 1];
      const lat = point?.coordinates[1];
      const lon = point?.coordinates[0];
      if (typeof lat !== 'number' || typeof lon !== 'number') return [];
      return [
        {
          id: event.id,
          title: event.title,
          category: event.categories[0]?.title ?? 'Uncategorised',
          lat,
          lon,
          date: (point?.date ?? '').slice(0, 10)
        }
      ];
    });
  }
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;

export class SourceRegistry {
  private snapshot: SourceSnapshot;
  private cachedAt: number | null = null;
  private inFlight: Promise<SourceSnapshot> | null = null;

  constructor(
    private readonly provider: SourceProvider,
    readonly configuredMode: 'live' | 'embedded'
  ) {
    this.snapshot = this.embeddedSnapshot(
      configuredMode === 'live'
        ? 'Live feed enabled; no successful fetch yet, serving the embedded snapshot.'
        : 'Embedded snapshot. Set SOURCE_MODE=live to query NASA EONET.'
    );
  }

  private embeddedSnapshot(note: string): SourceSnapshot {
    return {
      id: this.provider.id,
      label: this.provider.label,
      url: this.provider.url,
      mode: 'embedded',
      fetchedAt: null,
      note,
      events: this.provider.embedded
    };
  }

  status(): SourceSnapshot {
    return this.snapshot;
  }

  /**
   * Return the freshest data available without making the caller wait on a
   * cold network fetch: live data is only refreshed by `refresh()` or once the
   * TTL has elapsed since a previous successful fetch.
   */
  async current(): Promise<SourceSnapshot> {
    if (this.configuredMode !== 'live') return this.snapshot;
    if (this.cachedAt !== null && Date.now() - this.cachedAt < CACHE_TTL_MS) return this.snapshot;
    return this.refresh();
  }

  async refresh(): Promise<SourceSnapshot> {
    if (this.configuredMode !== 'live') {
      this.snapshot = this.embeddedSnapshot(
        'Embedded snapshot. Set SOURCE_MODE=live to query NASA EONET.'
      );
      return this.snapshot;
    }

    this.inFlight ??= this.fetchOnce().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async fetchOnce(): Promise<SourceSnapshot> {
    try {
      const events = await this.provider.fetchLive(AbortSignal.timeout(FETCH_TIMEOUT_MS));
      this.cachedAt = Date.now();
      this.snapshot = {
        id: this.provider.id,
        label: this.provider.label,
        url: this.provider.url,
        mode: 'live',
        fetchedAt: new Date().toISOString(),
        note: null,
        events
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.snapshot = {
        ...this.snapshot,
        mode: this.snapshot.fetchedAt ? 'cache' : 'embedded',
        note: `Live fetch failed (${reason.slice(0, 120)}); serving the embedded snapshot.`
      };
    }
    return this.snapshot;
  }
}
