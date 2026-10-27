/**
 * Resolve mock data the way a request would: later, and cancellable.
 *
 * The delay is what keeps loading states honest. A mock that answers
 * synchronously hides every skeleton and spinner until the real API
 * arrives and shows them for the first time in production.
 */
export function mockResponse<T>(data: T, signal?: AbortSignal, delayMs = 300): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(structuredClone(data)), delayMs);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
