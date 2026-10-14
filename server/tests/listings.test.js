const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { request, getTokens } = require('./test_helper');

describe('Food Listings Test Suite', () => {
  let donorToken = '';
  let receiverToken = '';
  let createdListingId = '';

  before(async () => {
    const tokens = await getTokens();
    donorToken = tokens.donor.token;
    receiverToken = tokens.receiver.token;
  });

  it('1. Donor creates food listing successfully', async () => {
    const res = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        foodName: 'Test Paneer Pulao',
        description: 'Freshly prepared rice and paneer meal',
        foodType: 'cooked',
        vegNonVeg: 'veg',
        quantity: '15 boxes',
        preparedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(),
        pickupAddress: 'Thakur Complex, Kandivali East',
        location: { type: 'Point', coordinates: [72.8656, 19.2137] },
        safetyChecklist: {
          freshlyPrepared: true,
          storedHygienically: true,
          notPreviouslyServed: true,
        },
      }),
    });

    assert.equal(res.status, 201, 'Should return HTTP 201 Created');
    assert.equal(res.data.foodName, 'Test Paneer Pulao');
    assert.equal(res.data.status, 'available');
    assert.equal(res.data.vegNonVeg, 'veg');
    assert.ok(res.data._id);
    createdListingId = res.data._id;
  });

  it('2. Receiver cannot create listing (RBAC blocked)', async () => {
    const res = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: JSON.stringify({
        foodName: 'Receiver Unauthorized Item',
        foodType: 'cooked',
        vegNonVeg: 'veg',
        quantity: '5 meals',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        pickupAddress: 'Malad',
      }),
    });

    assert.equal(res.status, 403, 'Receivers must be blocked from creating listings');
  });

  it('3. Unauthenticated request to create listing is rejected', async () => {
    const res = await request('/listings', {
      method: 'POST',
      body: JSON.stringify({
        foodName: 'Unauth Item',
        foodType: 'cooked',
        vegNonVeg: 'veg',
        quantity: '5 meals',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }),
    });

    assert.equal(res.status, 401, 'Must reject missing token');
  });

  it('4. Validation rejects listing with missing required fields', async () => {
    const res = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        description: 'Missing foodName, quantity, and expiresAt',
      }),
    });

    assert.equal(res.status, 400, 'Must return 400 on missing required fields');
  });

  it('5. Fetch available listings with pagination / default list', async () => {
    const res = await request('/listings');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length > 0, 'Should return available food listings');
  });

  it('6. Filter listings by dietary preference (veg only)', async () => {
    const res = await request('/listings?vegNonVeg=veg');
    assert.equal(res.status, 200);
    for (const item of res.data) {
      assert.equal(item.vegNonVeg, 'veg', 'Every returned listing must be vegetarian');
    }
  });

  it('7. Filter listings by food type (e.g. cooked)', async () => {
    const res = await request('/listings?foodType=cooked');
    assert.equal(res.status, 200);
    for (const item of res.data) {
      assert.equal(item.foodType, 'cooked', 'Every returned listing must match requested food type');
    }
  });

  it('8. Fetch single listing by valid ObjectId', async () => {
    const res = await request(`/listings/${createdListingId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data._id, createdListingId);
    assert.equal(res.data.foodName, 'Test Paneer Pulao');
  });

  it('9. Reject malformed ObjectId with HTTP 400', async () => {
    const res = await request('/listings/not-a-valid-mongodb-id');
    assert.equal(res.status, 400);
    assert.match(res.data.message, /invalid id/i);
  });

  it('10. Return HTTP 404 for non-existent listing ID', async () => {
    const res = await request('/listings/507f1f77bcf86cd799439011');
    assert.equal(res.status, 404);
    assert.match(res.data.message, /not found/i);
  });

  it('11. Donor retrieves their own listings via /api/listings/my', async () => {
    const res = await request('/listings/my', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const found = res.data.some((l) => l._id === createdListingId);
    assert.ok(found, 'Created listing must appear in donor listings');
  });

  it('12. Nearby search finds listings within coordinate radius', async () => {
    const res = await request('/listings/nearby?lat=19.2137&lng=72.8656&radius=15');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  it('13. Nearby search rejects out-of-range coordinates with 400', async () => {
    const res = await request('/listings/nearby?lat=999&lng=999');
    assert.equal(res.status, 400);
    assert.match(res.data.message, /latitude/i);
  });

  it('14. Nearby search rejects non-numeric lat/lng with 400', async () => {
    const res = await request('/listings/nearby?lat=abc&lng=def');
    assert.equal(res.status, 400);
    assert.match(res.data.message, /valid numbers/i);
  });

  it('15. Donor cancels their own listing', async () => {
    const res = await request(`/listings/${createdListingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.equal(res.status, 200);
    assert.match(res.data.message, /cancelled/i);

    // Verify status updated to cancelled
    const check = await request(`/listings/${createdListingId}`);
    assert.equal(check.data.status, 'cancelled');
  });

  it('16. Unauthorized user cannot cancel another user\'s listing', async () => {
    // Receiver tries to cancel donor's listing
    const res = await request(`/listings/${createdListingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${receiverToken}` },
    });
    assert.equal(res.status, 403);
  });
});
