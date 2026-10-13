import { useEffect, useRef } from 'react';

import type { ChallengeProps } from './turnstile-html';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme: 'light';
          size: 'flexible';
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
          'timeout-callback': () => void;
        },
      ) => string;
      remove: (widget: string) => void;
    };
  }
}

export function TurnstileChallenge({ siteKey, onMessage, onFailure }: ChallengeProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let widget: string | undefined;
    const render = () => {
      if (!active || !container.current || !window.turnstile || widget) return;
      widget = window.turnstile.render(container.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'flexible',
        callback: (token) => {
          if (active) onMessage(JSON.stringify({ type: 'success', token }));
        },
        'expired-callback': () => {
          if (active) onMessage('{"type":"expired"}');
        },
        'error-callback': () => {
          if (active) onFailure();
        },
        'timeout-callback': () => {
          if (active) onFailure();
        },
      });
    };
    let script = document.querySelector<HTMLScriptElement>('script[data-vivodha-turnstile]');
    const scriptFailed = () => {
      script?.remove();
      if (active) onFailure();
    };
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.dataset.vivodhaTurnstile = 'true';
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    script.addEventListener('error', scriptFailed);
    if (window.turnstile) render();
    return () => {
      active = false;
      script.removeEventListener('load', render);
      script.removeEventListener('error', scriptFailed);
      if (widget) window.turnstile?.remove(widget);
    };
  }, [siteKey, onMessage, onFailure]);
  return (
    <div
      ref={container}
      aria-label="Complete security verification"
      style={{ minHeight: 80, width: '100%' }}
    />
  );
}
