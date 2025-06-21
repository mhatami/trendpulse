// src/utils/dateUtils.js
// This module provides utility functions for formatting dates in various ways.
import { DateTime } from 'luxon';

const timeZone = DateTime.local().zoneName || 'America/Toronto';

let last1wkLabel = null; // store the last printed label for 1wk

/**
 * Formats an ISO date string into a readable label based on the chart period.
 * Converts the input date (assumed UTC) into the user's local timezone before formatting.
 *
 * @param {string} isoString - The ISO date string to format.
 * @param {string} period - The chart period ('1d', '1wk', etc.) to determine formatting style.
 * @returns {string} - Formatted date/time string for display on the chart axis.
 */
export function formatDateLabel(isoString, period) {
  const zoned = DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timeZone);

  if (period === '1D') {
    // Show hour + minute in local time
    return zoned.toFormat('h:mm a'); // e.g., 2:30 PM
  }

  if (period === '5D') {
    // Include time if repeated date
    const label = zoned.toFormat('MMM d');
    const labelWithTime = zoned.toFormat('MMM d h a');

    if (label === last1wkLabel) {
      return labelWithTime; // show time for same-date entries
    } else {
      last1wkLabel = label;
      return label;
    }
  }

  return zoned.toFormat('MM/dd');
}


/**
 * Call this before each chart render to reset the label tracker.
 */
export function resetDateLabelTracker() {
  last1wkLabel = null;
}

/**
 * Prepares chart data by normalizing all Date fields.
 * Parses each date string in UTC and converts it to a consistent ISO string.
 * This ensures uniform date format and timezone awareness across data points.
 *
 * @param {Array} data - Array of data objects with a Date field (ISO string).
 * @returns {Array} - New array with Date fields normalized to ISO strings in UTC.
 */
export function preprocessChartDate(data) {
  return data.map(item => ({
    ...item,
    Date: DateTime.fromISO(item.Date, { zone: 'utc' }).toISO()
  }));
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
