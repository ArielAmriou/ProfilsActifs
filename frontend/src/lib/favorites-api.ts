import { apiFetch } from "@/lib/api";

export async function addFavorite(profileId: string): Promise<void> {
  await apiFetch(`/api/favorites/${profileId}`, { method: "POST" });
}

export async function removeFavorite(profileId: string): Promise<void> {
  await apiFetch(`/api/favorites/${profileId}`, { method: "DELETE" });
}

export async function fetchFavoriteUserIds(): Promise<string[]> {
  try {
    const data = await apiFetch<{ items: { id: string }[] }>("/api/favorites");
    return data.items.map((item) => item.id);
  } catch {
    return [];
  }
}
