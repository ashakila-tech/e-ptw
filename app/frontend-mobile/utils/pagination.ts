import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

/**
 * Fetches all pages of a paginated endpoint until there are no more results.
 * Handles both paginated responses ({ results, next }) and plain array responses.
 */
export async function fetchPaginatedData<T = any>(
  endpoint: string
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = `${API_BASE_URL}${endpoint}?page=1&page_size=100`;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl);
    if (!res.ok) break;

    // Explicitly type 'data' as unknown to force later narrowing
    const data: unknown = await res.json();

    if (Array.isArray(data)) {
      results.push(...(data as T[]));
      break;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      Array.isArray((data as any).results)
    ) {
      const paginated = data as { results: T[]; next?: string | null };
      results.push(...paginated.results);

      nextUrl = paginated.next
        ? paginated.next.startsWith("http")
          ? paginated.next
          : `${API_BASE_URL}${paginated.next}`
        : null;
    } else {
      break;
    }
  }

  return results;
}