export class FavoriteVideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`No video found for identifier: ${videoId}`);
    this.name = "FavoriteVideoNotFoundError";
  }
}
