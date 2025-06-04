import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false, // set to true if you want headers for nested pages
			}}
		/>
	);
}
