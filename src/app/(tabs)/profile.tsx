import { type Href, useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
	BookOpen,
	ChevronRight,
	FileText,
	GraduationCap,
	HelpCircle,
	LogOut,
	Mail,
	NotebookPen,
	ShieldCheck,
	User,
	Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { StrapiAuthResponse } from '@/lib/auth';
import { STRAPI_URL } from '@/lib/strapi';
import { useAuthStore } from '@/stores/auth-store';

type MenuEntry = { icon: LucideIcon; label: string; href: Href; tint?: string };

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

export default function ProfileScreen() {
	const router = useRouter();
	const { user, signInWithGoogle, signOut, setAuth } = useAuthStore();
	const isLoading = useAuthStore((state) => state.isLoading);
	const error = useAuthStore((state) => state.error);
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
		<ScrollView className="flex-1 bg-slate-50">
			<View className="items-center border-slate-100 border-b bg-white p-6">
				<View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
					<User size={48} color="#2563eb" />
				</View>
				<Text className="font-bold text-slate-900 text-xl">{user?.name ?? 'Hoş Geldiniz'}</Text>
				{user?.email ? <Text className="mt-1 text-slate-500 text-sm">{user.email}</Text> : null}

				{user ? (
					<Pressable
						onPress={signOut}
						className="mt-6 flex-row items-center gap-2 rounded-full bg-red-50 px-8 py-3 active:bg-red-100"
					>
						<LogOut size={18} color="#dc2626" />
						<Text className="font-bold text-red-600">Çıkış Yap</Text>
					</Pressable>
				) : (
					<View className="mt-6 w-full items-center gap-3">
						{error ? (
							<Text accessibilityRole="alert" className="text-center text-red-600 text-sm">
								{error}
							</Text>
						) : null}
						<Pressable
							onPress={() => void signInWithGoogle()}
							disabled={isLoading}
							className="w-full items-center rounded-full bg-blue-600 px-8 py-3 active:bg-blue-700"
						>
							{isLoading ? (
								<ActivityIndicator size="small" color="#ffffff" />
							) : (
								<Text className="font-bold text-white">Google ile Giriş Yap</Text>
							)}
						</Pressable>
						<View className="flex-row gap-3">
							<Pressable
								onPress={() => router.push('/giris')}
								className="rounded-full border border-slate-200 bg-white px-5 py-2.5 active:bg-slate-50"
							>
								<Text className="font-bold text-slate-700 text-sm">Giriş Yap</Text>
							</Pressable>
							<Pressable
								onPress={() => router.push('/kayit-ol')}
								className="rounded-full border border-slate-200 bg-white px-5 py-2.5 active:bg-slate-50"
							>
								<Text className="font-bold text-slate-700 text-sm">Üye Ol</Text>
							</Pressable>
						</View>
						{process.env.EXPO_PUBLIC_KETA_DEMO_LOGIN === 'true' ? (
							<Pressable
								onPress={signInDemo}
								className="rounded-full bg-blue-600 px-8 py-3 active:bg-blue-700"
							>
								<Text className="font-bold text-white">Demo öğrenciyle giriş yap</Text>
							</Pressable>
						) : null}
						{demoError ? (
							<Text accessibilityRole="alert" className="text-red-600 text-sm">
								Demo öğrenciyle giriş yapılamadı.
							</Text>
						) : null}
					</View>
				)}
			</View>

			<MenuSection entries={LEARNING} onNavigate={router.push} />
			<MenuSection entries={SUPPORT} onNavigate={router.push} />
			<MenuSection entries={LEGAL} onNavigate={router.push} />

			<Text className="mt-8 mb-12 text-center text-slate-400 text-xs">Keta Akademi v1.0.0</Text>
		</ScrollView>
	);
}

function MenuSection({
	entries,
	onNavigate,
}: {
	entries: MenuEntry[];
	onNavigate: (href: Href) => void;
}) {
	return (
		<View className="mt-6 border-slate-100 border-y bg-white">
			{entries.map((entry, index) => (
				<ProfileItem
					key={entry.label}
					icon={<entry.icon size={20} color={entry.tint ?? '#64748b'} />}
					label={entry.label}
					last={index === entries.length - 1}
					onPress={() => onNavigate(entry.href)}
				/>
			))}
		</View>
	);
}

function ProfileItem({
	icon,
	label,
	labelColor = 'text-slate-700',
	last = false,
	onPress,
}: {
	icon: React.ReactNode;
	label: string;
	labelColor?: string;
	last?: boolean;
	onPress?: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className={`flex-row items-center p-4 active:bg-slate-50 ${last ? '' : 'border-slate-50 border-b'}`}
		>
			<View className="mr-3">{icon}</View>
			<Text className={`flex-1 font-medium ${labelColor}`}>{label}</Text>
			<ChevronRight size={18} color="#cbd5e1" />
		</Pressable>
	);
}
