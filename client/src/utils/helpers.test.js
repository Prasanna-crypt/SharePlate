import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, timeUntil, foodTypeLabel, statusColor } from './helpers.js';

describe('Frontend Helpers Test Suite', () => {
  it('1. formatDate formats valid date correctly', () => {
    const d = new Date('2026-10-14T10:30:00Z');
    const result = formatDate(d);
    assert.notEqual(result, 'N/A');
    assert.match(result, /Oct|14|2026/);
  });

  it('2. formatDate returns N/A for null, undefined, or invalid inputs', () => {
    assert.equal(formatDate(null), 'N/A');
    assert.equal(formatDate(undefined), 'N/A');
    assert.equal(formatDate('invalid-date-string'), 'N/A');
    assert.equal(formatDate(''), 'N/A');
  });

  it('3. timeUntil returns remaining hours and minutes for future dates', () => {
    const future = new Date(Date.now() + 2 * 3600000 + 15 * 60000);
    const result = timeUntil(future);
    assert.match(result, /2h 1[4-6]m left/);
  });

  it('4. timeUntil returns minutes left when under 1 hour', () => {
    const future = new Date(Date.now() + 45 * 60000);
    const result = timeUntil(future);
    assert.match(result, /4[4-5]m left/);
  });

  it('5. timeUntil returns Expired for past dates', () => {
    const past = new Date(Date.now() - 3600000);
    assert.equal(timeUntil(past), 'Expired');
  });

  it('6. timeUntil returns N/A for null, undefined, or invalid dates', () => {
    assert.equal(timeUntil(null), 'N/A');
    assert.equal(timeUntil(undefined), 'N/A');
    assert.equal(timeUntil('not-a-date'), 'N/A');
  });

  it('7. foodTypeLabel translates types to readable English labels', () => {
    assert.equal(foodTypeLabel('cooked'), 'Cooked Meal');
    assert.equal(foodTypeLabel('packaged'), 'Packaged');
    assert.equal(foodTypeLabel('raw'), 'Raw / Groceries');
    assert.equal(foodTypeLabel('bakery'), 'Bakery');
    assert.equal(foodTypeLabel('other'), 'Other');
  });

  it('8. foodTypeLabel falls back gracefully to raw string for unknown type', () => {
    assert.equal(foodTypeLabel('beverages'), 'beverages');
  });

  it('9. statusColor maps each listing/claim status to appropriate theme hex color', () => {
    assert.equal(statusColor('available'), '#2D6A4F');
    assert.equal(statusColor('claimed'), '#E76F51');
    assert.equal(statusColor('pickedup'), '#E9C46A');
    assert.equal(statusColor('completed'), '#264653');
    assert.equal(statusColor('expired'), '#6B7280');
    assert.equal(statusColor('cancelled'), '#9B2226');
  });

  it('10. statusColor falls back to neutral gray for unknown status', () => {
    assert.equal(statusColor('unknown_status'), '#6B7280');
  });
});
