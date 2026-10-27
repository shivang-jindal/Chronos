/**
 * Durable workspace storage.
 *
 * The five Gods-Eye apps are single-tenant analysis tools, so the default
 * persistence target is a JSON document on disk rather than a database: it
 * needs no service, no native build, and no migration step to clone and run.
 * Writes are atomic (temp file + rename) and serialised, so a crash mid-write
 * cannot truncate the workspace.
 *
 * Swap this class for a Postgres-backed implementation without touching the
 * routes: they only depend on the method surface below.
 */

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface StoreProject<C> {
  id: string;
  kind: string;
  name: string;
  config: C;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRun<O> {
  id: string;
  projectId: string;
  kind: string;
  createdAt: string;
  durationMs: number;
  provider: string;
  source: 'live' | 'embedded' | 'cache';
  summary: string;
  note: string | null;
  output: O;
}

interface Snapshot<C, O> {
  version: 1;
  projects: StoreProject<C>[];
  runs: StoreRun<O>[];
}

export interface ProjectSummary<C> extends StoreProject<C> {
  runCount: number;
  lastRunAt: string | null;
}

/** Keep the on-disk document bounded so it cannot grow without limit. */
const MAX_PROJECTS = 200;
const MAX_RUNS_PER_PROJECT = 50;
const MAX_RUNS = 2000;

function emptySnapshot<C, O>(): Snapshot<C, O> {
  return { version: 1, projects: [], runs: [] };
}

export class WorkspaceStore<C, O> {
  private snapshot: Snapshot<C, O> = emptySnapshot<C, O>();
  private loading: Promise<void> | null = null;
  private writing: Promise<void> = Promise.resolve();

  constructor(private readonly file: string) {}

  private async readOnce(): Promise<void> {
    try {
      const raw = await readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw) as Partial<Snapshot<C, O>>;
      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.runs)) return;
      this.snapshot = { version: 1, projects: parsed.projects, runs: parsed.runs };
    } catch {
      // A missing or corrupt file is treated as an empty workspace: the tool
      // stays usable instead of failing the whole API at boot.
      this.snapshot = emptySnapshot<C, O>();
    }
  }

  private ready(): Promise<void> {
    this.loading ??= this.readOnce();
    return this.loading;
  }

  private persist(): Promise<void> {
    const body = JSON.stringify(this.snapshot, null, 2);
    this.writing = this.writing
      .then(async () => {
        await mkdir(dirname(this.file), { recursive: true });
        const temp = `${this.file}.tmp`;
        await writeFile(temp, body, 'utf8');
        await rename(temp, this.file);
      })
      .catch(() => {
        // Keep serving from memory; the next write retries.
      });
    return this.writing;
  }

  private decorate(project: StoreProject<C>): ProjectSummary<C> {
    const runs = this.snapshot.runs.filter((run) => run.projectId === project.id);
    const last = runs.reduce<string | null>((latest, run) => {
      if (!latest) return run.createdAt;
      return run.createdAt > latest ? run.createdAt : latest;
    }, null);
    return { ...project, runCount: runs.length, lastRunAt: last };
  }

  async listProjects(): Promise<ProjectSummary<C>[]> {
    await this.ready();
    return [...this.snapshot.projects]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((project) => this.decorate(project));
  }

  async getProject(id: string): Promise<ProjectSummary<C> | null> {
    await this.ready();
    const project = this.snapshot.projects.find((candidate) => candidate.id === id);
    return project ? this.decorate(project) : null;
  }

  async createProject(kind: string, name: string, config: C): Promise<ProjectSummary<C>> {
    await this.ready();
    const now = new Date().toISOString();
    const project: StoreProject<C> = {
      id: randomUUID(),
      kind,
      name,
      config,
      createdAt: now,
      updatedAt: now
    };

    this.snapshot.projects.unshift(project);
    if (this.snapshot.projects.length > MAX_PROJECTS) {
      const dropped = this.snapshot.projects.splice(MAX_PROJECTS);
      const droppedIds = new Set(dropped.map((item) => item.id));
      this.snapshot.runs = this.snapshot.runs.filter((run) => !droppedIds.has(run.projectId));
    }

    await this.persist();
    return this.decorate(project);
  }

  async updateProject(
    id: string,
    patch: { name?: string; config?: C }
  ): Promise<ProjectSummary<C> | null> {
    await this.ready();
    const project = this.snapshot.projects.find((candidate) => candidate.id === id);
    if (!project) return null;

    if (patch.name !== undefined) project.name = patch.name;
    if (patch.config !== undefined) project.config = patch.config;
    project.updatedAt = new Date().toISOString();

    await this.persist();
    return this.decorate(project);
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.ready();
    const before = this.snapshot.projects.length;
    this.snapshot.projects = this.snapshot.projects.filter((project) => project.id !== id);
    if (this.snapshot.projects.length === before) return false;
    this.snapshot.runs = this.snapshot.runs.filter((run) => run.projectId !== id);
    await this.persist();
    return true;
  }

  async listRuns(projectId?: string): Promise<StoreRun<O>[]> {
    await this.ready();
    const runs = projectId
      ? this.snapshot.runs.filter((run) => run.projectId === projectId)
      : [...this.snapshot.runs];
    return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getRun(id: string): Promise<StoreRun<O> | null> {
    await this.ready();
    return this.snapshot.runs.find((run) => run.id === id) ?? null;
  }

  async addRun(run: Omit<StoreRun<O>, 'id'>): Promise<StoreRun<O>> {
    await this.ready();
    const record: StoreRun<O> = { id: randomUUID(), ...run };
    this.snapshot.runs.unshift(record);

    const forProject = this.snapshot.runs.filter((candidate) => candidate.projectId === run.projectId);
    if (forProject.length > MAX_RUNS_PER_PROJECT) {
      const stale = new Set(forProject.slice(MAX_RUNS_PER_PROJECT).map((item) => item.id));
      this.snapshot.runs = this.snapshot.runs.filter((candidate) => !stale.has(candidate.id));
    }
    if (this.snapshot.runs.length > MAX_RUNS) {
      this.snapshot.runs = this.snapshot.runs.slice(0, MAX_RUNS);
    }

    const project = this.snapshot.projects.find((candidate) => candidate.id === run.projectId);
    if (project) project.updatedAt = new Date().toISOString();

    await this.persist();
    return record;
  }
}
