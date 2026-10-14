const http = require('http');

const BASE = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }
  return { status: res.status, data };
}

async function runAudit() {
  console.log('====================================================');
  console.log('   SHAREPLATE PLATFORM COMPREHENSIVE CRASH AUDIT   ');
  console.log('====================================================\n');

  const findings = [];

  // Helper to record findings
  const record = (category, testName, passed, details, isCrashOrVulnerability = false) => {
    const symbol = passed ? '✅' : (isCrashOrVulnerability ? '❌ [CRASH/BUG]' : '⚠️ [WARNING]');
    console.log(`${symbol} [${category}] ${testName} -> ${details}`);
    if (!passed) {
      findings.push({ category, testName, details, isCrashOrVulnerability });
    }
  };

  // 1. Health check
  try {
    const h = await req('/health');
    record('HEALTH', 'GET /api/health', h.status === 200, `Status: ${h.status}`);
  } catch (err) {
    record('HEALTH', 'GET /api/health', false, `Connection refused: ${err.message}`, true);
  }

  // 2. Auth edge cases
  let donorToken = '', receiverToken = '', adminToken = '';
  try {
    // Normal logins
    const adminLog = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@surplusfood.in', password: 'admin123' }),
    });
    adminToken = adminLog.data.token;
    record('AUTH', 'Admin Login', adminLog.status === 200, `Status: ${adminLog.status}`);

    const donorLog = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'raj@demo.com', password: 'password123' }),
    });
    donorToken = donorLog.data.token;
    record('AUTH', 'Donor Login', donorLog.status === 200, `Status: ${donorLog.status}`);

    const recLog = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'roti@demo.com', password: 'password123' }),
    });
    receiverToken = recLog.data.token;
    record('AUTH', 'Receiver Login', recLog.status === 200, `Status: ${recLog.status}`);

    // Edge case: Malformed / expired token
    const badToken = await req('/auth/me', {
      headers: { Authorization: 'Bearer this-is-not-a-valid-jwt-token' },
    });
    record('AUTH', 'Invalid JWT handling', badToken.status === 401, `Status: ${badToken.status} (msg: ${badToken.data?.message})`);

    // Edge case: SQL/NoSQL Injection in login
    const nosqlLog = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: { '$gt': '' }, password: { '$gt': '' } }),
    });
    record('AUTH', 'NoSQL injection in login', nosqlLog.status === 400, `Status: ${nosqlLog.status} (msg: ${nosqlLog.data?.message})`);

    // Edge case: Empty fields
    const emptyLog = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' }),
    });
    record('AUTH', 'Empty email/password in login', emptyLog.status === 400, `Status: ${emptyLog.status}`);
  } catch (err) {
    record('AUTH', 'Auth suite crash', false, err.message, true);
  }

  // 3. Listings endpoints & edge cases
  let sampleListingId = null;
  try {
    const listRes = await req('/listings');
    record('LISTINGS', 'GET /api/listings', listRes.status === 200, `Returned ${listRes.data?.length || 0} listings`);
    if (listRes.data && listRes.data.length > 0) {
      sampleListingId = listRes.data[0]._id;
    }

    // Edge case: Invalid ObjectId format in GET /listings/:id
    const badIdRes = await req('/listings/not-a-valid-mongodb-id');
    record('LISTINGS', 'GET /listings/:invalid-id', badIdRes.status === 400, `Status: ${badIdRes.status} (msg: ${badIdRes.data?.message})`);

    // Edge case: Non-existent 24-char ObjectId
    const notFoundId = await req('/listings/507f1f77bcf86cd799439011');
    record('LISTINGS', 'GET /listings/:non-existent-id', notFoundId.status === 404, `Status: ${notFoundId.status} (msg: ${notFoundId.data?.message})`);

    // Edge case: Nearby with non-numeric lat/lng
    const nearbyNan = await req('/listings/nearby?lat=abc&lng=def');
    record('LISTINGS', 'GET /listings/nearby with NaN lat/lng', nearbyNan.status === 400, `Status: ${nearbyNan.status} (msg: ${nearbyNan.data?.message})`, nearbyNan.status === 500);

    // Edge case: Nearby with out-of-range coordinates
    const nearbyOutOfRange = await req('/listings/nearby?lat=999&lng=999');
    record('LISTINGS', 'GET /listings/nearby with out-of-range lat/lng', nearbyOutOfRange.status === 400, `Status: ${nearbyOutOfRange.status} (msg: ${nearbyOutOfRange.data?.message})`, nearbyOutOfRange.status === 500);

    // Edge case: Nearby missing lat or lng
    const nearbyMissing = await req('/listings/nearby?lat=19.2');
    record('LISTINGS', 'GET /listings/nearby missing lng', nearbyMissing.status === 400, `Status: ${nearbyMissing.status}`);
  } catch (err) {
    record('LISTINGS', 'Listings suite crash', false, err.message, true);
  }

  // 4. Feedback edge case (Empty string listing ID)
  try {
    const feedbackEmptyListing = await req('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Audit User',
        email: 'audit@demo.com',
        type: 'feedback',
        listing: '', // This was causing CastError 400
        message: 'Testing audit feedback',
      }),
    });
    record(
      'FEEDBACK',
      'POST /api/feedback with listing: ""',
      feedbackEmptyListing.status === 201,
      `Status: ${feedbackEmptyListing.status} (msg: ${feedbackEmptyListing.data?.message})`,
      feedbackEmptyListing.status === 400 || feedbackEmptyListing.status === 500
    );
  } catch (err) {
    record('FEEDBACK', 'Feedback suite crash', false, err.message, true);
  }

  // 5. Claims & Concurrency / Race Condition Test
  try {
    // Create a fresh test listing as donor
    const createListing = await req('/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${donorToken}` },
      body: JSON.stringify({
        foodName: 'Concurrency Test Biryani',
        foodType: 'cooked',
        vegNonVeg: 'nonveg',
        quantity: '10 servings',
        preparedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        pickupAddress: 'Thakur Village, Mumbai',
        location: { type: 'Point', coordinates: [72.8656, 19.2137] },
      }),
    });

    const testListingId = createListing.data?._id;
    record('CLAIMS', 'Create listing for claim tests', createListing.status === 201, `Listing ID: ${testListingId}`);

    if (testListingId) {
      // Simulate concurrent claims on the same listing
      const claim1Promise = req('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: testListingId, notes: 'Claim 1' }),
      });

      const claim2Promise = req('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: testListingId, notes: 'Claim 2' }),
      });

      const [res1, res2] = await Promise.all([claim1Promise, claim2Promise]);
      const successfulClaims = [res1, res2].filter((r) => r.status === 201).length;
      record(
        'CLAIMS',
        'Atomic single-claim protection (Race condition check)',
        successfulClaims === 1,
        `Successful claims: ${successfulClaims} of 2 concurrent attempts (res1: ${res1.status}, res2: ${res2.status})`,
        successfulClaims > 1
      );

      // Now test claiming an already claimed listing
      const claimAgain = await req('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: testListingId }),
      });
      record(
        'CLAIMS',
        'Reject claim on already claimed item',
        claimAgain.status === 400,
        `Status: ${claimAgain.status} (msg: ${claimAgain.data?.message})`
      );

      // Edge case: Claim with non-existent listingId
      const claimFake = await req('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: '507f1f77bcf86cd799439011' }),
      });
      record(
        'CLAIMS',
        'Reject claim on non-existent listing',
        claimFake.status === 404 || claimFake.status === 400,
        `Status: ${claimFake.status} (msg: ${claimFake.data?.message})`
      );

      // Edge case: Claim with malformed listingId
      const claimMalformed = await req('/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${receiverToken}` },
        body: JSON.stringify({ listingId: 'not-an-id' }),
      });
      record(
        'CLAIMS',
        'Reject claim with malformed listingId',
        claimMalformed.status === 400,
        `Status: ${claimMalformed.status} (msg: ${claimMalformed.data?.message})`
      );
    }
  } catch (err) {
    record('CLAIMS', 'Claims suite crash', false, err.message, true);
  }

  // 6. Admin deletion safety
  try {
    // Admin attempting to delete own account
    const adminMe = await req('/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminSelfDelete = await req(`/admin/users/${adminMe.data._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'Prevent admin from deleting own account',
      adminSelfDelete.status === 400,
      `Status: ${adminSelfDelete.status} (msg: ${adminSelfDelete.data?.message})`,
      adminSelfDelete.status === 200
    );

    // Delete non-existent user
    const deleteNonExistent = await req('/admin/users/507f1f77bcf86cd799439011', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record(
      'ADMIN',
      'Handle delete on non-existent user',
      deleteNonExistent.status === 404,
      `Status: ${deleteNonExistent.status}`
    );
  } catch (err) {
    record('ADMIN', 'Admin suite crash', false, err.message, true);
  }

  // 7. Stats endpoints
  try {
    const impact = await req('/stats/impact');
    record('STATS', 'GET /api/stats/impact', impact.status === 200 && typeof impact.data?.mealsRedistributed === 'number', `Stats: ${JSON.stringify(impact.data)}`);

    const adminStats = await req('/stats/admin', { headers: { Authorization: `Bearer ${adminToken}` } });
    record('STATS', 'GET /api/stats/admin', adminStats.status === 200 && typeof adminStats.data?.totalUsers === 'number', `Total users: ${adminStats.data?.totalUsers}`);
  } catch (err) {
    record('STATS', 'Stats suite crash', false, err.message, true);
  }

  console.log('\n====================================================');
  console.log(`AUDIT FINISHED. Total Issues/Warnings Found: ${findings.length}`);
  console.log('====================================================\n');
  return findings;
}

runAudit();
