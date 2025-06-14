import Constants from 'expo-constants';
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

	const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 'a2fbb212-504b-4044-8600-d1ad9b9af927';

	const token = (await Notifications.getExpoPushTokenAsync({
		projectId,
	})).data;

	console.log('Expo push token:', token);

	const { error } = await supabase
		.from('profiles')
		.update({ expo_push_token: token })
		.eq('id', userId);

	if (error) {
		console.error('Failed to save token to Supabase:', error.message);
	}

	return token;
}
