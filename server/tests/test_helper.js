const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}

async function getTokens() {
  const adminRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@surplusfood.in', password: 'admin123' }),
  });

  const donorRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'raj@demo.com', password: 'password123' }),
  });

  const receiverRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'roti@demo.com', password: 'password123' }),
  });

  return {
    admin: { token: adminRes.data?.token, user: adminRes.data?.user },
    donor: { token: donorRes.data?.token, user: donorRes.data?.user },
    receiver: { token: receiverRes.data?.token, user: receiverRes.data?.user },
  };
}

module.exports = {
  BASE_URL,
  request,
  getTokens,
};
