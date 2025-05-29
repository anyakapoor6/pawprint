import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Award, Heart, Check, CreditCard as Edit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PetReport } from '@/types/pet';
import { colors } from '@/constants/colors';
import { useSavedPets } from '@/store/savedPets';
import { useAuth } from '@/store/auth';

interface PetCardProps {
  report: PetReport;
  onPress?: () => void;
  showSaveButton?: boolean;
  showResolveButton?: boolean;
  onResolve?: () => void;
}

export default function PetCard({ 
  report, 
  onPress, 
  showSaveButton = true,
  showResolveButton = false,
  onResolve
}: PetCardProps) {
  const { toggleSavedPet, isPetSaved } = useSavedPets();
  const { user } = useAuth();
  const router = useRouter();
  const formattedDate = new Date(report.dateReported).toLocaleDateString();
  const isSaved = isPetSaved(report.id);
  const isOwner = user?.id === report.userId;
  
  const handleSave = (e: any) => {
    e.stopPropagation();
    toggleSavedPet(report.id, report);
  };
  
  const handleResolve = (e: any) => {
    e.stopPropagation();
    onResolve?.();
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    router.push(`/report/edit/${report.id}`);
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: report.photos[0] }} 
          style={styles.image} 
          resizeMode="cover"
        />
        {report.isUrgent && report.status === 'active' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}
        <View style={[
          styles.typeBadge, 
          report.status === 'resolved' ? styles.resolvedBadge : 
          report.reportType === 'lost' ? styles.lostBadge : styles.foundBadge
        ]}>
          <Text style={styles.typeText}>
            {report.status === 'resolved' ? 'FOUND' :
             report.reportType === 'lost' ? 'LOST' : 'FOUND'}
          </Text>
        </View>
        {showSaveButton && !isOwner && (
          <TouchableOpacity 
            style={[styles.saveButton, isSaved && styles.savedButton]} 
            onPress={handleSave}
          >
            <Heart 
              size={16} 
              color={isSaved ? colors.error : colors.white}
              fill={isSaved ? colors.error : 'transparent'}
            />
          </TouchableOpacity>
        )}
        {isOwner && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Edit size={16} color={colors.white} />
          </TouchableOpacity>
        )}
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

        {report.reward && report.status === 'active' && (
          <View style={styles.rewardContainer}>
            <Award size={14} color={colors.accent} />
            <Text style={styles.rewardText}>
              ${report.reward.amount} Reward
            </Text>
          </View>
        )}

        {showResolveButton && report.status === 'active' && (
          <TouchableOpacity 
            style={styles.resolveButton}
            onPress={handleResolve}
          >
            <Check size={14} color={colors.white} />
            <Text style={styles.resolveButtonText}>Mark as Found</Text>
          </TouchableOpacity>
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
  resolvedBadge: {
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
  saveButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: colors.white,
  },
  editButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  resolveButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export { PetCard };