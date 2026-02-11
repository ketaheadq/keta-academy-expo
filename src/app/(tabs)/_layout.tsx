import { Tabs } from 'expo-router';
import { BookText, Home, PlayCircle, User } from 'lucide-react-native';

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
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: '#2563eb',
				tabBarInactiveTintColor: '#64748b',
				headerShown: true,
				headerStyle: {
					backgroundColor: '#ffffff',
					borderBottomWidth: 1,
					borderBottomColor: '#f1f5f9',
					elevation: 0,
					shadowOpacity: 0,
				},
				headerTitleStyle: {
					fontWeight: 'bold',
					color: '#0f172a',
				},
				tabBarStyle: {
					borderTopWidth: 1,
					borderTopColor: '#f1f5f9',
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
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
