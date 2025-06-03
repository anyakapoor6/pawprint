import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { colors } from '../../../constants/colors';
import { useSearch } from '../../../store/search';
import { PetReport } from '../../../types/pet';

export default function SearchModal() {
  const router = useRouter();
  const { searchResults, setSearchQuery } = useSearch();

  const handleClose = () => {
    router.back();
  };

  const handleSelect = (report: PetReport) => {
    router.push(`/pet/${report.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search pets..."
          placeholderTextColor={colors.textTertiary}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.resultText}>
              {item.name || `${item.type} - ${item.breed}`}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matching pets found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f2f2f2', // fallback if colors.gray[100] doesn't exist
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    color: colors.text,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: colors.textTertiary,
  },
});
