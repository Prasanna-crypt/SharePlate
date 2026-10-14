const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { request, getTokens } = require('./test_helper');

describe('Claims & Fulfillment Test Suite', () => {
  let donorToken = '';
  let receiverToken = '';
  let claimListingId = '';
  let claimId = '';

  before(async () => {
    const tokens = await getTokens();
    donorToken = tokens.donor.token;
    receiverToken = tokens.receiver.token;

    // Create a fresh listing to claim
    const listingRes = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        foodName: 'Claim Test Dal Khichdi',
        foodType: 'cooked',
        vegNonVeg: 'veg',
        quantity: '10 portions',
        preparedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        pickupAddress: 'Borivali West, Mumbai',
        location: { type: 'Point', coordinates: [72.8410, 19.2288] },
        safetyChecklist: { freshlyPrepared: true, storedHygienically: true, notPreviouslyServed: true },
      }),
    });
    assert.equal(listingRes.status, 201);
    claimListingId = listingRes.data._id;
  });

  it('1. Receiver claims an available listing successfully', async () => {
    const res = await request('/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: JSON.stringify({
        listingId: claimListingId,
        notes: 'Picking up at 4:00 PM with insulated vehicle',
      }),
    });

    assert.equal(res.status, 201, 'Should create claim');
    assert.equal(res.data.status, 'claimed');
    assert.equal(res.data.listing._id, claimListingId);
    claimId = res.data._id;

    // Verify listing status transitioned to 'claimed'
    const checkListing = await request(`/listings/${claimListingId}`);
    assert.equal(checkListing.data.status, 'claimed');
  });

  it('2. Donor cannot claim listings (role restriction)', async () => {
    const res = await request('/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({ listingId: claimListingId }),
    });

    assert.equal(res.status, 403, 'Donors must not be permitted to claim items');
  });

  it('3. Cannot claim an already claimed item', async () => {
    const res = await request('/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: JSON.stringify({ listingId: claimListingId }),
    });

    assert.equal(res.status, 400);
    assert.match(res.data.message, /no longer available/i);
  });

  it('4. Race condition prevention: concurrent claims resolve atomically', async () => {
    // Create new listing specifically for concurrency race
    const freshListing = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        foodName: 'Race Condition Check Thali',
        foodType: 'cooked',
        vegNonVeg: 'veg',
        quantity: '8 packs',
        preparedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        pickupAddress: 'Malad West',
        location: { type: 'Point', coordinates: [72.8361, 19.1860] },
      }),
    });
    const targetId = freshListing.data._id;

    // Dispatch 2 concurrent claim requests
    const [c1, c2] = await Promise.all([
      request('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: targetId, notes: 'Attempt 1' }),
      }),
      request('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: targetId, notes: 'Attempt 2' }),
      }),
    ]);

    const successes = [c1, c2].filter((r) => r.status === 201).length;
    const failures = [c1, c2].filter((r) => r.status === 400).length;

    assert.equal(successes, 1, 'Exactly one claim must succeed');
    assert.equal(failures, 1, 'Competing claim must be rejected');
  });

  it('5. Receiver retrieves personal claims via /api/claims/my', async () => {
    const res = await request('/claims/my', {
      headers: { Authorization: `Bearer ${receiverToken}` },
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const found = res.data.some((c) => c._id === claimId);
    assert.ok(found, 'Claim must appear in receiver list');
  });

  it('6. Mark claimed food as picked up (PUT /api/claims/:id/pickup)', async () => {
    const res = await request(`/claims/${claimId}/pickup`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${receiverToken}` },
    });

    assert.equal(res.status, 200);
    assert.match(res.data.message, /picked up/i);

    // Verify listing updated to 'pickedup'
    const listingCheck = await request(`/listings/${claimListingId}`);
    assert.equal(listingCheck.data.status, 'pickedup');
  });

  it('7. Mark food as completed delivery (PUT /api/claims/:id/complete)', async () => {
    const res = await request(`/claims/${claimId}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${receiverToken}` },
    });

    assert.equal(res.status, 200);
    assert.match(res.data.message, /completed/i);

    // Verify listing updated to 'completed'
    const listingCheck = await request(`/listings/${claimListingId}`);
    assert.equal(listingCheck.data.status, 'completed');
  });

  it('8. Cancel claim returns listing back to available status', async () => {
    // Create new listing and claim it
    const lRes = await request('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        foodName: 'Cancel Flow Test Meals',
        foodType: 'packaged',
        vegNonVeg: 'veg',
        quantity: '5 boxes',
        preparedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 3600000).toISOString(),
        pickupAddress: 'Dahisar East',
        location: { type: 'Point', coordinates: [72.8620, 19.2501] },
      }),
    });
    const tempListingId = lRes.data._id;

    const cRes = await request('/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receiverToken}` },
      body: JSON.stringify({ listingId: tempListingId }),
    });
    const tempClaimId = cRes.data._id;

    // Cancel claim
    const cancelRes = await request(`/claims/${tempClaimId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${receiverToken}` },
    });
    assert.equal(cancelRes.status, 200);

    // Verify listing reverted to available
    const checkListing = await request(`/listings/${tempListingId}`);
    assert.equal(checkListing.data.status, 'available');
  });
});
