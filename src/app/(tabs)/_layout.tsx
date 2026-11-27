import { Tabs } from 'expo-router';
import { BookText, Home, PlayCircle, User } from 'lucide-react-native';
import { useThemeColors } from '@/lib/theme';

function HomeIcon({ color, size }: Readonly<{ color: string; size: number }>) {
	return <Home size={size} color={color} />;
}

function CoursesIcon({ color, size }: Readonly<{ color: string; size: number }>) {
	return <PlayCircle size={size} color={color} />;
}

function BlogIcon({ color, size }: Readonly<{ color: string; size: number }>) {
	return <BookText size={size} color={color} />;
}

function ProfileIcon({ color, size }: Readonly<{ color: string; size: number }>) {
	return <User size={size} color={color} />;
}

export default function TabLayout() {
	const colors = useThemeColors();
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.mutedForeground,
				headerShown: true,
				headerStyle: {
					backgroundColor: colors.card,
					borderBottomWidth: 1,
					borderBottomColor: colors.border,
					elevation: 0,
					shadowOpacity: 0,
				},
				headerTitleStyle: {
					fontWeight: 'bold',
					color: colors.foreground,
				},
				tabBarStyle: {
					backgroundColor: colors.card,
					borderTopWidth: 1,
					borderTopColor: colors.border,
					height: 64,
					paddingBottom: 8,
					paddingTop: 8,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '600',
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Ana Sayfa',
					tabBarIcon: HomeIcon,
				}}
			/>
			<Tabs.Screen
				name="courses"
				options={{
					title: 'Dersler',
					tabBarIcon: CoursesIcon,
				}}
			/>
			<Tabs.Screen
				name="blog"
				options={{
					title: 'Blog',
					tabBarIcon: BlogIcon,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profil',
					tabBarIcon: ProfileIcon,
				}}
			/>
		</Tabs>
	);
}
