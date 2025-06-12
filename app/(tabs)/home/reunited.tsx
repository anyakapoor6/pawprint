// import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';
// import { usePets } from '@/store/pets';
// import { isNearMe } from '@/components/isNearMe';
// import PetCard from '@/components/PetCard';
// import * as Location from 'expo-location';
// import { useEffect, useState } from 'react';
// import { colors } from '@/constants/colors';

// export default function ReunitedPetsScreen() {
// 	const router = useRouter();
// 	const { petReports } = usePets();
// 	const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

// 	useEffect(() => {
// 		(async () => {
// 			const { status } = await Location.requestForegroundPermissionsAsync();
// 			if (status !== 'granted') return;

// 			const loc = await Location.getCurrentPositionAsync({});
// 			setLocation({
// 				latitude: loc.coords.latitude,
// 				longitude: loc.coords.longitude,
// 			});
// 		})();
// 	}, []);

// 	const reunitedReports = petReports.filter(
// 		(report) =>
// 			report.status === 'reunited' &&
// 			location &&
// 			isNearMe(report.lastSeenLocation, location)
// 	);

// 	return (
// 		<ScrollView style={styles.container}>
// 			<Text style={styles.header}>Reunited Pets Near You</Text>
// 			{reunitedReports.length > 0 ? (
// 				reunitedReports.map((report) => (
// 					<PetCard
// 						key={report.id}
// 						report={report}
// 						onPress={() => router.push(`/pet/${report.id}`)}
// 					/>
// 				))
// 			) : (
// 				<Text style={styles.empty}>No reunited pets near you yet.</Text>
// 			)}
// 		</ScrollView>
// 	);
// }

// const styles = StyleSheet.create({
// 	container: {
// 		padding: 16,
// 		backgroundColor: colors.background,
// 	},
// 	header: {
// 		fontSize: 20,
// 		fontWeight: '600',
// 		color: colors.text,
// 		marginBottom: 16,
// 	},
// 	empty: {
// 		fontSize: 16,
// 		color: colors.textSecondary,
// 		textAlign: 'center',
// 		marginTop: 20,
// 	},
// });
