export interface ByteRange {
  start: number;
  end: number;
}

const RANGE_PATTERN = /^bytes=(\d*)-(\d*)$/;

export function parseByteRange(header: string | undefined, size: number): ByteRange | null {
  if (!header || size <= 0) {
    return null;
  }

  const match = RANGE_PATTERN.exec(header.trim());

  if (!match) {
    return null;
  }

  const [, rawStart, rawEnd] = match;

  if (!rawStart && !rawEnd) {
    return null;
  }

  const start = rawStart ? Number(rawStart) : Math.max(0, size - Number(rawEnd));
  const end = rawStart && rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return null;
  }

  return { start, end };
}
