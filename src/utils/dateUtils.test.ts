import { describe, it, expect } from 'vitest';
import { getLocalISODate, getDaysInMonth } from './dateUtils';

describe('dateUtils', () => {
  it('should return correct ISO date string YYYY-MM-DD', () => {
    const date = new Date('2026-05-20T12:00:00'); // 20th May 2026
    const iso = getLocalISODate(date);
    expect(iso).toBe('2026-05-20');
  });

  it('should return correct number of days in month (array length validation)', () => {
    // Feb 2024 (Leap year) -> 29 days
    const feb2024 = new Date('2024-02-01T12:00:00');
    const days2024 = getDaysInMonth(feb2024).filter(d => d !== null);
    expect(days2024.length).toBe(29);

    // Feb 2025 (Non-leap) -> 28 days
    const feb2025 = new Date('2025-02-01T12:00:00');
    const days2025 = getDaysInMonth(feb2025).filter(d => d !== null);
    expect(days2025.length).toBe(28);

    // Jan 2026 -> 31 days
    const jan2026 = new Date('2026-01-01T12:00:00');
    const daysJan = getDaysInMonth(jan2026).filter(d => d !== null);
    expect(daysJan.length).toBe(31);
  });
});
