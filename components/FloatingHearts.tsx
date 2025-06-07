import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface FloatingHeartsProps {
	count?: number;
}

export default function FloatingHearts({ count = 6 }: FloatingHeartsProps) {
	const animations = useRef(
		Array.from({ length: count }, () => new Animated.Value(0))
	).current;

	useEffect(() => {
		const animatedHearts = animations.map((anim, i) =>
			Animated.timing(anim, {
				toValue: -200,
				duration: 1500 + Math.random() * 500,
				delay: i * 100,
				useNativeDriver: true,
			})
		);
		Animated.stagger(100, animatedHearts).start();
	}, []);

	return (
		<>
			{animations.map((yAnim, i) => {
				const left = Math.random() * (screenWidth - 50);
				return (
					<Animated.Text
						key={i}
						style={[
							styles.heart,
							{
								left,
								transform: [{ translateY: yAnim }],
								opacity: yAnim.interpolate({
									inputRange: [-200, 0],
									outputRange: [0, 1],
								}),
							},
						]}
					>
						💖
					</Animated.Text>
				);
			})}
		</>
	);
}

const styles = StyleSheet.create({
	heart: {
		position: 'absolute',
		bottom: 40,
		fontSize: 24,
		zIndex: 99,
	},
});
