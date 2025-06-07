import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function CelebrationOverlay({ onDone }: { onDone?: () => void }) {
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const [burst, setBurst] = useState(false);

	useEffect(() => {
		// Animate the big heart growing
		Animated.timing(scaleAnim, {
			toValue: 1,
			duration: 1000,
			useNativeDriver: true,
		}).start(() => {
			// After it grows, trigger burst
			setBurst(true);

			// Wait for burst to finish, then clean up
			setTimeout(() => {
				onDone?.();
			}, 1500);
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
				Array.from({ length: 20 }).map((_, i) => (
					<Animated.Text
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
					</Animated.Text>
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
