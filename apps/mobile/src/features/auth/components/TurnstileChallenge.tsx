import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/theme';
import { turnstileHtml, type ChallengeProps } from './turnstile-html';

export function TurnstileChallenge({ siteKey, origin, onMessage, onFailure }: ChallengeProps) {
  const { colors } = useTheme();
  const html = useMemo(() => turnstileHtml(siteKey, colors), [siteKey, colors]);
  return (
    <WebView
      accessibilityLabel="Complete security verification"
      source={{ html, baseUrl: origin }}
      originWhitelist={['https://*', 'about:blank', 'about:srcdoc']}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      mixedContentMode="never"
      onMessage={(event) => onMessage(event.nativeEvent.data)}
      onError={onFailure}
      onHttpError={onFailure}
      onShouldStartLoadWithRequest={({ url }) =>
        url === 'about:blank' ||
        url === 'about:srcdoc' ||
        url.startsWith(`${origin}/`) ||
        url === origin ||
        (() => {
          try {
            const target = new URL(url);
            return (
              target.protocol === 'https:' &&
              (target.hostname === 'challenges.cloudflare.com' ||
                target.hostname.endsWith('.challenges.cloudflare.com'))
            );
          } catch {
            return false;
          }
        })()
      }
      style={[styles.frame, { backgroundColor: colors.surface }]}
    />
  );
}

const styles = StyleSheet.create({ frame: { height: 180, flex: 0 } });
