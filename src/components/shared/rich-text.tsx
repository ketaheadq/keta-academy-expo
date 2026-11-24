import type * as React from 'react';
import { Image, Linking, Text, type TextStyle, View } from 'react-native';
import { mediaUrl, type StrapiBlock } from '@/lib/strapi';

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

function inlineStyle(child: InlineChild): TextStyle {
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
		style.backgroundColor = 'rgba(148, 163, 184, 0.18)';
	}
	return style;
}

function renderInline(children: InlineChild[] | undefined, keyPrefix: string): React.ReactNode[] {
	if (!Array.isArray(children)) return [];

	const nodes: React.ReactNode[] = [];
	children.forEach((child, index) => {
		const key = `${keyPrefix}-${index}`;
		if (child.type === 'link' && child.url) {
			const url = child.url;
			nodes.push(
				<Text
					key={key}
					style={[{ color: '#2563eb', textDecorationLine: 'underline' }, inlineStyle(child)]}
					onPress={() => void Linking.openURL(url)}
				>
					{renderInline(child.children as InlineChild[] | undefined, key)}
				</Text>,
			);
			return;
		}
		if (Array.isArray(child.children) && child.children.length) {
			nodes.push(
				<Text key={key} style={inlineStyle(child)}>
					{renderInline(child.children as InlineChild[], key)}
				</Text>,
			);
			return;
		}
		nodes.push(
			<Text key={key} style={inlineStyle(child)}>
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
	const children = block.children as InlineChild[] | undefined;
	const key = `block-${index}`;

	switch (block.type) {
		case 'heading': {
			const level = typeof block.level === 'number' ? block.level : 2;
			return (
				<Text className={HEADING_CLASS[level] ?? HEADING_CLASS[2]}>
					{renderInline(children, key)}
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
								{renderInline(item.children as InlineChild[] | undefined, `${key}-${itemIndex}`)}
							</Text>
						</View>
					))}
				</View>
			);
		}

		case 'quote':
			return (
				<View className="mb-4 border-blue-500 border-l-4 bg-slate-50 py-2 pl-4">
					<Text className="text-base text-slate-600 italic leading-6">
						{renderInline(children, key)}
					</Text>
				</View>
			);

		case 'code':
			return (
				<View className="mb-4 rounded-xl bg-slate-900 p-4">
					<Text className="font-mono text-slate-100 text-sm">{renderInline(children, key)}</Text>
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
					{renderInline(children, key)}
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
