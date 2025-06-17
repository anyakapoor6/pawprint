import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Heart, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { UserReport } from '@/lib/user';
import { usePetInteractions } from '@/store/petInteractions';
import { Dimensions } from 'react-native';
import { useAuth } from '@/store/auth';
import { Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
//import CelebrationOverlay from '@/components/CelebrationOverlay';

interface MiniPetCardProps {
	report: UserReport;
	onPress?: () => void;
	style?: any;
	showResolveButton?: boolean;
	onResolve?: () => void;
}

export default function MiniPetCard({ report, onPress, style, showResolveButton, onResolve }: MiniPetCardProps) {
	const router = useRouter();
	const { user } = useAuth();
	const { getLikeCount, getComments, isLiked } = usePetInteractions();
	const likeCount = getLikeCount(report.id);
	const commentCount = getComments(report.id).length;
	const formattedDate = new Date(report.created_at).toLocaleDateString();
	const [showHearts, setShowHearts] = useState(false);
	const heartAnim = useRef(new Animated.Value(0)).current;
	const [showHeartBurst, setShowHeartBurst] = useState(false);
	const [showCelebration, setShowCelebration] = useState(false);

	const triggerHeartBurst = () => {
		setShowHeartBurst(true);
		setTimeout(() => setShowHeartBurst(false), 2500);
	};

	return (
		<TouchableOpacity
			style={[styles.card, style]}
			onPress={onPress ?? (() => router.push(`/pet/${report.id}`))}
		>
			<View>
				{showResolveButton && report.status === 'pending' && user?.id === report.user_id && (
					<TouchableOpacity
						style={styles.resolveButton}
						onPress={(e) => {
							e.stopPropagation?.();
							onResolve?.();
							setTimeout(() => setShowCelebration(true), 800);
						}}
					>
						<Text style={styles.resolveText}>Mark as Reunited</Text>
					</TouchableOpacity>
				)}

				<View
					style={[
						styles.badge,
						{
							backgroundColor:
								report.status === 'resolved'
									? '#fcb6d0' // pink
									: report.report_type === 'lost'
										? colors.error // red
										: colors.success, // green
						},
					]}
				>
					<Text style={styles.badgeText}>
						{report.status === 'resolved'
							? 'Reunited'
							: report.report_type === 'lost'
								? 'Lost'
								: 'Found'}
					</Text>
				</View>

				<Image source={{ uri: report.photos[0] }} style={styles.image} />
			</View>

			<View style={styles.infoContainer}>
				<View style={styles.topRow}>
					<Text style={styles.name} numberOfLines={1}>
						{report.pet_name || report.pet_type}
					</Text>
					<Text style={styles.date}>{formattedDate}</Text>
				</View>
				<View style={styles.locationRow}>
					<MapPin size={12} color={colors.textSecondary} />
					<Text style={styles.location} numberOfLines={1}>
						{report.last_seen_location?.address || 'Unknown'}
					</Text>
				</View>
				<View style={styles.interactionRow}>
					<View style={styles.iconRow}>
						<Heart
							size={14}
							color={isLiked(report.id) ? colors.error : colors.textSecondary}
							fill={isLiked(report.id) ? colors.error : 'transparent'}
						/>
						<Text style={styles.iconText}>{likeCount}</Text>
					</View>
					<View style={styles.iconRow}>
						<MessageCircle size={14} color={colors.textSecondary} />
						<Text style={styles.iconText}>{commentCount}</Text>
					</View>
				</View>
			</View>

			{showHeartBurst && <FloatingHearts count={15} />}
			{/* {showCelebration && <CelebrationOverlay onDone={() => setShowCelebration(false)} />} */}

			{/* {showHearts && (
				<Animated.Text
					style={{
						position: 'absolute',
						top: 30,
						right: 10,
						fontSize: 24,
						zIndex: 99,
						transform: [{ translateY: heartAnim }],
						opacity: heartAnim.interpolate({
							inputRange: [-50, 0],
							outputRange: [0, 1],
						}),
					}}
				>
					💖
				</Animated.Text>
			)} */}

		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		width: (Dimensions.get('window').width - 16 * 2 - 12 - 8) / 2,
		borderRadius: 10,
		backgroundColor: colors.white,
		overflow: 'hidden',
		elevation: 1,
		marginBottom: 16,
	},
	image: {
		width: '100%',
		height: 100,
	},
	infoContainer: {
		padding: 8,
	},
	badge: {
		position: 'absolute',
		top: 6,
		left: 6,
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 2,
		zIndex: 10,
	},
	badgeText: {
		color: colors.white,
		fontSize: 10,
		fontWeight: '600',
	},

	topRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	name: {
		fontWeight: '600',
		fontSize: 14,
		color: colors.text,
		flexShrink: 1,
		maxWidth: '65%',
	},
	date: {
		fontSize: 12,
		color: colors.textSecondary,
	},
	locationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	location: {
		fontSize: 12,
		color: colors.textSecondary,
		marginLeft: 4,
		flex: 1,
	},
	interactionRow: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		gap: 12,
	},
	iconRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	iconText: {
		fontSize: 12,
		color: colors.textSecondary,
	},
	resolveButton: {
		position: 'absolute',
		top: 6,
		right: 6,
		backgroundColor: '#fcb6d0',
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 2,
		zIndex: 10,
	},

	resolveText: {
		color: colors.white,
		fontSize: 10,
		fontWeight: '600',
	},

});
