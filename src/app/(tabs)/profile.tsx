import { type Href, useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
	BookOpen,
	Check,
	ChevronRight,
	FileText,
	GraduationCap,
	HelpCircle,
	LogOut,
	Mail,
	Monitor,
	Moon,
	NotebookPen,
	ShieldCheck,
	Sun,
	User,
	Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Reveal } from '@/components/shared/motion';
import type { StrapiAuthResponse } from '@/lib/auth';
import { STRAPI_URL } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { type ThemePreference, useThemeStore } from '@/stores/theme-store';

type MenuEntry = { icon: LucideIcon; label: string; href: Href };

const LEARNING: MenuEntry[] = [
	{ icon: GraduationCap, label: 'Derslerim', href: '/derslerim' },
	{ icon: NotebookPen, label: 'Deneme Sınavları', href: '/deneme-sinavlari' },
	{ icon: Users, label: 'Özel Ders', href: '/ozel-ders' },
	{ icon: BookOpen, label: 'Tüm Sayfalar', href: '/sayfalar' },
];

const SUPPORT: MenuEntry[] = [
	{ icon: HelpCircle, label: 'Sıkça Sorulan Sorular', href: '/sikca-sorulan-sorular' },
	{ icon: Mail, label: 'İletişim', href: '/iletisim' },
];

const LEGAL: MenuEntry[] = [
	{ icon: ShieldCheck, label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
	{ icon: FileText, label: 'Hizmet Şartları', href: '/hizmet-sartlari' },
];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
	{ value: 'system', label: 'Sistem', icon: Monitor },
	{ value: 'light', label: 'Açık', icon: Sun },
	{ value: 'dark', label: 'Koyu', icon: Moon },
];

export default function ProfileScreen() {
	const router = useRouter();
	const colors = useThemeColors();
	const { user, signInWithGoogle, signOut, setAuth } = useAuthStore();
	const isLoading = useAuthStore((state) => state.isLoading);
	const error = useAuthStore((state) => state.error);
	const preference = useThemeStore((state) => state.preference);
	const setPreference = useThemeStore((state) => state.setPreference);
	const [demoError, setDemoError] = useState(false);

	const signInDemo = async () => {
		setDemoError(false);
		try {
			const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					identifier: 'demo-learner@ketalearn.test',
					password: 'KetaDemo!2026',
				}),
			});
			if (!response.ok) throw new Error('Demo login failed');
			const { jwt, user: strapiUser }: StrapiAuthResponse = await response.json();
			setAuth(jwt, strapiUser);
		} catch {
			setDemoError(true);
		}
	};

	return (
		<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
			<Reveal>
				<View className="items-center border-border border-b bg-card px-6 py-8">
					<View className="mb-4 size-24 items-center justify-center rounded-full bg-accent">
						<User size={48} color={colors.primary} />
					</View>
					<Text className="text-center font-bold text-foreground text-xl">
						{user?.name ?? 'Hoş Geldiniz'}
					</Text>
					{user?.email ? (
						<Text className="mt-1 text-center text-muted-foreground text-sm">{user.email}</Text>
					) : null}

					{user ? (
						<Pressable
							onPress={signOut}
							className="mt-6 flex-row items-center gap-2 rounded-full bg-destructive/10 px-8 py-3 active:bg-destructive/20"
						>
							<LogOut size={18} color={colors.destructive} />
							<Text className="font-bold text-destructive">Çıkış Yap</Text>
						</Pressable>
					) : (
						<View className="mt-6 w-full items-center gap-3">
							{error ? (
								<Text accessibilityRole="alert" className="text-center text-destructive text-sm">
									{error}
								</Text>
							) : null}
							<Pressable
								onPress={() => void signInWithGoogle()}
								disabled={isLoading}
								className="w-full items-center rounded-full bg-primary px-8 py-3 active:bg-primary/90"
							>
								{isLoading ? (
									<ActivityIndicator size="small" color={colors.primaryForeground} />
								) : (
									<Text className="font-bold text-primary-foreground">Google ile Giriş Yap</Text>
								)}
							</Pressable>
							<View className="flex-row gap-3">
								<Pressable
									onPress={() => router.push('/giris')}
									className="rounded-full border border-input bg-card px-5 py-2.5 active:bg-muted"
								>
									<Text className="font-bold text-foreground text-sm">Giriş Yap</Text>
								</Pressable>
								<Pressable
									onPress={() => router.push('/kayit-ol')}
									className="rounded-full border border-input bg-card px-5 py-2.5 active:bg-muted"
								>
									<Text className="font-bold text-foreground text-sm">Üye Ol</Text>
								</Pressable>
							</View>
							{process.env.EXPO_PUBLIC_KETA_DEMO_LOGIN === 'true' ? (
								<Pressable
									onPress={signInDemo}
									className="rounded-full bg-primary px-8 py-3 active:bg-primary/90"
								>
									<Text className="font-bold text-primary-foreground">
										Demo öğrenciyle giriş yap
									</Text>
								</Pressable>
							) : null}
							{demoError ? (
								<Text accessibilityRole="alert" className="text-destructive text-sm">
									Demo öğrenciyle giriş yapılamadı.
								</Text>
							) : null}
						</View>
					)}
				</View>
			</Reveal>

			<Reveal delay={80}>
				<View className="mx-4 mt-6 gap-3 rounded-2xl border border-border bg-card p-4">
					<View>
						<Text className="font-bold text-foreground text-lg">Görünüm</Text>
						<Text className="mt-1 text-muted-foreground text-sm">
							Gözünüze en rahat gelen temayı seçin.
						</Text>
					</View>
					<View
						accessibilityRole="radiogroup"
						accessibilityLabel="Görünüm"
						className="flex-row gap-2"
					>
						{THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
							const selected = preference === value;
							return (
								<Pressable
									key={value}
									accessibilityRole="radio"
									accessibilityState={{ checked: selected }}
									aria-checked={selected}
									onPress={() => setPreference(value)}
									className={cn(
										'flex-1 items-center gap-1.5 rounded-xl border px-2 py-3',
										selected
											? 'border-primary bg-accent'
											: 'border-input bg-background active:bg-muted',
									)}
								>
									<Icon size={19} color={selected ? colors.primary : colors.mutedForeground} />
									<Text
										className={cn(
											'font-semibold text-xs',
											selected ? 'text-primary' : 'text-muted-foreground',
										)}
									>
										{label}
									</Text>
									{selected ? <Check size={12} color={colors.primary} /> : null}
								</Pressable>
							);
						})}
					</View>
				</View>
			</Reveal>

			<MenuSection entries={LEARNING} onNavigate={router.push} delay={140} />
			<MenuSection entries={SUPPORT} onNavigate={router.push} delay={200} />
			<MenuSection entries={LEGAL} onNavigate={router.push} delay={260} />

			<Text className="mt-8 mb-4 text-center text-muted-foreground text-xs">
				Keta Akademi v1.0.0
			</Text>
		</ScrollView>
	);
}

function MenuSection({
	entries,
	onNavigate,
	delay,
}: {
	entries: MenuEntry[];
	onNavigate: (href: Href) => void;
	delay: number;
}) {
	const colors = useThemeColors();
	return (
		<Reveal delay={delay}>
			<View className="mx-4 mt-6 overflow-hidden rounded-2xl border border-border bg-card">
				{entries.map((entry, index) => (
					<ProfileItem
						key={entry.label}
						icon={<entry.icon size={20} color={colors.mutedForeground} />}
						label={entry.label}
						last={index === entries.length - 1}
						onPress={() => onNavigate(entry.href)}
					/>
				))}
			</View>
		</Reveal>
	);
}

function ProfileItem({
	icon,
	label,
	last = false,
	onPress,
}: {
	icon: React.ReactNode;
	label: string;
	last?: boolean;
	onPress?: () => void;
}) {
	const colors = useThemeColors();
	return (
		<Pressable
			onPress={onPress}
			className={cn('flex-row items-center p-4 active:bg-muted', !last && 'border-border border-b')}
		>
			<View className="mr-3">{icon}</View>
			<Text className="flex-1 font-medium text-foreground">{label}</Text>
			<ChevronRight size={18} color={colors.mutedForeground} />
		</Pressable>
	);
}
