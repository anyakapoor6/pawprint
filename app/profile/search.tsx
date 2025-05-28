import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

interface SearchScreenProps {
  onClose?: () => void;
}

type FilterState = {
  reportType: ReportType | 'all';
  petType: PetType | 'all';
  distance: number;
  dateRange: 'recent' | 'week' | 'month' | 'all';
};

export default function SearchScreen({ onClose }: SearchScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    distance: 25,
    dateRange: 'all',
  });

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text.length > 2) {
      // Simple search implementation - in a real app, this would be more sophisticated
      const filtered = mockReports.filter((report) => {
        const searchLower = text.toLowerCase();
        const nameLower = (report.name || '').toLowerCase();
        const breedLower = (report.breed || '').toLowerCase();
        const colorLower = report.color.toLowerCase();
        const descLower = report.description.toLowerCase();
        const locationLower = (report.lastSeenLocation?.address || '').toLowerCase();
        
        return (
          nameLower.includes(searchLower) ||
          breedLower.includes(searchLower) ||
          colorLower.includes(searchLower) ||
          descLower.includes(searchLower) ||
          locationLower.includes(searchLower)
        );
      });
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const applyFilters = () => {
    let filtered = [...mockReports];
    
    // Filter by report type
    if (filters.reportType !== 'all') {
      filtered = filtered.filter(r => r.reportType === filters.reportType);
    }
    
    // Filter by pet type
    if (filters.petType !== 'all') {
      filtered = filtered.filter(r => r.type === filters.petType);
    }
    
    // In a real app, we would filter by distance and date range here
    // For this demo, we'll just set the results
    setResults(filtered);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      reportType: 'all',
      petType: 'all',
      distance: 25,
      dateRange: 'all',
    });
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
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={handleSearch}
          placeholder="Search lost & found pets..."
          placeholderTextColor={colors.textTertiary}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filter Results</Text>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Report Type</Text>
            <View style={styles.filterOptions}>
              {(['all', 'lost', 'found'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.reportType === type && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('reportType', type)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.reportType === type && styles.filterOptionTextActive
                  ]}>
                    {type === 'all' ? 'All' : type === 'lost' ? 'Lost' : 'Found'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Pet Type</Text>
            <View style={styles.filterOptions}>
              {(['all', 'dog', 'cat', 'bird', 'rabbit', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.petType === type && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('petType', type)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.petType === type && styles.filterOptionTextActive
                  ]}>
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {searchTerm.length > 0 && results.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No pets found matching "{searchTerm}"</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords or filters</Text>
          </View>
        ) : (
          <>
            {results.length > 0 && (
              <Text style={styles.resultCount}>{results.length} pets found</Text>
            )}
            <View style={styles.resultsGrid}>
              {results.map((report) => (
                <View key={report.id} style={styles.resultItem}>
                  <PetCard report={report} />
                </View>
              ))}
            </View>
          </>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 6,
  },
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  filterButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultItem: {
    width: '48%',
    marginBottom: 16,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});