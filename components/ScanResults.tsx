import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { X, ArrowRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';

interface ScanResultsProps {
  scannedImage: string;
  matches: PetReport[];
  aiAnalysis: {
    petType: string;
    breed: string[];
    color: string[];
    size: string;
    features: string[];
    distinctiveMarks: string[];
    estimatedAge: string;
    furLength?: string;
    furPattern?: string;
  };
  onClose: () => void;
}

export default function ScanResults({ scannedImage, matches, aiAnalysis, onClose }: ScanResultsProps) {
  const router = useRouter();

  const handleReportFound = () => {
    // Create report data from AI analysis
    const reportData = {
      type: aiAnalysis.petType,
      breed: aiAnalysis.breed[0], // Use most likely breed
      color: aiAnalysis.color.join(', '),
      size: aiAnalysis.size.toLowerCase(),
      description: `${aiAnalysis.furLength || ''} ${aiAnalysis.furPattern || ''} ${aiAnalysis.petType}. Distinctive features: ${aiAnalysis.distinctiveMarks.join(', ')}. ${aiAnalysis.features.join(', ')}.`.trim(),
      photo: scannedImage,
      estimatedAge: aiAnalysis.estimatedAge,
    };

    // Store the data temporarily (you'd want to use a proper state management solution in a real app)
    global.scanReportData = reportData;

    // Navigate to report form with type=found
    router.push('/report');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Results</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.scannedImageContainer}>
          <Image
            source={{ uri: scannedImage }}
            style={styles.scannedImage}
            resizeMode="cover"
          />
          <Text style={styles.scannedLabel}>Scanned Photo</Text>
        </View>

        <View style={styles.aiAnalysisContainer}>
          <Text style={styles.aiAnalysisTitle}>AI Analysis</Text>
          <View style={styles.aiAnalysisDetails}>
            <Text style={styles.aiAnalysisText}>
              Detected a {aiAnalysis.furLength} {aiAnalysis.furPattern} {aiAnalysis.petType}
            </Text>
            <Text style={styles.aiAnalysisText}>
              Likely breed: {aiAnalysis.breed.join(' or ')}
            </Text>
            <Text style={styles.aiAnalysisText}>
              Color: {aiAnalysis.color.join(', ')}
            </Text>
            {aiAnalysis.distinctiveMarks.length > 0 && (
              <Text style={styles.aiAnalysisText}>
                Distinctive marks: {aiAnalysis.distinctiveMarks.join(', ')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.matchesContainer}>
          <Text style={styles.matchesTitle}>
            Found {matches.length} potential matches
          </Text>

          {matches.map((match, index) => (
            <Link key={match.id} href={`/pet/${match.id}`} asChild>
              <TouchableOpacity style={styles.matchItem}>
                <Image
                  source={{ uri: match.photos[0] }}
                  style={styles.matchImage}
                  resizeMode="cover"
                />
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {match.name || `${match.type} (${match.color})`}
                  </Text>
                  <Text style={styles.matchDetails} numberOfLines={1}>
                    {match.breed || match.type}, {match.color}
                  </Text>
                  <Text style={styles.matchLocation} numberOfLines={1}>
                    {match.lastSeenLocation?.address || 'Location unknown'}
                  </Text>
                </View>
                <View style={styles.matchAction}>
                  <Text style={styles.matchPercent}>{90 - index * 10}%</Text>
                  <Text style={styles.matchMatch}>match</Text>
                  <ArrowRight size={20} color={colors.primary} style={styles.matchArrow} />
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchTitle}>Don't see a match?</Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportFound}
          >
            <Text style={styles.reportButtonText}>Report as Found Pet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scannedImageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  scannedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  scannedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  aiAnalysisContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  aiAnalysisDetails: {
    gap: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  matchesContainer: {
    padding: 16,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  matchItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  matchAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  matchPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  matchMatch: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  matchArrow: {
    marginTop: 4,
  },
  noMatchContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noMatchTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  reportButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  reportButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});