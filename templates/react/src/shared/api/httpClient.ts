import { env } from '@/shared/config/env';

/** A non-2xx response, carrying what the server said. */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal | undefined;
  headers?: Record<string, string>;
}

async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    body: options.body === undefined ? null : JSON.stringify(options.body),
    signal: options.signal ?? null,
  });

  const text = await response.text();
  const data: unknown = text === '' ? undefined : JSON.parse(text);

  if (!response.ok) {
    throw new HttpError(response.status, data, `${method} ${path} failed with ${response.status}`);
  }
  return data as T;
}

/**
 * The one way the app talks to its API.
 *
 * Features call this from their `api/` folder and nowhere else, so auth
 * headers, base URLs and error shapes change in one file.
 */
export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
