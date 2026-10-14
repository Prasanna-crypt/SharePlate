const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const { request, getTokens } = require('./test_helper');

describe('Feedback, Notifications & Admin Test Suite', () => {
  let adminToken = '';
  let donorToken = '';
  let receiverToken = '';
  let tempUserIdToDelete = '';

  before(async () => {
    const tokens = await getTokens();
    adminToken = tokens.admin.token;
    donorToken = tokens.donor.token;
    receiverToken = tokens.receiver.token;

    // Create a temporary user to test admin deletion
    const tempUser = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Delete Me User',
        email: `del_${Date.now()}@example.com`,
        password: 'password123',
        phone: '9000000000',
        role: 'donor',
      }),
    });
    tempUserIdToDelete = tempUser.data.user._id;
  });

  it('1. Submit feedback associated with a food listing', async () => {
    const res = await request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Community Reviewer',
        email: 'reviewer@example.com',
        type: 'feedback',
        message: 'The food redistribution process was seamless and on time.',
      }),
    });

    assert.equal(res.status, 201);
    assert.match(res.data.message, /thank you/i);
  });

  it('2. Submit general feedback with empty string listing (cast safety)', async () => {
    const res = await request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        name: 'General User',
        email: 'user@example.com',
        type: 'feedback',
        listing: '',
        message: 'Could you add volunteer delivery time slots?',
      }),
    });

    assert.equal(res.status, 201, 'Should handle empty string listing gracefully');
  });

  it('3. Reject feedback when required message is missing', async () => {
    const res = await request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User',
        email: 'user@example.com',
        message: '',
      }),
    });

    assert.equal(res.status, 400);
  });

  it('4. User retrieves their notifications (/api/notifications)', async () => {
    const res = await request('/notifications', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
  });

  it('5. User marks all notifications as read (/api/notifications/read-all)', async () => {
    const res = await request('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${donorToken}` },
    });

    assert.equal(res.status, 200);
    assert.match(res.data.message, /marked as read/i);
  });

  it('6. Admin views platform statistics (/api/stats/admin)', async () => {
    const res = await request('/stats/admin', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    assert.equal(typeof res.data.totalUsers, 'number');
    assert.equal(typeof res.data.totalListings, 'number');
    assert.equal(typeof res.data.totalDonors, 'number');
  });

  it('7. Non-admin is blocked from admin statistics (HTTP 403 Forbidden)', async () => {
    const res = await request('/stats/admin', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });

    assert.equal(res.status, 403);
  });

  it('8. Admin views all registered users (/api/admin/users)', async () => {
    const res = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length >= 3);
  });

  it('9. Admin cannot delete their own account (Self-deletion guard)', async () => {
    const me = await request('/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminId = me.data._id;

    const res = await request(`/admin/users/${adminId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 400);
    assert.match(res.data.message, /cannot delete your own admin account/i);
  });

  it('10. Admin can delete a registered user account', async () => {
    const res = await request(`/admin/users/${tempUserIdToDelete}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    assert.match(res.data.message, /removed/i);
  });

  it('11. Public impact metrics endpoint (/api/stats/impact)', async () => {
    const res = await request('/stats/impact');
    assert.equal(res.status, 200);
    assert.equal(typeof res.data.mealsRedistributed, 'number');
    assert.equal(typeof res.data.activeDonors, 'number');
    assert.equal(typeof res.data.ngosRegistered, 'number');
  });

  it('12. Health check endpoint returns status 200 and ISO timestamp', async () => {
    const res = await request('/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'ok');
    assert.ok(res.data.timestamp);
  });
});
