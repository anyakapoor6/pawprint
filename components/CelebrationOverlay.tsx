import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CelebrationOverlay({ onDone }: { onDone?: () => void }) {
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const [burst, setBurst] = useState(false);

	useEffect(() => {
		// Wait until after all interactions/rendering to avoid useInsertionEffect warning
		InteractionManager.runAfterInteractions(() => {
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}).start(() => {
				setBurst(true);

				setTimeout(() => {
					onDone?.();
				}, 1500);
			});
		});
	}, []);

	return (
		<View style={StyleSheet.absoluteFillObject}>
			{!burst && (
				<Animated.Text
					style={[
						styles.bigHeart,
						{
							transform: [{ scale: scaleAnim }],
							opacity: scaleAnim.interpolate({
								inputRange: [0, 1],
								outputRange: [0, 1],
							}),
						},
					]}
				>
					❤️
				</Animated.Text>
			)}

			{burst &&
				Array.from({ length: 16 }).map((_, i) => (
					<Text
						key={i}
						style={[
							styles.burstHeart,
							{
								top: Math.random() * height,
								left: Math.random() * width,
							},
						]}
					>
						💖
					</Text>
				))}
		</View>
	);
}

const styles = StyleSheet.create({
	bigHeart: {
		position: 'absolute',
		top: height / 2 - 60,
		left: width / 2 - 60,
		fontSize: 120,
		zIndex: 100,
	},
	burstHeart: {
		position: 'absolute',
		fontSize: 24,
		opacity: 0.8,
	},
});
