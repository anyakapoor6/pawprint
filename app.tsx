// App.tsx
import { useEffect } from 'react';
import Constants from 'expo-constants';
import { Slot } from 'expo-router';
import React from 'react';


export default function App() {
	useEffect(() => {
		const config = Constants.expoConfig;
		if (config?.extra && !config.extra.eas?.projectId) {
			config.extra.eas = { projectId: 'a2fbb212-504b-4044-8600-d1ad9b9af927' };
		}
	}, []);

	return <Slot />;
}
