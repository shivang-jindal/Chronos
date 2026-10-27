import type {
  ChangeBriefRun,
  LeagueEnvelope,
  SourceStatus,
  WorkspaceProject,
  WorkspaceSnapshot
} from '@chronos/shared';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      // Keep the status-based message when the body is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const workspaceApi = {
  snapshot: () => request<WorkspaceSnapshot>('/api/v1/workspace'),

  refreshSources: () => request<{ sources: SourceStatus[] }>('/api/v1/sources/refresh', { method: 'POST' }),

  createProject: (body: { name: string; config: WorkspaceProject['config'] }) =>
    request<WorkspaceProject>('/api/v1/projects', { method: 'POST', body: JSON.stringify(body) }),

  runProject: (id: string, note?: string) =>
    request<{ run: ChangeBriefRun; project: WorkspaceProject }>(`/api/v1/projects/${id}/runs`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),

  deleteProject: (id: string) => request<void>(`/api/v1/projects/${id}`, { method: 'DELETE' }),

  envelope: (id: string) => request<LeagueEnvelope>(`/api/v1/projects/${id}/envelope`),

  importEnvelope: (envelope: LeagueEnvelope) =>
    request<{ project: WorkspaceProject; matched: 'native' | 'hint' }>('/api/v1/league/import', {
      method: 'POST',
      body: JSON.stringify(envelope)
    })
};

export function exportUrl(projectId: string, format: 'csv' | 'json'): string {
  return `/api/v1/projects/${projectId}/export?format=${format}`;
}

export function briefUrl(projectId: string): string {
  return `/api/v1/projects/${projectId}/brief`;
}

export function downloadJson(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
