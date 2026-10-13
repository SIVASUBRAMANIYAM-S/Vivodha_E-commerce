import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { ErrorState, OfflineBanner, useIsOffline } from '@/components/ui/States';
import { Skeleton } from '@/components/ui/Skeleton';
import { radius, spacing } from '@/theme';

import { buildTurnstileHtml, type TurnstileAction, type TurnstileMessage } from '@/lib/turnstile';

const WIDGET_HEIGHT = 80;

type Resolver = { resolve: (token: string) => void; reject: (error: Error) => void };

type TurnstileApi = {
  /** Opens the sheet, shows the widget, resolves with the token once solved. */
  present: (action: TurnstileAction) => Promise<string>;
};

const TurnstileContext = createContext<TurnstileApi | null>(null);

/**
 * Mounted once at the app root. Call sites `await useTurnstile().present('login')`
 * to get a token back — the sheet opens, the widget loads, and the promise
 * resolves on a solved token or rejects on cancel/error/expiry.
 */
export function TurnstileProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<SheetRef>(null);
  const resolverRef = useRef<Resolver | null>(null);
  const [action, setAction] = useState<TurnstileAction | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const offline = useIsOffline();

  const settle = useCallback((fn: (r: Resolver) => void) => {
    const resolver = resolverRef.current;
    if (!resolver) return;
    resolverRef.current = null;
    fn(resolver);
    sheetRef.current?.dismiss();
  }, []);

  const present = useCallback((nextAction: TurnstileAction) => {
    return new Promise<string>((resolve, reject) => {
      resolverRef.current = { resolve, reject };
      setLoadFailed(false);
      setAction(nextAction);
      requestAnimationFrame(() => sheetRef.current?.present());
    });
  }, []);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: TurnstileMessage;
      try {
        message = JSON.parse(event.nativeEvent.data) as TurnstileMessage;
      } catch {
        return;
      }
      if (message.type === 'token') {
        settle((r) => r.resolve(message.value));
      } else if (message.type === 'error') {
        settle((r) => r.reject(new Error(`CAPTCHA_FAILED:${message.value}`)));
      } else {
        settle((r) => r.reject(new Error('CAPTCHA_EXPIRED')));
      }
    },
    [settle],
  );

  const onDismiss = useCallback(() => {
    // Sheet dismissed without a token (e.g. swiped away) — reject so the
    // caller's await doesn't hang forever.
    settle((r) => r.reject(new Error('CAPTCHA_CANCELLED')));
    setAction(null);
  }, [settle]);

  const api = useMemo(() => ({ present }), [present]);

  return (
    <TurnstileContext.Provider value={api}>
      {children}
      <Sheet ref={sheetRef} title="Quick check" onDismiss={onDismiss}>
        <View style={styles.body}>
          {offline ? (
            <OfflineBanner forceVisible />
          ) : loadFailed ? (
            <ErrorState
              title="Couldn't load the check"
              message="Check your connection and try again."
              onRetry={() => setLoadFailed(false)}
            />
          ) : (
            <View style={styles.widgetWrap}>
              <Skeleton
                width="100%"
                height={WIDGET_HEIGHT}
                radius={radius.card}
                style={StyleSheet.absoluteFill}
              />
              {action ? (
                <WebView
                  // baseUrl gives the WebView a real origin (matching the
                  // "localhost" hostname registered on the Turnstile
                  // widget) instead of the opaque/null origin WKWebView
                  // otherwise uses for an inline HTML string, which
                  // Cloudflare was rejecting as a hostname mismatch.
                  source={{ html: buildTurnstileHtml(action), baseUrl: 'https://localhost' }}
                  onMessage={onMessage}
                  onError={() => setLoadFailed(true)}
                  onHttpError={() => setLoadFailed(true)}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={['*']}
                  style={styles.webview}
                  containerStyle={styles.webview}
                />
              ) : null}
            </View>
          )}
        </View>
      </Sheet>
    </TurnstileContext.Provider>
  );
}

export function useTurnstile(): TurnstileApi {
  const ctx = useContext(TurnstileContext);
  if (!ctx) throw new Error('useTurnstile must be used inside <TurnstileProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  body: { minHeight: WIDGET_HEIGHT, paddingBottom: spacing.sm },
  widgetWrap: { height: WIDGET_HEIGHT },
  webview: { height: WIDGET_HEIGHT, backgroundColor: 'transparent' },
});
