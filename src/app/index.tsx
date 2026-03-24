import { Stack } from 'expo-router';
import {
	BellIcon,
	BookOpenIcon,
	ChevronRightIcon,
	ClockIcon,
	GraduationCapIcon,
	LayoutGridIcon,
	MoonStarIcon,
	SearchIcon,
	StarIcon,
	SunIcon,
} from 'lucide-react-native';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

const CATEGORIES = [
	{
		id: '1',
		name: 'Mathematics',
		icon: LayoutGridIcon,
		color: 'bg-blue-500',
		shadow: 'shadow-blue-500/20',
	},
	{
		id: '2',
		name: 'Science',
		icon: BookOpenIcon,
		color: 'bg-purple-500',
		shadow: 'shadow-purple-500/20',
	},
	{
		id: '3',
		name: 'Exam Prep',
		icon: GraduationCapIcon,
		color: 'bg-orange-500',
		shadow: 'shadow-orange-500/20',
	},
	{
		id: '4',
		name: 'Languages',
		icon: StarIcon,
		color: 'bg-green-500',
		shadow: 'shadow-green-500/20',
	},
];

const FEATURED_COURSES = [
	{
		id: '1',
		title: 'Advanced Calculus Masterclass',
		instructor: 'Dr. Sarah Smith',
		rating: 4.9,
		reviews: 124,
		price: 'Free',
		image:
			'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
		duration: '12h 30m',
	},
	{
		id: '2',
		title: 'Organic Chemistry Fundamentals',
		instructor: 'Prof. James Chen',
		rating: 4.8,
		reviews: 89,
		price: 'Premium',
		image:
			'https://images.unsplash.com/photo-1532187875605-2fe358a3d4d2?w=800&auto=format&fit=crop&q=60',
		duration: '8h 45m',
	},
];

const THEME_ICONS = {
	light: SunIcon,
	dark: MoonStarIcon,
};

function ThemeToggle() {
	const { theme } = useUniwind();

	function toggleTheme() {
		const newTheme = theme === 'dark' ? 'light' : 'dark';
		Uniwind.setTheme(newTheme);
	}

	return (
		<Button
			onPressIn={toggleTheme}
			size="icon"
			variant="ghost"
			className="size-10 rounded-full active:bg-muted"
		>
			<Icon as={THEME_ICONS[theme ?? 'light']} className="size-5 text-foreground" />
		</Button>
	);
}

const HeaderRight = () => (
	<View className="flex-row items-center gap-2 pr-4">
		<ThemeToggle />
		<Pressable className="rounded-full p-2 active:bg-muted">
			<Icon as={BellIcon} className="size-5 text-foreground" />
		</Pressable>
	</View>
);

const HeaderLeft = () => (
	<View className="pl-4">
		<View className="size-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
			<Icon as={GraduationCapIcon} className="size-5 text-primary-foreground" />
		</View>
	</View>
);

export default function Screen() {
	return (
		<View className="flex-1 bg-background">
			<Stack.Screen
				options={{
					headerTitle: 'Keta Academy',
					headerTitleStyle: { fontWeight: '800', fontSize: 20 },
					headerTransparent: true,
					headerBlurEffect: 'regular',
					headerRight: HeaderRight,
					headerLeft: HeaderLeft,
				}}
			/>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingTop: 120, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Search Bar */}
				<View className="mb-8 px-5">
					<Pressable className="flex-row items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 px-4 py-3.5 shadow-sm">
						<Icon as={SearchIcon} className="size-5 text-muted-foreground" />
						<Text className="font-medium text-base text-muted-foreground">
							What do you want to learn today?
						</Text>
					</Pressable>
				</View>

				{/* Hero Section */}
				<View className="mb-8 px-5">
					<View className="relative overflow-hidden rounded-4xl bg-primary p-7 shadow-primary/30 shadow-xl">
						<View className="z-10 gap-2">
							<Text className="font-extrabold text-3xl text-primary-foreground leading-tight">
								Unlock Your{'\n'}Potential
							</Text>
							<Text className="mt-1 max-w-52.5 font-medium text-base text-primary-foreground/90">
								Access premium courses and prep for your success.
							</Text>
							<Button
								variant="secondary"
								className="mt-5 self-start rounded-2xl px-8 py-3 shadow-black/10 shadow-lg"
							>
								<Text className="font-bold text-base">Start Learning</Text>
							</Button>
						</View>
						<View className="absolute -right-12 -bottom-12 size-56 rounded-full bg-white/10" />
						<View className="absolute -top-14 -right-6 size-40 rounded-full bg-white/5" />
						<View className="absolute top-10 right-10 size-16 rounded-full bg-white/10 blur-xl" />
					</View>
				</View>

				{/* Categories */}
				<View className="mb-8">
					<View className="mb-5 flex-row items-center justify-between px-5">
						<Text className="font-extrabold text-2xl text-foreground">Categories</Text>
						<Pressable className="active:opacity-70">
							<Text className="font-bold text-base text-primary">See All</Text>
						</Pressable>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
					>
						{CATEGORIES.map((cat) => (
							<Pressable
								key={cat.id}
								className="w-32 items-center gap-3 rounded-3xl border border-border/60 bg-card p-5 shadow-black/5 shadow-xl transition-all active:scale-95"
							>
								<View
									className={`${cat.color} size-14 items-center justify-center rounded-2xl shadow-lg ${cat.shadow}`}
								>
									<Icon as={cat.icon} className="size-7 text-white" />
								</View>
								<Text className="text-center font-bold text-foreground text-sm" numberOfLines={1}>
									{cat.name}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>

				{/* Featured Courses */}
				<View className="scroll-view mb-8">
					<View className="mb-5 flex-row items-center justify-between px-5">
						<Text className="font-extrabold text-2xl text-foreground">Featured Courses</Text>
						<Pressable className="active:opacity-70">
							<Text className="font-bold text-base text-primary">Browse All</Text>
						</Pressable>
					</View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 20, gap: 20 }}
					>
						{FEATURED_COURSES.map((course) => (
							<View
								key={course.id}
								className="w-75 overflow-hidden rounded-4xl border border-border/60 bg-card shadow-2xl shadow-black/5"
							>
								<Image source={{ uri: course.image }} className="h-44 w-full" />
								<View className="gap-3 p-5">
									<View className="flex-row items-center justify-between">
										<View className="rounded-xl border border-primary/10 bg-primary/10 px-3 py-1.5">
											<Text className="font-black text-primary text-xs uppercase tracking-wider">
												{course.price}
											</Text>
										</View>
										<View className="flex-row items-center gap-1.5">
											<Icon as={StarIcon} className="size-4 fill-orange-400 text-orange-400" />
											<Text className="font-black text-foreground text-sm">{course.rating}</Text>
										</View>
									</View>
									<Text
										className="mb-0.5 font-extrabold text-foreground text-xl leading-tight"
										numberOfLines={2}
									>
										{course.title}
									</Text>
									<Text className="font-medium text-muted-foreground text-sm">
										{course.instructor}
									</Text>
									<View className="mt-2 flex-row items-center gap-5 border-border/50 border-t pt-4">
										<View className="flex-row items-center gap-1.5">
											<Icon as={ClockIcon} className="size-4 text-muted-foreground/70" />
											<Text className="font-bold text-muted-foreground/80 text-xs">
												{course.duration}
											</Text>
										</View>
										<View className="flex-row items-center gap-1.5">
											<Icon as={BookOpenIcon} className="size-4 text-muted-foreground/70" />
											<Text className="font-bold text-muted-foreground/80 text-xs">24 Lessons</Text>
										</View>
									</View>
								</View>
							</View>
						))}
					</ScrollView>
				</View>

				{/* Continue Learning */}
				<View className="px-5">
					<Text className="mb-5 font-extrabold text-2xl text-foreground">Continue Learning</Text>
					<Pressable className="flex-row items-center gap-5 rounded-3xl border border-border/60 bg-card p-5 shadow-black/5 shadow-xl active:bg-muted/10">
						<View className="size-16 items-center justify-center rounded-2xl bg-blue-100 shadow-inner dark:bg-blue-900/30">
							<Icon as={LayoutGridIcon} className="size-8 text-blue-500" />
						</View>
						<View className="flex-1 gap-2">
							<Text className="font-extrabold text-foreground text-lg leading-tight">
								Introduction to Physics
							</Text>
							<View className="h-2 overflow-hidden rounded-full bg-muted shadow-sm">
								<View className="h-full w-[65%] bg-primary" />
							</View>
							<Text className="font-bold text-muted-foreground text-xs uppercase tracking-wide">
								65% Completed • Next: Kinematics
							</Text>
						</View>
						<Icon as={ChevronRightIcon} className="size-5 text-muted-foreground" />
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}
