const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { request, getTokens } = require('./test_helper');

describe('Auth Test Suite', () => {
  const timestamp = Date.now();
  const testDonorEmail = `testdonor_${timestamp}@example.com`;
  let testUserToken = '';

  it('1. Register a new donor user successfully', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Auto Test Donor',
        email: testDonorEmail,
        password: 'password123',
        phone: '9876543299',
        role: 'donor',
        address: 'Kandivali East, Mumbai',
      }),
    });

    assert.equal(res.status, 201, 'Should return HTTP 201 Created');
    assert.ok(res.data.token, 'Should return JWT token');
    assert.equal(res.data.user.email, testDonorEmail);
    assert.equal(res.data.user.role, 'donor');
    assert.equal(res.data.user.password, undefined, 'Password hash must never be returned');
    testUserToken = res.data.token;
  });

  it('2. Reject registration with duplicate email', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Donor',
        email: testDonorEmail,
        password: 'password123',
        phone: '9876543299',
        role: 'donor',
      }),
    });

    assert.equal(res.status, 400, 'Should return HTTP 400 Bad Request');
    assert.match(res.data.message, /already registered/i);
  });

  it('3. Reject registration with password shorter than 6 characters', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short Pass User',
        email: `shortpass_${timestamp}@example.com`,
        password: '123',
        phone: '9876543299',
        role: 'donor',
      }),
    });

    assert.equal(res.status, 400, 'Should reject password under 6 chars');
  });

  it('4. Reject registration with invalid email format', async () => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'not-an-email',
        password: 'password123',
        phone: '9876543299',
        role: 'donor',
      }),
    });

    assert.equal(res.status, 400, 'Should reject invalid email');
  });

  it('5. Login with correct credentials returns valid JWT', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testDonorEmail,
        password: 'password123',
      }),
    });

    assert.equal(res.status, 200, 'Should login successfully');
    assert.ok(res.data.token, 'Should contain JWT token');
    assert.equal(res.data.user.name, 'Auto Test Donor');
  });

  it('6. Login with incorrect password returns 400 Bad Request', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testDonorEmail,
        password: 'wrongpassword',
      }),
    });

    assert.equal(res.status, 400, 'Should reject wrong password');
    assert.match(res.data.message, /invalid/i);
  });

  it('7. Access profile /api/auth/me with valid Bearer token', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.email, testDonorEmail);
    assert.equal(res.data.role, 'donor');
  });

  it('8. Reject /api/auth/me when Authorization header is missing', async () => {
    const res = await request('/auth/me');
    assert.equal(res.status, 401, 'Should reject missing token');
  });

  it('9. Reject /api/auth/me with forged or invalid token', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: 'Bearer forged.token.signature' },
    });
    assert.equal(res.status, 401, 'Should reject forged token');
  });

  it('10. Update profile information via PUT /api/auth/me', async () => {
    const res = await request('/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: JSON.stringify({
        name: 'Auto Test Donor Updated',
        phone: '9123456780',
        address: 'Borivali West, Mumbai',
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.name, 'Auto Test Donor Updated');
    assert.equal(res.data.phone, '9123456780');
    assert.equal(res.data.address, 'Borivali West, Mumbai');
  });
});
