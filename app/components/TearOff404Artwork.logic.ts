export const TEAR_START_PROGRESS = 0.08;
export const TEAR_COMPLETION_THRESHOLD = 0.58;

type TearProgressInput = {
  startProgress: number;
  startClientX: number;
  currentClientX: number;
  artworkWidth: number;
};

export function clampTearProgress(progress: number): number {
  return Math.max(0, Math.min(1, progress));
}

export function getTearProgress({
  startProgress,
  startClientX,
  currentClientX,
  artworkWidth,
}: TearProgressInput): number {
  if (artworkWidth <= 0) {
    return clampTearProgress(startProgress);
  }

  return clampTearProgress(startProgress + (currentClientX - startClientX) / artworkWidth);
}

export function shouldCompleteTear(progress: number): boolean {
  return progress >= TEAR_COMPLETION_THRESHOLD;
}
