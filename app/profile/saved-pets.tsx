import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import MiniPetCard from '@/components/MiniPetCard';

interface SavedPetsScreenProps {
  onClose?: () => void;
}

export default function SavedPetsScreen({ onClose }: SavedPetsScreenProps) {
  const router = useRouter();

  // In a real app, this would be filtered based on user's saved pets
  const savedPets = mockReports.slice(0, 4);

  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Pets</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.petsGrid}>
          {savedPets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petItem}
              onPress={() => handlePetPress(pet.id)}
            >
              <MiniPetCard report={pet} />
            </TouchableOpacity>
          ))}
        </View>

        {savedPets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No saved pets</Text>
            <Text style={styles.emptyStateText}>
              Save pets to keep track of them and receive updates
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  petItem: {
    width: '48%',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});