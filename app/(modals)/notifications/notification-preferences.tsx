import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function NotificationPreferencesScreen() {
	const router = useRouter();

	const [prefs, setPrefs] = useState({
		lostNearby: true,
		foundNearby: false,
		urgentCases: true,
		reportUpdates: true,
		aiMatches: true,
		newStories: false,
		storyEngagement: true,
		otherPostEngagement: false,
		weeklyDigest: false,
		productTips: false,
	});

	const toggle = (key: keyof typeof prefs) => {
		setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView style={styles.container}>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={router.back}>
						<ArrowLeft size={24} color={colors.text} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Notification Preferences</Text>
				</View>

				<Text style={styles.section}>Pet Reports</Text>
				<Toggle label="Lost pet reported near me" value={prefs.lostNearby} onToggle={() => toggle('lostNearby')} />
				<Toggle label="Found pet near me" value={prefs.foundNearby} onToggle={() => toggle('foundNearby')} />
				<Toggle label="Urgent case posted" value={prefs.urgentCases} onToggle={() => toggle('urgentCases')} />

				<Text style={styles.section}>My Reports</Text>
				<Toggle label="Updates on my lost/found report" value={prefs.reportUpdates} onToggle={() => toggle('reportUpdates')} />
				<Toggle label="New matches found (AI)" value={prefs.aiMatches} onToggle={() => toggle('aiMatches')} />

				<Text style={styles.section}>Community</Text>
				<Toggle label="New story published" value={prefs.newStories} onToggle={() => toggle('newStories')} />
				<Toggle label="Comments/likes on my story" value={prefs.storyEngagement} onToggle={() => toggle('storyEngagement')} />
				<Toggle label="Engagement on followed posts" value={prefs.otherPostEngagement} onToggle={() => toggle('otherPostEngagement')} />

				<Text style={styles.section}>App Activity</Text>
				<Toggle label="Weekly pet report digest" value={prefs.weeklyDigest} onToggle={() => toggle('weeklyDigest')} />
				<Toggle label="Product updates & tips" value={prefs.productTips} onToggle={() => toggle('productTips')} />
			</ScrollView>
		</SafeAreaView>
	);
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
	return (
		<View style={styles.toggleRow}>
			<Text style={styles.label}>{label}</Text>
			<Switch value={value} onValueChange={onToggle} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: colors.background,
		flex: 1,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginLeft: 12,
		color: colors.text,
	},
	section: {
		fontSize: 14,
		fontWeight: '700',
		color: colors.textSecondary,
		marginTop: 24,
		marginBottom: 8,
	},
	toggleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	label: {
		fontSize: 16,
		color: colors.text,
		flex: 1,
		marginRight: 16,
	},
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},

});
