import { Play } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { extractYouTubeVideoId } from '@/lib/utils';

/**
 * Lesson videos are YouTube embeds on the web. Native playback uses a WebView that loads the
 * YouTube IFrame player, so the same `videoURL` values work unchanged.
 */
export function YouTubePlayer({
	videoURL,
	height = 220,
	onEnded,
}: {
	videoURL?: string | null;
	height?: number;
	/** Fired once when playback reaches the end (used to mark a lesson complete). */
	onEnded?: () => void;
}) {
	const videoId = useMemo(() => extractYouTubeVideoId(videoURL), [videoURL]);
	const [playing, setPlaying] = useState(false);
	const endedRef = useRef(false);

	if (!videoId) {
		return (
			<View style={{ height }} className="items-center justify-center rounded-xl bg-slate-100">
				<Text className="font-medium text-slate-500">Video yüklenemedi</Text>
			</View>
		);
	}

	if (!playing) {
		return (
			<Pressable
				onPress={() => setPlaying(true)}
				style={{ height }}
				className="items-center justify-center overflow-hidden rounded-xl bg-slate-900"
			>
				<View className="size-16 items-center justify-center rounded-full bg-blue-600">
					<Play size={30} color="#ffffff" />
				</View>
				<Text className="mt-3 font-medium text-slate-200 text-sm">Videoyu oynat</Text>
			</Pressable>
		);
	}

	const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
	const injected = `
    (function () {
      var el = document.createElement('script');
      el.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(el);
      var sent = false;
      function poll() {
        var f = document.querySelector('iframe');
        var p = f && f.contentWindow && f.contentWindow.player;
        if (!sent && p && typeof p.getPlayerState === 'function' && p.getPlayerState() === 0) {
          sent = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'ended' }));
        }
        setTimeout(poll, 700);
      }
      setTimeout(poll, 1200);
    })();
    true;
  `;

	return (
		<View style={{ height }} className="overflow-hidden rounded-xl bg-black">
			<WebView
				source={{ uri: src }}
				style={{ flex: 1 }}
				injectedJavaScript={injected}
				javaScriptEnabled
				domStorageEnabled
				mediaPlaybackRequiresUserAction={false}
				allowsFullscreenVideo
				startInLoadingState
				renderLoading={() => (
					<ActivityIndicator className="absolute top-1/2 left-1/2" color="#ffffff" />
				)}
				onMessage={(event) => {
					try {
						const payload = JSON.parse(event.nativeEvent.data);
						if (payload?.event === 'ended' && !endedRef.current) {
							endedRef.current = true;
							onEnded?.();
						}
					} catch {
						// Not a message we sent; ignore.
					}
				}}
			/>
		</View>
	);
}
