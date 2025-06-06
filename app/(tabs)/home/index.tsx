import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Clock, MapPin, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockReports } from '@/data/mockData';
import { useStories } from '@/store/stories';
import PetCard from '@/components/PetCard';
import StoryCard from '@/components/StoryCard';
import Header from '@/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePets } from '@/store/pets';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { isNearMe } from '@/components/isNearMe';


type SectionProps = {
	title: string;
	iconColor: string;
	onSeeAll: () => void;
	children: React.ReactNode;
	icon: React.ReactNode;
};

function Section({ title, iconColor, onSeeAll, children, icon }: SectionProps) {
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<View style={styles.sectionTitleWrap}>
					{icon}
					<Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
				</View>
				<TouchableOpacity onPress={onSeeAll}>
					<Text style={styles.seeAll}>See All</Text>
				</TouchableOpacity>
			</View>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.background,
		paddingBottom: 40,
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 24,
		paddingHorizontal: 20,
		color: colors.text,
	},
	section: {
		marginBottom: 32,
		paddingHorizontal: 16,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	sectionTitleWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
	},
	seeAll: {
		fontSize: 14,
		fontWeight: '500',
		color: colors.primary,
	},
	cardSpacing: {
		marginRight: 12,
	},
});

export default function HomeScreen() {
	const { stories } = useStories();
	const { reports } = usePets();
	const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;

			const location = await Location.getCurrentPositionAsync({});
			setUserLocation(location.coords);
		})();
	}, []);


	const urgentReports = reports
		.filter(r =>
			r.isUrgent &&
			r.status !== 'reunited' &&
			r.lastSeenLocation &&
			userLocation &&
			isNearMe(r.lastSeenLocation, userLocation)
		)

	const recentReports = reports
		.filter(r =>
			r.status !== 'reunited' &&
			r.lastSeenLocation &&
			userLocation &&
			isNearMe(r.lastSeenLocation, userLocation)
		)
		.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())


	const foundPets = reports.filter(
		(r) =>
			r.reportType === 'found' &&
			r.status !== 'reunited' &&
			r.lastSeenLocation &&
			userLocation &&
			isNearMe(r.lastSeenLocation, userLocation)
	)



	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				<Header />
				<Text style={styles.title}>Find Your Lost Pet</Text>

				<Section
					title="Urgent Cases Near Me"
					iconColor={colors.urgent}
					onSeeAll={() => router.push('/home/urgent')}
					icon={<AlertTriangle size={25} color={colors.urgent} />}
				>
					<FlatList
						data={urgentReports.slice(0, 5)}
						horizontal
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View style={{ marginRight: 12 }}>
								<PetCard report={item} />
							</View>
						)}

						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingRight: 16 }} // make space for the last card
					/>




				</Section>

				<Section
					title="Recently Reported Near Me"
					iconColor={colors.secondary}
					onSeeAll={() => router.push('/home/recent')}
					icon={<Clock size={25} color={colors.secondary} />}
				>
					<FlatList
						data={recentReports.slice(0, 5)}
						horizontal
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View style={{ marginRight: 12 }}>
								<PetCard report={item} />
							</View>
						)}

						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingRight: 16 }} // make space for the last card
					/>


				</Section>

				<Section
					title="Found Pets Near Me"
					iconColor={colors.primary}
					onSeeAll={() => router.push('/home/found')}
					icon={<MapPin size={25} color={colors.primary} />}
				>
					<FlatList
						data={foundPets.slice(0, 5)}
						horizontal
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View style={{ marginRight: 12 }}>
								<PetCard report={item} />
							</View>
						)}

						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingRight: 16 }} // make space for the last card
					/>




				</Section>

				<Section
					title="Storyboard"
					iconColor={colors.accent}
					onSeeAll={() => router.push('/home/stories')}
					icon={<Heart size={25} color={colors.accent} />}
				>
					{stories.length > 0 && <StoryCard story={stories[0]} />}
				</Section>
			</ScrollView>
		</SafeAreaView>
	);
}
