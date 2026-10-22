/**
 * API contract types for Chronos.
 * 
 * Every list endpoint returns `Paginated<T>`; every error returns `ApiError`.
 */

import type { Role } from './constants.js';

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'RATE_LIMITED'
  | 'INTEGRATION_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiFieldIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string[]>;
    issues?: ApiFieldIssue[];
    requestId: string;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface MembershipSummary {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  baseCurrency: string;
  timezone: string;
  role: Role;
  permissions: string[];
}

export interface AuthSessionResponse {
  user: SessionUser;
  memberships: MembershipSummary[];
  activeOrganizationId: string | null;
}