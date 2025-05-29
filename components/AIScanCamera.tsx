import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, RefreshCw, Scan } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport } from '@/types/pet';
import { mockReports } from '@/data/mockData';

interface AIScanCameraProps {
  onCapture: (uri: string, matches: PetReport[], aiAnalysis: any) => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

interface AIAnalysis {
  petType: string;
  breed: string[];
  color: string[];
  size: string;
  features: string[];
  confidence: number;
  distinctiveMarks: string[];
  estimatedAge: string;
  furLength?: string;
  furPattern?: string;
}

export default function AIScanCamera({ onCapture, onError, onCancel }: AIScanCameraProps) {
  const [type, setType] = useState<CameraType>('back');
  const [scanning, setScanning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const analyzeImage = async (imageUri: string): Promise<AIAnalysis> => {
    // Simulate AI processing with retry logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      throw new Error('Connection error');
    }
    
    return {
      petType: 'dog',
      breed: ['Golden Retriever', 'Labrador Retriever'],
      color: ['golden', 'cream'],
      size: 'large',
      features: ['long fur', 'pointed ears', 'collar'],
      confidence: 0.85,
      distinctiveMarks: ['white patch on chest', 'small scar above right eye'],
      estimatedAge: '2-4 years',
      furLength: 'long',
      furPattern: 'solid'
    };
  };

  const findMatches = (analysis: AIAnalysis): PetReport[] => {
    // Enhanced matching algorithm with fuzzy matching
    return mockReports
      .map(report => {
        let score = 0;
        const maxScore = 100;

        // Type matching (30 points)
        if (report.type.toLowerCase() === analysis.petType.toLowerCase()) {
          score += 30;
        }

        // Breed matching (20 points)
        if (report.breed) {
          const breedMatches = analysis.breed.some(breed => 
            report.breed!.toLowerCase().includes(breed.toLowerCase())
          );
          if (breedMatches) score += 20;
        }

        // Color matching (15 points)
        const reportColors = report.color.toLowerCase().split(/[,\s]+/);
        const colorMatches = analysis.color.filter(c => 
          reportColors.some(rc => rc.includes(c.toLowerCase()))
        );
        score += (colorMatches.length / analysis.color.length) * 15;

        // Feature matching (20 points)
        const descriptionLower = report.description.toLowerCase();
        const featureMatches = analysis.features.filter(f => 
          descriptionLower.includes(f.toLowerCase())
        );
        score += (featureMatches.length / analysis.features.length) * 20;

        // Size matching (15 points)
        if (report.size.toLowerCase() === analysis.size.toLowerCase()) {
          score += 15;
        }

        return { report, score: score * analysis.confidence };
      })
      .filter(({ score }) => score > 60) // Increased threshold for better matches
      .sort((a, b) => b.score - a.score)
      .map(({ report }) => report)
      .slice(0, 3);
  };

  const scanImage = async () => {
    if (!cameraRef.current || scanning) return;

    try {
      setScanning(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      const analysis = await analyzeImage(photo.uri);
      const matches = findMatches(analysis);

      if (matches.length === 0) {
        onError('No matching pets found. Try scanning from a different angle or adjust the lighting.');
      } else {
        onCapture(photo.uri, matches, analysis);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Connection error') {
        onError('Connection error. Please check your internet connection and try again.');
      } else {
        onError('Failed to process image. Please try again.');
      }
    } finally {
      setScanning(false);
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera</Text>
        <Text style={styles.subtext}>
          The camera is used to scan and match pets with our database
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        type={type}
        ref={cameraRef}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <X size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.scanCorner, styles.topLeft]} />
            <View style={[styles.scanCorner, styles.topRight]} />
            <View style={[styles.scanCorner, styles.bottomLeft]} />
            <View style={[styles.scanCorner, styles.bottomRight]} />
          </View>
          
          <Text style={styles.instructions}>
            {scanning ? 'Analyzing image...' : 'Position the pet clearly in the frame'}
          </Text>
          {scanning && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          )}
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraType}
          >
            <RefreshCw size={24} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.scanButton, scanning && styles.scanningButton]} 
            onPress={scanImage}
            disabled={scanning}
          >
            <Scan 
              size={32} 
              color={colors.white}
              style={scanning ? styles.scanningIcon : undefined}
            />
            <Text style={styles.scanButtonText}>
              {scanning ? 'Scanning...' : 'Scan Pet'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.emptySpace} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  text: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  subtext: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 24,
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  instructions: {
    color: colors.white,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  flipButton: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningButton: {
    opacity: 0.8,
  },
  scanningIcon: {
    opacity: 0.8,
    transform: [{ scale: 0.9 }],
  },
  scanButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptySpace: {
    width: 48,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 40,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    padding: 16,
    marginHorizontal: 40,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});