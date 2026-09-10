import { apiFetch } from "@/lib/api";

export interface FavoriteItem {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  image: string | null;
  role: string;
  available: boolean;
}

export async function addFavorite(profileId: string): Promise<void> {
  await apiFetch(`/api/favorites/${profileId}`, { method: "POST" });
}

export async function removeFavorite(profileId: string): Promise<void> {
  await apiFetch(`/api/favorites/${profileId}`, { method: "DELETE" });
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  try {
    const data = await apiFetch<{ items: FavoriteItem[] }>("/api/favorites");
    return data.items.map((item) => ({
      ...item,
      available: item.available ?? true,
    }));
  } catch {
    return [];
  }
}

export async function fetchFavoriteUserIds(): Promise<string[]> {
  return (await fetchFavorites()).map((item) => item.id);
}
