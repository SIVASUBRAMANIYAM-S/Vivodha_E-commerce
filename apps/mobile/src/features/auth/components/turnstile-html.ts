export function turnstileHtml(siteKey: string, colors: { surface: string; textPrimary: string }) {
  if (!/^[A-Za-z0-9_-]+$/.test(siteKey))
    throw new Error('Invalid public Turnstile site-key format.');
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{margin:0;padding:12px;background:${colors.surface};color:${colors.textPrimary};font-family:system-ui}#challenge{display:flex;justify-content:center}</style>
</head><body><div id="challenge"></div><script>
function send(type,token){var message=JSON.stringify({type:type,token:token});if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(message);}else{window.parent.postMessage(message,'*');}}
function ready(){turnstile.render('#challenge',{sitekey:${JSON.stringify(siteKey)},theme:'light',size:'flexible',callback:function(token){send('success',token);},'expired-callback':function(){send('expired');},'error-callback':function(){send('error');},'timeout-callback':function(){send('error');}});}
</script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ready&render=explicit" async defer onerror="send('error')"></script></body></html>`;
}

export function parseChallengeMessage(value: unknown): {
  type: 'success' | 'error' | 'expired';
  token?: string;
} {
  if (typeof value !== 'string') throw new Error('Invalid verification response.');
  const message: unknown = JSON.parse(value);
  if (!message || typeof message !== 'object' || !('type' in message)) {
    throw new Error('Invalid verification response.');
  }
  if (message.type === 'error' || message.type === 'expired') return { type: message.type };
  if (
    message.type === 'success' &&
    'token' in message &&
    typeof message.token === 'string' &&
    message.token.length > 0 &&
    message.token.length <= 4096
  )
    return { type: 'success', token: message.token };
  throw new Error('Invalid verification response.');
}

export type ChallengeProps = {
  siteKey: string;
  origin: string;
  onMessage: (message: string) => void;
  onFailure: () => void;
};
