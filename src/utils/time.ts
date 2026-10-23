/**
 * Calculates a human-readable relative time string from an ISO date, timestamp,
 * SQLite timestamp ("YYYY-MM-DD HH:MM:SS"), or fallback entity ID.
 * e.g. "Just now", "5m ago", "2h ago", "3d ago", "2w ago", "1mo ago", "1y ago".
 */
export function formatTimeAgo(
  dateInput?: string | number | Date | null,
  fallbackId?: string
): string {
  let timestamp: number | null = null;

  if (typeof dateInput === 'number') {
    timestamp = dateInput;
  } else if (dateInput instanceof Date) {
    timestamp = dateInput.getTime();
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // 1. Check if it's already a relative string with ago like "15m ago"
    if (trimmed.endsWith('ago')) {
      return trimmed;
    }

    // 2. If it is "Just now" and fallbackId has an embedded timestamp, use the fallbackId
    if (trimmed === 'Just now' && fallbackId) {
      const parsedIdTime = parseTimestampFromId(fallbackId);
      if (parsedIdTime) {
        timestamp = parsedIdTime;
      } else {
        return 'Just now';
      }
    } else if (trimmed === 'Just now') {
      return 'Just now';
    } else {
      // 3. Normalize SQLite datetime ("2026-10-23 12:00:00" -> "2026-10-23T12:00:00Z") for Hermes/JSC
      let isoStr = trimmed;
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
        isoStr = trimmed.replace(' ', 'T') + 'Z';
      }

      const parsedDate = new Date(isoStr);
      const parsedTime = parsedDate.getTime();
      if (!isNaN(parsedTime)) {
        timestamp = parsedTime;
      }
    }
  }

  // If still null, try extracting timestamp from fallbackId (e.g. post-1729683921000)
  if (!timestamp && fallbackId) {
    timestamp = parseTimestampFromId(fallbackId);
  }

  if (!timestamp || isNaN(timestamp)) {
    return 'Just now';
  }

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

/**
 * Extracts a numeric millisecond timestamp from standard entity IDs like
 * "post-1729683921000" or "c-1729683921000" or "gen-1729683921000".
 */
export function parseTimestampFromId(id?: string | null): number | null {
  if (!id) return null;
  const match = id.match(/^(?:post|c|gen|notif)-(\d{10,13})$/);
  if (match) {
    const val = parseInt(match[1], 10);
    return val < 10000000000 ? val * 1000 : val;
  }
  return null;
}
