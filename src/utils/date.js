export const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateUTC(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

export function formatDateUTC(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function formatMonthDay(isoDate) {
  const ms = parseDateUTC(isoDate);
  if (ms === null) return isoDate;
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: '2-digit' });
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function dayDiff(startMs, endMs) {
  return Math.round((endMs - startMs) / DAY_MS);
}
