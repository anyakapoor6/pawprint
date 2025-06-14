import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase'; // adjust path if different

export async function registerForPushAndSaveToken() {
	// Ask permission
	const { status } = await Notifications.requestPermissionsAsync();
	if (status !== 'granted') return;

	// Get token
	const tokenData = await Notifications.getExpoPushTokenAsync();
	const expoPushToken = tokenData.data;

	// Get current user ID
	const { data, error: userError } = await supabase.auth.getUser();
	const userId = data?.user?.id;

	// Save to Supabase
	if (userId && expoPushToken) {
		const { error } = await supabase
			.from('profiles')
			.upsert({
				id: userId,
				expo_push_token: expoPushToken,
			});

		if (error) console.error('Error saving push token:', error);
	}
}
