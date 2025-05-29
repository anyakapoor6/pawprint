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

// Comprehensive breed database with visual characteristics
const BREED_DATABASE = {
  dog: {
    'Golden Retriever': {
      characteristics: ['long fur', 'golden coat', 'friendly face', 'medium to large size'],
      colors: ['golden', 'cream', 'light golden'],
      size: 'large',
      furType: 'long',
      bodyFeatures: ['floppy ears', 'feathered tail', 'broad head'],
      visualMarkers: ['white chest patch', 'light feathering']
    },
    'Labrador Retriever': {
      characteristics: ['short fur', 'athletic build', 'broad head', 'medium to large size'],
      colors: ['black', 'yellow', 'chocolate'],
      size: 'large',
      furType: 'short',
      bodyFeatures: ['otter tail', 'broad head', 'muscular build'],
      visualMarkers: ['white chest patch', 'solid color']
    },
    'German Shepherd': {
      characteristics: ['pointed ears', 'sloped back', 'medium to large size'],
      colors: ['black and tan', 'sable', 'black'],
      size: 'large',
      furType: 'medium',
      bodyFeatures: ['erect ears', 'bushy tail', 'strong jaw'],
      visualMarkers: ['saddle pattern', 'mask']
    },
    'Husky': {
      characteristics: ['thick fur', 'pointed ears', 'medium size'],
      colors: ['black and white', 'grey and white', 'red and white'],
      size: 'medium',
      furType: 'thick',
      bodyFeatures: ['erect ears', 'curved tail', 'facial mask'],
      visualMarkers: ['mask pattern', 'bi-color coat']
    }
  },
  cat: {
    'Siamese': {
      characteristics: ['short fur', 'pointed coloration', 'slim build'],
      colors: ['seal point', 'chocolate point', 'blue point'],
      size: 'medium',
      furType: 'short',
      bodyFeatures: ['almond eyes', 'large ears', 'slim body'],
      visualMarkers: ['point coloration', 'dark face']
    },
    'Persian': {
      characteristics: ['long fur', 'flat face', 'round body'],
      colors: ['white', 'cream', 'blue'],
      size: 'medium',
      furType: 'long',
      bodyFeatures: ['round face', 'small ears', 'thick coat'],
      visualMarkers: ['flat face', 'long coat']
    },
    'Maine Coon': {
      characteristics: ['very long fur', 'large size', 'tufted ears'],
      colors: ['brown tabby', 'red', 'tortoiseshell'],
      size: 'large',
      furType: 'long',
      bodyFeatures: ['tufted ears', 'long tail', 'rectangular body'],
      visualMarkers: ['ear tufts', 'neck ruff']
    }
  }
};

interface AIAnalysis {
  petType: 'dog' | 'cat';
  breed: string[];
  color: string[];
  size: string;
  features: string[];
  confidence: number;
  distinctiveMarks: string[];
  estimatedAge: string;
  furLength: string;
  furPattern: string;
  bodyCharacteristics: string[];
}

export default function AIScanCamera({ onCapture, onError, onCancel }: AIScanCameraProps) {
  const [type, setType] = useState<CameraType>('back');
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const analyzeImage = async (imageUri: string): Promise<AIAnalysis> => {
    // Simulate AI processing with enhanced breed recognition
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would use computer vision to detect these features
    const detectedFeatures = {
      bodyShape: 'athletic',
      furLength: 'long',
      furColor: 'golden',
      earShape: 'floppy',
      faceShape: 'broad',
      size: 'large',
      distinctiveFeatures: ['white chest patch', 'feathered tail']
    };

    // Match detected features against breed database
    const breedMatches = new Map<string, number>();
    
    // Determine if it's a dog or cat based on features
    const petType = detectedFeatures.bodyShape === 'athletic' ? 'dog' : 'cat';
    
    // Score each breed based on matching characteristics
    Object.entries(BREED_DATABASE[petType]).forEach(([breed, traits]) => {
      let score = 0;
      
      // Check fur length
      if (traits.furType === detectedFeatures.furLength) score += 20;
      
      // Check colors
      if (traits.colors.some(color => 
        detectedFeatures.furColor.toLowerCase().includes(color.toLowerCase())
      )) {
        score += 20;
      }
      
      // Check body features
      traits.bodyFeatures.forEach(feature => {
        if (detectedFeatures.distinctiveFeatures.includes(feature)) score += 10;
      });
      
      // Check size
      if (traits.size === detectedFeatures.size) score += 20;
      
      breedMatches.set(breed, score);
    });

    // Sort breeds by confidence score
    const sortedBreeds = Array.from(breedMatches.entries())
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 50)
      .map(([breed]) => breed);

    return {
      petType,
      breed: sortedBreeds.slice(0, 2), // Top 2 breed matches
      color: [detectedFeatures.furColor],
      size: detectedFeatures.size,
      features: [
        detectedFeatures.furLength + ' fur',
        detectedFeatures.earShape + ' ears',
        detectedFeatures.faceShape + ' face'
      ],
      confidence: 0.85,
      distinctiveMarks: detectedFeatures.distinctiveFeatures,
      estimatedAge: '2-4 years', // Would be determined by facial features in real AI
      furLength: detectedFeatures.furLength,
      furPattern: 'solid',
      bodyCharacteristics: [detectedFeatures.bodyShape, detectedFeatures.faceShape]
    };
  };

  const findMatches = (analysis: AIAnalysis): PetReport[] => {
    return mockReports
      .map(report => {
        let score = 0;
        const maxScore = 100;

        // Enhanced breed matching (30 points)
        if (report.type === analysis.petType) {
          score += 15;
          if (report.breed) {
            const breedMatches = analysis.breed.some(breed => 
              report.breed!.toLowerCase().includes(breed.toLowerCase())
            );
            if (breedMatches) score += 15;
          }
        }

        // Improved color matching (20 points)
        const reportColors = report.color.toLowerCase().split(/[,\s]+/);
        const colorMatches = analysis.color.filter(c => 
          reportColors.some(rc => rc.includes(c.toLowerCase()))
        );
        score += (colorMatches.length / analysis.color.length) * 20;

        // Enhanced feature matching (25 points)
        const descriptionLower = report.description.toLowerCase();
        const allFeatures = [
          ...analysis.features,
          ...analysis.distinctiveMarks,
          ...analysis.bodyCharacteristics
        ];
        const featureMatches = allFeatures.filter(f => 
          descriptionLower.includes(f.toLowerCase())
        );
        score += (featureMatches.length / allFeatures.length) * 25;

        // Size matching (15 points)
        if (report.size.toLowerCase() === analysis.size.toLowerCase()) {
          score += 15;
        }

        // Age approximation (10 points)
        if (report.age && analysis.estimatedAge) {
          const reportAge = parseInt(report.age);
          const analysisAge = parseInt(analysis.estimatedAge);
          if (Math.abs(reportAge - analysisAge) <= 2) {
            score += 10;
          }
        }

        // Apply confidence factor
        score *= analysis.confidence;

        return { report, score };
      })
      .filter(({ score }) => score > 50)
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
        onError('No matching pets found. Try scanning from a different angle or in better lighting.');
      } else {
        onCapture(photo.uri, matches, analysis);
      }
    } catch (error) {
      onError('Failed to process image. Please ensure the pet is clearly visible and try again.');
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
          The camera is used to scan and match pets with our database using AI recognition
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
              <Text style={styles.scanningText}>Identifying breed characteristics...</Text>
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
    alignItems: 'center',
    marginTop: 20,
  },
  scanningText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
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