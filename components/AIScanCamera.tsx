import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Layers, List, MapPin, Navigation, Search, Filter, TriangleAlert as AlertTriangle, X, RefreshCw, Scan } from 'lucide-react-native';
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
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const analyzeImage = async (imageUri: string): Promise<AIAnalysis> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call a vision API
    // For demo, return realistic analysis that matches some mock data
    return {
      petType: 'dog',
      breed: ['Golden Retriever'],
      color: ['golden', 'cream'],
      size: 'large',
      features: ['long fur', 'collar', 'friendly face'],
      confidence: 0.92,
      distinctiveMarks: ['white patch on chest'],
      estimatedAge: '3-4 years',
      furLength: 'long',
      furPattern: 'solid'
    };
  };

  const findMatches = (analysis: AIAnalysis): PetReport[] => {
    // Calculate match scores for each report
    const matches = mockReports.map(report => {
      let score = 0;
      const maxScore = 100;

      // Only match same pet types (critical)
      if (report.type.toLowerCase() !== analysis.petType.toLowerCase()) {
        return { report, score: 0 };
      }

      // Breed matching (30 points)
      if (report.breed) {
        const breedScore = analysis.breed.some(breed => 
          report.breed?.toLowerCase().includes(breed.toLowerCase())
        ) ? 30 : 0;
        score += breedScore;
      }

      // Color matching (25 points)
      const reportColors = report.color.toLowerCase().split(/[,\s]+/);
      const colorMatches = analysis.color.filter(c => 
        reportColors.some(rc => rc.includes(c.toLowerCase()))
      );
      score += (colorMatches.length / analysis.color.length) * 25;

      // Size matching (15 points)
      if (report.size.toLowerCase() === analysis.size.toLowerCase()) {
        score += 15;
      }

      // Feature matching (20 points)
      const descriptionLower = report.description.toLowerCase();
      const featureMatches = analysis.features.filter(f => 
        descriptionLower.includes(f.toLowerCase())
      );
      score += (featureMatches.length / analysis.features.length) * 20;

      // Distinctive marks matching (10 points)
      const markMatches = analysis.distinctiveMarks.filter(mark =>
        descriptionLower.includes(mark.toLowerCase())
      );
      score += (markMatches.length / analysis.distinctiveMarks.length) * 10;

      // Apply confidence factor
      score *= analysis.confidence;

      return { report, score };
    });

    // Return top matches with score > 70%
    return matches
      .sort((a, b) => b.score - a.score)
      .filter(m => m.score > 70)
      .map(m => m.report)
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
      const matchedPets = findMatches(analysis);

      onCapture(photo.uri, matchedPets, analysis);
    } catch (error) {
      onError("Connection error. Please check your network.");
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
        <Text style={styles.text}>Loading camera permissions...</Text>
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
        ref={cameraRef}
        style={styles.camera} 
        type={type}
        ratio="16:9"
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
            {scanning ? 'Analyzing image...' : 'Position the pet in the frame and tap Scan'}
          </Text>
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
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
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