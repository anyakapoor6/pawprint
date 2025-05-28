import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Award } from 'lucide-react-native';
import { PetReport } from '@/types/pet';
import { colors } from '@/constants/colors';

interface PetCardProps {
  report: PetReport;
  onNavigate?: () => void;
}

export default function PetCard({ report, onNavigate }: PetCardProps) {
  const router = useRouter();
  const formattedDate = new Date(report.dateReported).toLocaleDateString();
  
  const handlePress = () => {
    if (onNavigate) {
      onNavigate();
    }
    setTimeout(() => {
      router.push(`/pet/${report.id}`);
    }, 0);
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: report.photos[0] }} 
          style={styles.image} 
          resizeMode="cover"
        />
        {report.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        <View style={[
          styles.typeBadge, 
          report.reportType === 'lost' ? styles.lostBadge : styles.foundBadge
        ]}>
          <Text style={styles.typeText}>
            {report.reportType === 'lost' ? 'LOST' : 'FOUND'}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {report.name || `${report.type} (${report.color})`}
        </Text>
        
        <View style={styles.infoRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {report.lastSeenLocation?.address || 'Location unknown'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{formattedDate}</Text>
        </View>

        {report.reward && (
          <View style={styles.rewardContainer}>
            <Award size={14} color={colors.accent} />
            <Text style={styles.rewardText}>
              ${report.reward.amount} Reward
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.urgent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  lostBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.85)',
  },
  foundBadge: {
    backgroundColor: 'rgba(80, 200, 120, 0.85)',
  },
  typeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rewardText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});