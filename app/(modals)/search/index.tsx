import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

type FilterState = {
  reportType: ReportType | 'all';
  petType: PetType | 'all';
  breed: string;
  color: string;
  distance: number;
  dateRange: 'recent' | 'week' | 'month' | 'all';
};

const COMMON_BREEDS = {
  dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Husky', 'Corgi'],
  cat: ['Siamese', 'Persian', 'Maine Coon', 'Ragdoll', 'British Shorthair'],
};

const COMMON_COLORS = ['Black', 'White', 'Brown', 'Grey', 'Golden', 'Cream', 'Mixed'];

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    breed: '',
    color: '',
    distance: 25,
    dateRange: 'all',
  });

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    applyFilters(text, filters);
  };

  const applyFilters = (text: string, activeFilters: FilterState) => {
    let filtered = [...mockReports];

    // Search term filter
    if (text.length > 2) {
      const searchTerms = text.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report => {
        const searchableText = [
          report.name,
          report.breed,
          report.color,
          report.description,
          report.lastSeenLocation?.address
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Report type filter
    if (activeFilters.reportType !== 'all') {
      filtered = filtered.filter(report => report.reportType === activeFilters.reportType);
    }

    // Pet type filter
    if (activeFilters.petType !== 'all') {
      filtered = filtered.filter(report => report.type === activeFilters.petType);
    }

    // Breed filter
    if (activeFilters.breed) {
      filtered = filtered.filter(report => 
        report.breed?.toLowerCase().includes(activeFilters.breed.toLowerCase())
      );
    }

    // Color filter
    if (activeFilters.color) {
      filtered = filtered.filter(report => 
        report.color.toLowerCase().includes(activeFilters.color.toLowerCase())
      );
    }

    // Date range filter
    if (activeFilters.dateRange !== 'all') {
      const now = new Date();
      const getDateLimit = () => {
        switch (activeFilters.dateRange) {
          case 'recent': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
          case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          default: return null;
        }
      };

      const dateLimit = getDateLimit();
      if (dateLimit) {
        filtered = filtered.filter(report => {
          const reportDate = new Date(report.dateReported);
          return reportDate >= dateLimit;
        });
      }
    }

    setResults(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(searchTerm, updated);
  };

  const resetFilters = () => {
    const defaultFilters = {
      reportType: 'all',
      petType: 'all',
      breed: '',
      color: '',
      distance: 25,
      dateRange: 'all',
    };
    setFilters(defaultFilters);
    applyFilters(searchTerm, defaultFilters);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={colors.textSecondary} />
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
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filters</Text>
          
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
              {(['all', 'dog', 'cat'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.petType === type && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    updateFilter('petType', type);
                    updateFilter('breed', ''); // Reset breed when changing pet type
                  }}
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

          {filters.petType !== 'all' && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Breed</Text>
              <View style={styles.filterOptions}>
                {COMMON_BREEDS[filters.petType].map((breed) => (
                  <TouchableOpacity
                    key={breed}
                    style={[
                      styles.filterOption,
                      filters.breed === breed && styles.filterOptionActive
                    ]}
                    onPress={() => updateFilter('breed', breed)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.breed === breed && styles.filterOptionTextActive
                    ]}>
                      {breed}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.customInput}
                value={filters.breed}
                onChangeText={(text) => updateFilter('breed', text)}
                placeholder="Or enter custom breed..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          )}

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Color</Text>
            <View style={styles.filterOptions}>
              {COMMON_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.filterOption,
                    filters.color === color && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('color', color)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.color === color && styles.filterOptionTextActive
                  ]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.customInput}
              value={filters.color}
              onChangeText={(text) => updateFilter('color', text)}
              placeholder="Or enter custom color..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Posted</Text>
            <View style={styles.filterOptions}>
              {([
                { value: 'all', label: 'All Time' },
                { value: 'recent', label: 'Last 24h' },
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
              ] as const).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.dateRange === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('dateRange', option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.dateRange === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <ScrollView style={styles.resultsContainer}>
        {searchTerm.length > 0 && results.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No pets found matching your criteria</Text>
            <Text style={styles.noResultsSubtext}>Try adjusting your filters or search terms</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: 16,
    maxHeight: 400,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
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
    gap: 8,
    marginBottom: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
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
  customInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: colors.gray[100],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
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