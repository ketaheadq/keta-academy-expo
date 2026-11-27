import { router } from 'expo-router';
import type * as React from 'react';
import { Alert, Image, Linking, Text, type TextStyle, View } from 'react-native';
import { appHref, toAppRoute } from '@/lib/routes';
import { mediaUrl, type StrapiBlock } from '@/lib/strapi';
import { type AppTheme, useThemeColors } from '@/lib/theme';

type InlineChild = {
	type?: string;
	text?: string;
	url?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	code?: boolean;
	children?: InlineChild[];
};

function inlineStyle(child: InlineChild, colors: AppTheme): TextStyle {
	const style: TextStyle = {};
	if (child.bold) style.fontWeight = '700';
	if (child.italic) style.fontStyle = 'italic';

	const decoration: string[] = [];
	if (child.underline) decoration.push('underline');
	if (child.strikethrough) decoration.push('line-through');
	if (decoration.length)
		style.textDecorationLine = decoration.join(' ') as TextStyle['textDecorationLine'];

	if (child.code) {
		style.fontFamily = 'monospace';
		style.backgroundColor = colors.muted;
	}
	return style;
}

function openLink(url: string) {
	const route = toAppRoute(
		!url.startsWith('//') && !/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('/')
			? `/${url}`
			: url,
	);
	if (route?.startsWith('/') && !route.startsWith('//')) {
		router.push(appHref(route));
		return;
	}
	try {
		const parsed = new URL(url);
		if (
			(parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
			(parsed.hostname === 'ketaakademi.app' || parsed.hostname === 'www.ketaakademi.app')
		) {
			router.push(appHref(toAppRoute(`${parsed.pathname}${parsed.search}${parsed.hash}`) ?? '/'));
			return;
		}
		if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return;
		void Linking.openURL(url).catch(() => Alert.alert('Bağlantı açılamadı', url));
	} catch {
		Alert.alert('Bağlantı açılamadı', url);
	}
}

function renderInline(
	children: InlineChild[] | undefined,
	keyPrefix: string,
	colors: AppTheme,
): React.ReactNode[] {
	if (!Array.isArray(children)) return [];

	const nodes: React.ReactNode[] = [];
	children.forEach((child, index) => {
		const key = `${keyPrefix}-${index}`;
		if (child.type === 'link' && child.url) {
			const url = child.url;
			nodes.push(
				<Text
					key={key}
					style={[
						{ color: colors.primary, textDecorationLine: 'underline' },
						inlineStyle(child, colors),
					]}
					onPress={() => openLink(url)}
				>
					{renderInline(child.children as InlineChild[] | undefined, key, colors)}
				</Text>,
			);
			return;
		}
		if (Array.isArray(child.children) && child.children.length) {
			nodes.push(
				<Text key={key} style={inlineStyle(child, colors)}>
					{renderInline(child.children as InlineChild[], key, colors)}
				</Text>,
			);
			return;
		}
		nodes.push(
			<Text key={key} style={inlineStyle(child, colors)}>
				{child.text ?? ''}
			</Text>,
		);
	});
	return nodes;
}

const HEADING_CLASS: Record<number, string> = {
	1: 'mb-3 font-bold text-3xl text-foreground',
	2: 'mb-3 font-bold text-2xl text-foreground',
	3: 'mb-2 font-bold text-xl text-foreground',
	4: 'mb-2 font-semibold text-lg text-foreground',
	5: 'mb-2 font-semibold text-base text-foreground',
	6: 'mb-2 font-semibold text-sm text-foreground',
};

function Block({ block, index }: { block: StrapiBlock; index: number }) {
	const colors = useThemeColors();
	const children = block.children as InlineChild[] | undefined;
	const key = `block-${index}`;

	switch (block.type) {
		case 'heading': {
			const level = typeof block.level === 'number' ? block.level : 2;
			return (
				<Text className={HEADING_CLASS[level] ?? HEADING_CLASS[2]}>
					{renderInline(children, key, colors)}
				</Text>
			);
		}

		case 'list': {
			const ordered = block.format === 'ordered';
			const items = (children ?? []).filter((child) => child.type === 'list-item');
			return (
				<View className="mb-4 gap-2">
					{items.map((item, itemIndex) => (
						<View key={`${key}-${itemIndex}`} className="flex-row gap-2">
							<Text className="text-base text-muted-foreground">
								{ordered ? `${itemIndex + 1}.` : '•'}
							</Text>
							<Text className="flex-1 text-base text-muted-foreground leading-6">
								{renderInline(
									item.children as InlineChild[] | undefined,
									`${key}-${itemIndex}`,
									colors,
								)}
							</Text>
						</View>
					))}
				</View>
			);
		}

		case 'quote':
			return (
				<View className="mb-4 border-primary border-l-4 bg-muted py-2 pl-4">
					<Text className="text-base text-muted-foreground italic leading-6">
						{renderInline(children, key, colors)}
					</Text>
				</View>
			);

		case 'code':
			return (
				<View className="mb-4 rounded-xl bg-slate-900 p-4">
					<Text className="font-mono text-slate-100 text-sm">
						{renderInline(children, key, colors)}
					</Text>
				</View>
			);

		case 'image': {
			const image = block.image as
				| {
						url?: string;
						alternativeText?: string;
						width?: number;
						height?: number;
						caption?: string;
				  }
				| undefined;
			const src = mediaUrl(image?.url);
			if (!src) return null;
			return (
				<View className="mb-4">
					<Image
						source={{ uri: src }}
						accessibilityLabel={image?.alternativeText ?? ''}
						resizeMode="cover"
						style={{ width: '100%', height: 200, borderRadius: 12 }}
					/>
					{image?.caption ? (
						<Text className="mt-2 text-center text-muted-foreground text-sm italic">
							{image.caption}
						</Text>
					) : null}
				</View>
			);
		}

		default:
			return (
				<Text className="mb-4 text-base text-muted-foreground leading-6">
					{renderInline(children, key, colors)}
				</Text>
			);
	}
}

/**
 * Renders Strapi rich-text blocks with native components, mirroring the web app's
 * `BlocksRenderer` configuration (paragraph, heading, list, quote, code, image, link).
 */
export function RichText({ blocks }: { blocks?: StrapiBlock[] | null }) {
	if (!blocks?.length) return null;
	return (
		<View>
			{blocks.map((block, index) => (
				<Block key={`block-${index}`} block={block} index={index} />
			))}
		</View>
	);
}
