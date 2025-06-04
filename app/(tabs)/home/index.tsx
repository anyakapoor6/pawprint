import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useStories } from '@/store/stories';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import StoryCard from '@/components/StoryCard';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
	const { stories } = useStories();
	const urgentReports = mockReports.filter(r => r.isUrgent).slice(0, 5);
	const recentReports = [...mockReports].sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()).slice(0, 5);
	const foundReports = mockReports.filter(r => r.reportType === 'found' && r.status === 'active').slice(0, 5);

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
			<View style={styles.header}>
				<Text style={styles.appName}>PawPrint</Text>
				<Text style={styles.tagline}>Connect, Care, and Share in Your Pet Community</Text>
			</View>

			<Section title="Urgent Cases" iconColor={colors.urgent} onSeeAll={() => router.push('/home/urgent')}>
				<FlatList
					horizontal
					data={urgentReports}
					keyExtractor={item => item.id}
					renderItem={({ item }) => (
						<View style={styles.cardSpacing}>
							<PetCard report={item} onPress={() => router.push(`/pet/${item.id}`)} />
						</View>

					)}
					showsHorizontalScrollIndicator={false}
				/>
			</Section>

			<Section title="Recently Reported" iconColor={colors.primary} onSeeAll={() => router.push('/home/recent')}>
				<FlatList
					horizontal
					data={recentReports}
					keyExtractor={item => item.id}
					renderItem={({ item }) => (
						<View style={styles.cardSpacing}>
							<PetCard report={item} onPress={() => router.push(`/pet/${item.id}`)} />
						</View>

					)}
					showsHorizontalScrollIndicator={false}
				/>
			</Section>

			<Section title="Found Pets Near Me" iconColor={colors.secondary} onSeeAll={() => router.push('/home/found')}>
				<FlatList
					horizontal
					data={foundReports}
					keyExtractor={item => item.id}
					renderItem={({ item }) => (
						<View style={styles.cardSpacing}>
							<PetCard report={item} onPress={() => router.push(`/pet/${item.id}`)} />
						</View>

					)}
					showsHorizontalScrollIndicator={false}
				/>
			</Section>

			<Section title="Storyboard" iconColor={colors.orange} onSeeAll={() => router.push('/home/stories')}>
				{stories.length > 0 && <StoryCard story={stories[0]} />}
			</Section>
		</ScrollView>
	);
}
type SectionProps = {
	title: string;
	iconColor: string;
	onSeeAll: () => void;
	children: React.ReactNode;
};

function Section({ title, iconColor, onSeeAll, children }: SectionProps) {
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<Text style={[styles.sectionTitle, { color: iconColor }]}>{title}</Text>
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
	},
	header: {
		paddingTop: 60,
		paddingHorizontal: 20,
		paddingBottom: 24,
		backgroundColor: colors.white,
	},
	appName: {
		fontSize: 22,
		fontWeight: '700',
		color: colors.primary,
	},
	tagline: {
		fontSize: 16,
		fontWeight: '500',
		marginTop: 6,
		color: colors.text,
	},
	section: {
		marginTop: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		marginBottom: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
	},
	seeAll: {
		fontSize: 14,
		color: colors.primary,
		fontWeight: '500',
	},
	cardSpacing: {
		marginLeft: 20,
	},
});
