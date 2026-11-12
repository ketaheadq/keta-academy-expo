import { Bell, ChevronRight, LogOut, Settings, ShieldCheck, User } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { type StrapiAuthResponse } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileScreen() {
	const { user, signInWithGoogle, signOut, setAuth } = useAuthStore();
	const [demoError, setDemoError] = useState(false);
	const signInDemo = async () => {
		setDemoError(false);
		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_STRAPI_URL}/api/auth/local`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identifier: 'demo-learner@ketalearn.test', password: 'KetaDemo!2026' }),
			});
			if (!response.ok) throw new Error('Demo login failed');
			const { jwt, user }: StrapiAuthResponse = await response.json();
			setAuth(jwt, user);
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
				<Pressable onPress={user ? signOut : signInWithGoogle} className="mt-6 rounded-full bg-blue-600 px-8 py-3">
					<Text className="font-bold text-white">{user ? 'Çıkış Yap' : 'Google ile Giriş Yap'}</Text>
				</Pressable>
				{!user && process.env.EXPO_PUBLIC_KETA_DEMO_LOGIN === 'true' && (
					<Pressable onPress={signInDemo} className="mt-3 rounded-full bg-blue-600 px-8 py-3">
						<Text className="font-bold text-white">Demo öğrenciyle giriş yap</Text>
					</Pressable>
				)}
				{demoError && <Text accessibilityRole="alert">Demo öğrenciyle giriş yapılamadı.</Text>}
			</View>

			<View className="mt-6 border-slate-100 border-y bg-white">
				<ProfileItem icon={<Bell size={20} color="#64748b" />} label="Bildirimler" />
				<ProfileItem icon={<Settings size={20} color="#64748b" />} label="Ayarlar" />
				<ProfileItem
					icon={<ShieldCheck size={20} color="#64748b" />}
					label="Güvenlik ve Gizlilik"
				/>
			</View>

			<View className="mt-6 border-slate-100 border-y bg-white">
				<ProfileItem
					icon={<LogOut size={20} color="#dc2626" />}
					label="Çıkış Yap"
					labelColor="text-red-500"
					last
				/>
			</View>

			<Text className="mt-8 mb-12 text-center text-slate-400 text-xs">Keta Akademi v1.0.0</Text>
		</ScrollView>
	);
}

function ProfileItem({ icon, label, labelColor = 'text-slate-700', last = false }: any) {
	return (
		<Pressable
			className={`flex-row items-center p-4 active:bg-slate-50 ${last ? '' : 'border-slate-50 border-b'}`}
		>
			<View className="mr-3">{icon}</View>
			<Text className={`flex-1 font-medium ${labelColor}`}>{label}</Text>
			<ChevronRight size={18} color="#cbd5e1" />
		</Pressable>
	);
}
