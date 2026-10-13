/**
 * Cloudflare Turnstile, loaded inside a WebView (src/components/auth/TurnstileGate.tsx).
 * Kept separate from the component so the HTML string is testable without
 * rendering a WebView, and so the site key is read in exactly one place.
 */

const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;

if (!siteKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_TURNSTILE_SITE_KEY. Paste your Turnstile site key into apps/mobile/.env ' +
      '(the public key — never the secret key, which stays in Supabase Auth settings only).',
  );
}

export const TURNSTILE_SITE_KEY = siteKey;

/** What the widget was shown for — Turnstile's optional analytics `action` attribute. */
export type TurnstileAction = 'guest' | 'signup' | 'login' | 'forgot-password';

/** Messages posted from the WebView back to React Native via postMessage. */
export type TurnstileMessage =
  { type: 'token'; value: string } | { type: 'error'; value: string } | { type: 'expired' };

/**
 * Self-contained HTML document embedding the Turnstile widget. The three
 * widget callbacks post a TurnstileMessage back to React Native.
 */
export function buildTurnstileHtml(action: TurnstileAction): string {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <style>
      html, body { margin: 0; padding: 0; background: transparent; }
      body { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    </style>
  </head>
  <body>
    <div
      class="cf-turnstile"
      data-sitekey="${TURNSTILE_SITE_KEY}"
      data-action="${action}"
      data-theme="light"
      data-callback="onToken"
      data-error-callback="onError"
      data-expired-callback="onExpire"
    ></div>
    <script>
      function post(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
      function onToken(token) { post({ type: 'token', value: token }); }
      function onError(code) { post({ type: 'error', value: String(code) }); }
      function onExpire() { post({ type: 'expired' }); }
    </script>
  </body>
</html>`;
}
