import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
	return (
		<View style={{ flex: 1, padding: 20 }}>
			<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to PawPrint</Text>

			<Link href="/home/found" asChild>
				<TouchableOpacity style={{ marginTop: 20 }}>
					<Text>View Found Pets</Text>
				</TouchableOpacity>
			</Link>

			<Link href="/home/recent" asChild>
				<TouchableOpacity style={{ marginTop: 10 }}>
					<Text>Recent Reports</Text>
				</TouchableOpacity>
			</Link>

			{/* Add other links as needed */}
		</View>
	);
}
