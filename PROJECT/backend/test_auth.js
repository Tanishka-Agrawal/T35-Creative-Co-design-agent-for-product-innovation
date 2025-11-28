async function testAuth() {
  try {
    // Use IPv4 loopback directly to avoid hostname resolving to IPv6 ::1
    const base = 'http://127.0.0.1:5000';
    const random = Math.floor(Math.random() * 10000);
    const email = `testuser${random}@example.com`;
    const registerRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'secret123' }),
    });
    console.log('Register status:', registerRes.status);
    const registerJson = await registerRes.json().catch(() => ({}));
    console.log('Register response:', registerJson);

    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'secret123' }),
    });
    console.log('Login status:', loginRes.status);
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie header:', cookies);

    const loginJson = await loginRes.json().catch(() => ({}));
    console.log('Login response:', loginJson);

    // Use cookie for /api/user/me
    const cookie = cookies ? cookies.split(';')[0] : null;
    const meRes = await fetch(`${base}/api/user/me`, {
      method: 'GET',
      headers: { Cookie: cookie },
    });
    console.log('Me status:', meRes.status);
    const meJson = await meRes.json().catch(() => ({}));
    console.log('Me response:', meJson);
  } catch (err) {
    console.error('Test failed', err);
  }
}

testAuth();

