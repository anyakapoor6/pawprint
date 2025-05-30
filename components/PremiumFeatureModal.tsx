import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, TriangleAlert as AlertTriangle, MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PremiumFeature } from '@/types/pet';
import { usePremium } from '@/store/premium';

interface PremiumFeatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feature: PremiumFeature;
}

export default function PremiumFeatureModal({
  visible,
  onClose,
  onSuccess,
  feature,
}: PremiumFeatureModalProps) {
  const { purchaseFeature } = usePremium();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);
      await purchaseFeature(feature.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            {feature.type === 'urgentTag' ? (
              <AlertTriangle size={32} color={colors.urgent} />
            ) : (
              <MapPin size={32} color={colors.primary} />
            )}
            <Text style={styles.title}>{feature.name}</Text>
          </View>

          <Text style={styles.description}>{feature.description}</Text>
          <Text style={styles.price}>${feature.price.toFixed(2)}</Text>

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Purchase Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});