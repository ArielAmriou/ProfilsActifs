export class FavoriteProfileNotFoundError extends Error {
  constructor(profileId: string) {
    super(`No jobseeker profile found for identifier: ${profileId}`);
    this.name = "FavoriteProfileNotFoundError";
  }
}
