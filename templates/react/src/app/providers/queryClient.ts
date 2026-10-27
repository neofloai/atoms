import { QueryClient } from '@tanstack/react-query';

import { HttpError } from '@/shared/api/httpClient';

/** A 4xx will fail the same way again; only retry what might recover. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
    },
  });
}
