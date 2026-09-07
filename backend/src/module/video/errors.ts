export class InvalidVideoIdError extends Error {
  constructor(id: string) {
    super(`Invalid video identifier: ${id}`);
    this.name = "InvalidVideoIdError";
  }
}

export class VideoNotFoundError extends Error {
  constructor(id: string) {
    super(`No video found for identifier: ${id}`);
    this.name = "VideoNotFoundError";
  }
}

export class VideoProviderUnavailableError extends Error {
  readonly providerName: string;

  constructor(providerName: string) {
    super(`Video provider "${providerName}" is unavailable`);
    this.name = "VideoProviderUnavailableError";
    this.providerName = providerName;
  }
}

export class UnknownVideoProviderError extends Error {
  constructor(providerName: string) {
    super(`Unknown video provider: ${providerName}`);
    this.name = "UnknownVideoProviderError";
  }
}
