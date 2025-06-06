import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Heart, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { usePetInteractions } from '@/store/petInteractions';
import { Dimensions } from 'react-native';


interface MiniPetCardProps {
	report: PetReport;
	onPress?: () => void;
	style?: any;
}

export default function MiniPetCard({ report, onPress, style }: MiniPetCardProps) {
	const router = useRouter();
	const { getLikeCount, getComments, isLiked } = usePetInteractions();
	const likeCount = getLikeCount(report.id);
	const commentCount = getComments(report.id).length;
	const formattedDate = new Date(report.dateReported).toLocaleDateString();

	return (
		<TouchableOpacity
			style={[styles.card, style]} // merge parent style
			onPress={onPress ?? (() => router.push(`/pet/${report.id}`))}
		>
			<Image source={{ uri: report.photos[0] }} style={styles.image} />
			<View style={styles.infoContainer}>
				<View style={styles.topRow}>
					<Text style={styles.name} numberOfLines={1}>{report.name || report.type}</Text>
					<Text style={styles.date}>{formattedDate}</Text>
				</View>
				<View style={styles.locationRow}>
					<MapPin size={12} color={colors.textSecondary} />
					<Text style={styles.location} numberOfLines={1}>
						{report.lastSeenLocation?.address || 'Unknown'}
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
});
