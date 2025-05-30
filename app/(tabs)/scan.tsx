import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import AIScanCamera from '@/components/AIScanCamera';
import ScanResults from '@/components/ScanResults';

export default function ScanScreen() {
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [matches, setMatches] = useState<PetReport[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (uri: string, matchedPets: PetReport[], analysis: any) => {
    setError(null);
    setScannedImage(uri);
    setMatches(matchedPets);
    setAiAnalysis(analysis);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleClose = () => {
    setScannedImage(null);
    setMatches([]);
    setAiAnalysis(null);
    setError(null);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scannedImage && matches.length > 0) {
    return (
      <ScanResults
        scannedImage={scannedImage}
        matches={matches}
        aiAnalysis={aiAnalysis}
        onClose={handleClose}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AIScanCamera
        onCapture={handleCapture}
        onError={handleError}
        onCancel={handleClose}
      />
    </View>
  );
}

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <Text>ScanScreen Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});