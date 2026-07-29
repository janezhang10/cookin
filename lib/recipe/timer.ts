export function getTimerDurationSeconds(
  minutes: string,
  seconds: string,
): number {
  const parsedMinutes = Number(minutes);
  const parsedSeconds = Number(seconds);

  if (
    !Number.isFinite(parsedMinutes) ||
    !Number.isFinite(parsedSeconds) ||
    parsedMinutes < 0 ||
    parsedSeconds < 0
  ) {
    return 0;
  }

  return Math.floor(parsedMinutes) * 60 + Math.floor(parsedSeconds);
}

export function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const minuteAndSecond = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${minuteAndSecond}`
    : minuteAndSecond;
}
