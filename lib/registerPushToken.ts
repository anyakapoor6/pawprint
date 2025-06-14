import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export async function registerForPushNotificationsAsync(userId: string) {
	if (!Device.isDevice) {
		Alert.alert('Push notifications only work on physical devices.');
		return;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		Alert.alert('Permission denied for push notifications.');
		return;
	}

	const token = (
		await Notifications.getExpoPushTokenAsync({
			projectId: 'YOUR_EXPO_PROJECT_ID', // <--- paste your real projectId here!
		})
	).data;

	console.log('Expo push token:', token);

	// Save token to Supabase
	const { error } = await supabase
		.from('profiles') // ✅ correct table name
		.update({ expo_push_token: token })
		.eq('id', userId);

	if (error) {
		console.error('Failed to save token to Supabase:', error.message);
	}


	// ✅ Return the token so SignIn can access it
	return token;

}
