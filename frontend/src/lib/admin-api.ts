import { apiFetch } from "@/lib/api";
import type { VideoDescriptor } from "@/lib/videos";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AdminVideoRecord {
  id: string;
  userId: string;
  userName: string;
  video: VideoDescriptor;
  createdAt: string;
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const data = await apiFetch<{ users: AdminUser[] }>("/api/admin/users");
  return data.users;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
}

export async function fetchPendingVideos(): Promise<AdminVideoRecord[]> {
  const data = await apiFetch<{ videos: AdminVideoRecord[] }>("/api/admin/videos/pending");
  return data.videos;
}

export async function validateVideo(videoId: string): Promise<void> {
  await apiFetch(`/api/admin/videos/${videoId}/validate`, { method: "POST" });
}

export async function rejectVideo(videoId: string): Promise<void> {
  await apiFetch(`/api/admin/videos/${videoId}/reject`, { method: "POST" });
}