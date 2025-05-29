import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { X, DollarSign } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useDonations } from '@/store/donations';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  authorName: string;
}

const PRESET_AMOUNTS = [5, 10, 20, 50];

export default function DonationModal({ visible, onClose, storyId, authorName }: DonationModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { donate, processingDonation } = useDonations();

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString());
    setError('');
  };

  const handleDonate = async () => {
    try {
      setError('');
      const donationAmount = parseFloat(amount);

      if (isNaN(donationAmount) || donationAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      await donate(storyId, donationAmount, message);
      onClose();
      setAmount('');
      setMessage('');
    } catch (err) {
      setError('Failed to process donation. Please try again.');
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

          <Text style={styles.title}>Support {authorName}</Text>
          <Text style={styles.subtitle}>
            Your donation helps support pet rescue efforts and encourages more success stories
          </Text>

          <View style={styles.amountPresets}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  amount === preset.toString() && styles.presetButtonActive
                ]}
                onPress={() => handlePresetAmount(preset)}
              >
                <Text style={[
                  styles.presetButtonText,
                  amount === preset.toString() && styles.presetButtonTextActive
                ]}>
                  ${preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Custom Amount</Text>
            <View style={styles.amountInput}>
              <DollarSign size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setError('');
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Add a message of support..."
              multiline
              maxLength={200}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.donateButton, processingDonation && styles.donateButtonDisabled]}
            onPress={handleDonate}
            disabled={processingDonation}
          >
            <Text style={styles.donateButtonText}>
              {processingDonating ? 'Processing...' : 'Donate'}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  amountPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetButtonTextActive: {
    color: colors.white,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  messageInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  donateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonDisabled: {
    opacity: 0.7,
  },
  donateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});