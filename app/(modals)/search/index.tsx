import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';
import report from '@/app/(tabs)/report';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const matchesQuery = (report.name || '').toLowerCase().includes(query.toLowerCase());


  interface FilterButtonProps {
    label: string;
    value: string;
    selectedValue: string;
    onPress: () => void;
  }

  const FilterButton = ({ label, value, selectedValue, onPress }: FilterButtonProps) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedValue === value && styles.selectedFilter]}
      onPress={onPress}
    >
      <Text style={styles.filterText}>{label}</Text>
    </TouchableOpacity>
  );


  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.filterLabel}>Filter by Type</Text>
      <View style={styles.filterRow}>
        <FilterButton label="All" value="" selectedValue={typeFilter} onPress={() => setTypeFilter('')} />
        <FilterButton label="Dog" value="dog" selectedValue={typeFilter} onPress={() => setTypeFilter('dog')} />
        <FilterButton label="Cat" value="cat" selectedValue={typeFilter} onPress={() => setTypeFilter('cat')} />
      </View>

      <Text style={styles.filterLabel}>Filter by Gender</Text>
      <View style={styles.filterRow}>
        <FilterButton label="All" value="" selectedValue={genderFilter} onPress={() => setGenderFilter('')} />
        <FilterButton label="Male" value="male" selectedValue={genderFilter} onPress={() => setGenderFilter('male')} />
        <FilterButton label="Female" value="female" selectedValue={genderFilter} onPress={() => setGenderFilter('female')} />
      </View>

      <Text style={styles.filterLabel}>Filter by Status</Text>
      <View style={styles.filterRow}>
        <FilterButton label="All" value="" selectedValue={statusFilter} onPress={() => setStatusFilter('')} />
        <FilterButton label="Active" value="active" selectedValue={statusFilter} onPress={() => setStatusFilter('active')} />
        <FilterButton label="Resolved" value="resolved" selectedValue={statusFilter} onPress={() => setStatusFilter('resolved')} />
      </View>

      <View style={styles.results}>
        {filteredReports.map(report => (
          <PetCard key={report.id} report={report} onPress={() => router.push(`/pet/${report.id}`)} />
        ))}
        {filteredReports.length === 0 && (
          <Text style={styles.noResults}>No matching reports found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
  },
  input: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  selectedFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: 14,
  },
  results: {
    paddingVertical: 16,
  },
  noResults: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
