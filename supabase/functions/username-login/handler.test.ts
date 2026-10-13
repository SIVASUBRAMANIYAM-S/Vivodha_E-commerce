import assert from 'node:assert/strict';
import test from 'node:test';

import { createUsernameLoginHandler } from './handler.ts';

const userId = '55555555-5555-5555-5555-555555555555';
const credentials = {
  username: 'shopper',
  password: 'test-password',
  captchaToken: 'test-captcha',
};

function setup(
  options: {
    unknown?: boolean;
    wrongPassword?: boolean;
    limited?: boolean;
    limiterFailure?: boolean;
    captchaFailed?: boolean;
    devDisableCaptcha?: string;
    url?: string;
  } = {},
) {
  const calls: { url: string; body: unknown; key: string | null }[] = [];
  const mockFetch: typeof fetch = async (input, init) => {
    const url = String(input);
    const body: unknown = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body, key: new Headers(init?.headers).get('apikey') });
    const reply = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    if (url.includes('/rpc/consume_request_limit')) {
      if (options.limiterFailure) return reply({ message: 'database unavailable' }, 503);
      return reply(!options.limited);
    }
    if (url.includes('/rest/v1/usernames'))
      return reply(options.unknown ? [] : [{ user_id: userId }]);
    if (url.includes('/auth/v1/admin/users/')) {
      return reply({ id: userId, email: 'private@example.com' });
    }
    if (url.includes('/auth/v1/token')) {
      if (options.captchaFailed) {
        return reply({ error_code: 'captcha_failed', msg: 'captcha failed' }, 400);
      }
      if (options.unknown || options.wrongPassword) {
        return reply({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      }
      return reply({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: userId, email: 'private@example.com' },
      });
    }
    throw new Error(`Unexpected test request: ${url}`);
  };
  const handler = createUsernameLoginHandler({
    url: options.url ?? 'https://example.supabase.co',
    anonKey: 'test-anon',
    serviceRoleKey: 'test-service',
    fetch: mockFetch,
    devDisableCaptcha: options.devDisableCaptcha,
  });
  return { handler, calls };
}

function request(body: unknown = credentials) {
  return new Request('https://example.supabase.co/functions/v1/username-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.1' },
    body: JSON.stringify(body),
  });
}

test('successful login returns only session fields and forwards CAPTCHA through anon Auth', async () => {
  const { handler, calls } = setup();
  const response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = await response.json();
  assert.deepEqual(Object.keys(result), ['session']);
  assert.deepEqual(Object.keys(result.session).sort(), [
    'access_token',
    'expires_at',
    'refresh_token',
    'token_type',
  ]);
  assert.equal(JSON.stringify(result).includes('private@example.com'), false);
  const authCall = calls.find((call) => call.url.includes('/auth/v1/token'));
  assert.equal(authCall?.key, 'test-anon');
  assert.deepEqual(authCall?.body, {
    email: 'private@example.com',
    password: 'test-password',
    gotrue_meta_security: { captcha_token: 'test-captcha' },
  });
  for (const call of calls.filter((call) => call.url.includes('/rpc/'))) {
    assert.match(JSON.stringify(call.body), /"p_subject":"[0-9a-f]{64}"/);
    assert.equal(JSON.stringify(call.body).includes('192.0.2.1'), false);
    assert.equal(JSON.stringify(call.body).includes('shopper'), false);
  }
});

test('unknown username and wrong password return identical generic errors', async () => {
  const unknown = setup({ unknown: true });
  const wrong = setup({ wrongPassword: true });
  const first = await unknown.handler(request());
  const second = await wrong.handler(request());
  assert.equal(first.status, 401);
  assert.equal(second.status, 401);
  assert.deepEqual(await first.json(), await second.json());
  assert.equal(
    unknown.calls.some((call) => call.url.includes('/auth/v1/token')),
    true,
  );
});

test('rate limiting stops before identity lookup or sign-in', async () => {
  const { handler, calls } = setup({ limited: true });
  const response = await handler(request());
  assert.equal(response.status, 429);
  assert.equal((await response.json()).error.code, 'RATE_LIMITED');
  assert.equal(calls.length, 1);
});

test('limiter errors fail closed', async () => {
  const { handler, calls } = setup({ limiterFailure: true });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.equal(calls.length, 1);
});

test('CAPTCHA failure asks for a fresh challenge', async () => {
  const { handler } = setup({ captchaFailed: true });
  const response = await handler(request());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'CAPTCHA_FAILED');
});

test('invalid input does not call the backend', async () => {
  const { handler, calls } = setup();
  for (const body of [
    { ...credentials, username: 'bad!' },
    { ...credentials, captchaToken: '' },
  ]) {
    assert.equal((await handler(request(body))).status, 400);
  }
  assert.equal(calls.length, 0);
});

test('preflight succeeds and unsupported methods are rejected', async () => {
  const { handler, calls } = setup();
  const options = await handler(new Request('https://example.com', { method: 'OPTIONS' }));
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('access-control-allow-origin'), '*');
  assert.equal((await handler(new Request('https://example.com'))).status, 405);
  assert.equal(calls.length, 0);
});

test('malformed JSON is a validation error', async () => {
  const { handler, calls } = setup();
  const response = await handler(
    new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    }),
  );
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test('missing CAPTCHA fails before backend calls unless explicitly opted-in on DEV', async () => {
  const { captchaToken: _token, ...withoutCaptcha } = credentials;
  for (const options of [
    {},
    { url: 'https://nzltgmfodazrhrxufpwe.supabase.co' },
    { url: 'https://nzltgmfodazrhrxufpwe.supabase.co', devDisableCaptcha: 'false' },
    { devDisableCaptcha: 'true' },
    { url: 'https://production.supabase.co', devDisableCaptcha: 'true' },
  ]) {
    const { handler, calls } = setup(options);
    const response = await handler(request(withoutCaptcha));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'CAPTCHA_FAILED');
    assert.equal(calls.length, 0);
  }
});

test('opted-in DEV permits tokenless login while preserving rate limits and anon Auth', async () => {
  const options = {
    url: 'https://nzltgmfodazrhrxufpwe.supabase.co',
    devDisableCaptcha: 'true',
  };
  const { captchaToken: _token, ...withoutCaptcha } = credentials;
  const { handler, calls } = setup(options);
  assert.equal((await handler(request(withoutCaptcha))).status, 200);
  assert.equal(calls.filter((call) => call.url.includes('/rpc/consume_request_limit')).length, 2);
  const authCall = calls.find((call) => call.url.includes('/auth/v1/token'));
  assert.equal(authCall?.key, 'test-anon');
  assert.deepEqual(authCall?.body, {
    email: 'private@example.com',
    password: 'test-password',
    gotrue_meta_security: {},
  });
  const limited = setup({ ...options, limited: true });
  assert.equal((await limited.handler(request(withoutCaptcha))).status, 429);
  assert.equal(limited.calls.length, 1);
  const invalid = setup(options);
  assert.equal(
    (await invalid.handler(request({ ...withoutCaptcha, username: 'bad!' }))).status,
    400,
  );
  assert.equal(invalid.calls.length, 0);
  const unknown = setup({ ...options, unknown: true });
  const wrong = setup({ ...options, wrongPassword: true });
  const unknownResponse = await unknown.handler(request(withoutCaptcha));
  const wrongResponse = await wrong.handler(request(withoutCaptcha));
  assert.equal(unknownResponse.status, 401);
  assert.equal(wrongResponse.status, 401);
  assert.deepEqual(await unknownResponse.json(), await wrongResponse.json());
});
