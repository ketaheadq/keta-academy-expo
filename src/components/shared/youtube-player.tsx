import { Play } from 'lucide-react-native';
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemeColors } from '@/lib/theme';
import { extractYouTubeVideoId } from '@/lib/utils';

const PLAYER_ORIGIN = 'https://ketaakademi.app';
type WebIframeProps = React.IframeHTMLAttributes<HTMLIFrameElement> & {
	ref?: React.Ref<HTMLIFrameElement>;
};
const WebIframe = 'iframe' as unknown as React.ComponentType<WebIframeProps>;

function playerHtml(videoId: string, origin: string) {
	return `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}iframe{width:100%;height:100%;border:0}</style>
</head>
<body>
<div id="player"></div>
<script>
var player;
function post(event) {
  window.ReactNativeWebView.postMessage(JSON.stringify(event));
}
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: ${JSON.stringify(videoId)},
    playerVars: { autoplay: 1, playsinline: 1, rel: 0, origin: ${JSON.stringify(origin)} },
    events: {
      onReady: function () {
        player.addEventListener('onStateChange', function (event) {
          if (event.data === YT.PlayerState.ENDED) post({ event: 'ended' });
        });
        post({ event: 'ready' });
      },
      onError: function () { post({ event: 'error' }); }
    }
  });
}
var script = document.createElement('script');
script.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(script);
</script>
</body>
</html>`;
}

function WebYouTubePlayer({
	videoId,
	onEnded,
	onError,
}: {
	videoId: string;
	onEnded: () => void;
	onError: () => void;
}) {
	const frameRef = useRef<HTMLIFrameElement>(null);
	const startListening = React.useCallback(() => {
		frameRef.current?.contentWindow?.postMessage(
			JSON.stringify({ event: 'listening', id: 'keta-player' }),
			'https://www.youtube.com',
		);
	}, []);

	React.useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (
				event.origin !== 'https://www.youtube.com' ||
				event.source !== frameRef.current?.contentWindow
			)
				return;
			try {
				const payload = JSON.parse(event.data);
				if (payload.event === 'listening') {
					frameRef.current?.contentWindow?.postMessage(
						JSON.stringify({ event: 'listening', id: 'keta-player' }),
						'https://www.youtube.com',
					);
				}
				if (payload.event === 'infoDelivery' && payload.info?.event === 'onReady') {
					frameRef.current?.contentWindow?.postMessage(
						JSON.stringify({
							event: 'command',
							func: 'addEventListener',
							args: ['onStateChange'],
							id: 'keta-listener',
						}),
						'https://www.youtube.com',
					);
				}
				if (payload.event === 'onStateChange' && payload.info === 0) onEnded();
				if (payload.event === 'onError') onError();
			} catch {
				return;
			}
		};
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, [onEnded, onError]);

	return (
		<WebIframe
			ref={frameRef}
			src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
			title="Ders videosu"
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowFullScreen
			onLoad={startListening}
			style={{ width: '100%', height: '100%', border: 0 }}
		/>
	);
}

export function YouTubePlayer({
	videoURL,
	height = 220,
	onEnded,
}: {
	videoURL?: string | null;
	height?: number;
	onEnded?: () => void;
}) {
	const colors = useThemeColors();
	const videoId = useMemo(() => extractYouTubeVideoId(videoURL), [videoURL]);
	const [playing, setPlaying] = useState(false);
	const [failed, setFailed] = useState(false);
	const endedRef = useRef(false);

	const handleEnded = () => {
		if (endedRef.current) return;
		endedRef.current = true;
		onEnded?.();
	};
	const handleError = () => setFailed(true);

	if (!videoId || failed) {
		return (
			<View style={{ height }} className="items-center justify-center gap-3 rounded-xl bg-muted">
				<Text className="font-medium text-muted-foreground">Video yüklenemedi</Text>
				<Pressable
					onPress={() => {
						setFailed(false);
						setPlaying(false);
					}}
					className="rounded-full bg-primary px-5 py-2 active:bg-primary/90"
				>
					<Text className="font-semibold text-primary-foreground text-sm">Tekrar dene</Text>
				</Pressable>
			</View>
		);
	}

	if (!playing) {
		return (
			<Pressable
				onPress={() => setPlaying(true)}
				accessibilityRole="button"
				accessibilityLabel="Videoyu oynat"
				style={{ height }}
				className="items-center justify-center overflow-hidden rounded-xl bg-hero"
			>
				<Image
					source={{ uri: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }}
					resizeMode="cover"
					style={{ width: '100%', height, position: 'absolute', opacity: 0.55 }}
				/>
				<View className="absolute inset-0 bg-black/40" />
				<View className="size-16 items-center justify-center rounded-full bg-primary">
					<Play size={30} color={colors.primaryForeground} />
				</View>
				<Text className="mt-3 font-medium text-sm text-white">Videoyu oynat</Text>
			</Pressable>
		);
	}

	return (
		<View style={{ height }} className="overflow-hidden rounded-xl bg-black">
			{Platform.OS === 'web' ? (
				<WebYouTubePlayer videoId={videoId} onEnded={handleEnded} onError={handleError} />
			) : (
				<WebView
					source={{ html: playerHtml(videoId, PLAYER_ORIGIN), baseUrl: `${PLAYER_ORIGIN}/` }}
					style={{ flex: 1 }}
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
							if (payload?.event === 'ended') handleEnded();
							if (payload?.event === 'error') handleError();
						} catch {
							return;
						}
					}}
				/>
			)}
		</View>
	);
}
