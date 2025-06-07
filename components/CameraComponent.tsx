// import { useState, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
// import { X, Camera, RefreshCw } from 'lucide-react-native';
// import { colors } from '@/constants/colors';

// interface CameraComponentProps {
//   onCapture: (uri: string) => void;
//   onCancel: () => void;
// }

// export default function CameraComponent({ onCapture, onCancel }: CameraComponentProps) {
//   const [type, setType] = useState<CameraType>('back');
//   const [permission, requestPermission] = useCameraPermissions();
//   const cameraRef = useRef<any>(null);

//   if (!permission) {
//     // Camera permissions are still loading
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>Loading camera permissions...</Text>
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     // Camera permissions are not granted yet
//     return (
//       <View style={styles.container}>
//         <Text style={styles.text}>We need your permission to show the camera</Text>
//         <TouchableOpacity style={styles.button} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Permission</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const toggleCameraType = () => {
//     setType(current => (current === 'back' ? 'front' : 'back'));
//   };

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync();
//         onCapture(photo.uri);
//       } catch (error) {
//         console.error('Error taking picture:', error);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView 
//         style={styles.camera} 
//         type={type}
//         ref={cameraRef}
//       >
//         <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
//           <X size={24} color={colors.white} />
//         </TouchableOpacity>
        
//         <View style={styles.controls}>
//           <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
//             <RefreshCw size={24} color={colors.white} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <View style={styles.captureButtonInner} />
//           </TouchableOpacity>
          
//           <View style={styles.emptySpace} />
//         </View>
//       </CameraView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.black,
//   },
//   camera: {
//     flex: 1,
//     justifyContent: 'space-between',
//     padding: 20,
//   },
//   text: {
//     color: colors.white,
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   closeButton: {
//     alignSelf: 'flex-end',
//     padding: 8,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   flipButton: {
//     padding: 12,
//     borderRadius: 30,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'rgba(255,255,255,0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   captureButtonInner: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: colors.white,
//   },
//   emptySpace: {
//     width: 48,
//     height: 48,
//   },
//   button: {
//     backgroundColor: colors.primary,
//     padding: 16,
//     borderRadius: 8,
//     margin: 20,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   cancelButton: {
//     padding: 16,
//     borderRadius: 8,
//     margin: 20,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });