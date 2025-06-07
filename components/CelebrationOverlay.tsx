// components/CelebrationOverlay.tsx
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function CelebrationOverlay({ onDone }: { onDone?: () => void }) {
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const [burst, setBurst] = useState(false);
	const [burstHearts] = useState(
		Array.from({ length: 10 }, () => ({
			x: Math.random() * width,
			delay: Math.random() * 300,
			anim: new Animated.Value(0),
		}))
	);

	useEffect(() => {
		// Step 1: Grow big heart
		Animated.timing(scaleAnim, {
			toValue: 1.5,
			duration: 700,
			useNativeDriver: true,
		}).start(() => {
			// Step 2: Trigger burst
			setBurst(true);
			burstHearts.forEach(({ anim, delay }) => {
				Animated.timing(anim, {
					toValue: -height,
					duration: 1000,
					delay,
					useNativeDriver: true,
				}).start();
			});
			// Step 3: Dismiss after animation
			setTimeout(() => onDone?.(), 1500);
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
					💖
				</Animated.Text>
			)}
			{burst &&
				burstHearts.map(({ x, anim }, i) => (
					<Animated.Text
						key={i}
						style={[
							styles.burstHeart,
							{
								left: x,
								transform: [{ translateY: anim }],
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
		fontSize: 80,
		position: 'absolute',
		top: height / 2 - 40,
		left: width / 2 - 40,
		zIndex: 999,
	},
	burstHeart: {
		fontSize: 24,
		position: 'absolute',
		bottom: 40,
		zIndex: 998,
	},
});
