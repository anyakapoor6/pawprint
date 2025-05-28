import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ArrowLeft } from 'lucide-react-native';
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
  breed: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'all';
  distance: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  typedLocation: string;
  dateRange: '24h' | '3days' | 'week' | 'month' | 'all';
};

export default function SearchScreen({ onClose }: SearchScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    breed: '',
    color: '',
    size: 'all',
    distance: 5,
    location: null,
    typedLocation: '',
    dateRange: 'all',
  });

  const applyFilters = useCallback((text: string, activeFilters: FilterState) => {
    let filtered = [...mockReports];

    if (activeFilters.petType !== 'all') {
      filtered = filtered.filter(report => report.type === activeFilters.petType);
    }

    if (activeFilters.reportType !== 'all') {
      filtered = filtered.filter(report => report.reportType === activeFilters.reportType);
    }

    // Search term
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

    if (activeFilters.breed) {
      const breedTerms = activeFilters.breed.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        breedTerms.every(term => (report.breed || '').toLowerCase().includes(term))
      );
    }

    if (activeFilters.color) {
      const colorTerms = activeFilters.color.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        colorTerms.every(term => report.color.toLowerCase().includes(term))
      );
    }

    if (activeFilters.size !== 'all') {
      filtered = filtered.filter(report => report.size === activeFilters.size);
    }

    if (activeFilters.dateRange !== 'all') {
      const now = new Date();
      const getDateLimit = () => {
        switch (activeFilters.dateRange) {
          case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
          case '3days': return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
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

    if (activeFilters.location) {
      filtered = filtered.filter(report => {
        if (!report.lastSeenLocation) return false;

        const distance = calculateDistance(
          activeFilters.location!.latitude,
          activeFilters.location!.longitude,
          report.lastSeenLocation.latitude,
          report.lastSeenLocation.longitude
        );

        return distance <= activeFilters.distance;
      });
    }

    setResults(filtered);
  }, []);

  // Debounced search handler
  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    applyFilters(text, filters);
  }, [filters, applyFilters]);

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(searchTerm, updated);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const resetFilters = () => {
    const defaultFilters = {
      reportType: 'all',
      petType: 'all',
      breed: '',
      color: '',
      size: 'all',
      distance: 5,
      location: null,
      typedLocation: '',
      dateRange: 'all',
    } as FilterState;
    setFilters(defaultFilters);
    applyFilters(searchTerm, defaultFilters);
  };

  const getActiveFiltersText = () => {
    const parts = [];
    
    if (filters.petType !== 'all') {
      parts.push(filters.petType + 's');
    }
    if (filters.reportType !== 'all') {
      parts.push(filters.reportType);
    }
    if (filters.size !== 'all') {
      parts.push(filters.size + ' size');
    }
    if (filters.breed) {
      parts.push(`breed: ${filters.breed}`);
    }
    if (filters.color) {
      parts.push(`color: ${filters.color}`);
    }
    if (filters.location) {
      parts.push(`within ${filters.distance}km`);
    }
    if (filters.dateRange !== 'all') {
      parts.push(`from ${filters.dateRange}`);
    }

    return parts.length > 0 ? `Filters: ${parts.join(', ')}` : '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
          <ArrowLeft size={24} color={colors.text} />
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
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? colors.white : colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filters</Text>
          
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
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Size</Text>
            <View style={styles.filterOptions}>
              {(['all', 'small', 'medium', 'large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.filterOption,
                    filters.size === size && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('size', size)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.size === size && styles.filterOptionTextActive
                  ]}>
                    {size === 'all' ? 'All' : size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Breed</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.breed}
              onChangeText={(text) => updateFilter('breed', text)}
              placeholder="Enter breed"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Color</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.color}
              onChangeText={(text) => updateFilter('color', text)}
              placeholder="Enter color"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Reported</Text>
            <View style={styles.filterOptions}>
              {([
                { value: 'all', label: 'All Time' },
                { value: '24h', label: 'Last 24h' },
                { value: '3days', label: 'Last 3 Days' },
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
        {getActiveFiltersText() && (
          <Text style={styles.activeFilters}>{getActiveFiltersText()}</Text>
        )}
        
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 400,
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
    marginHorizontal: -4,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    margin: 4,
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
  filterInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  resetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginTop: 8,
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
  activeFilters: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    backgroundColor: colors.gray[100],
    padding: 8,
    borderRadius: 8,
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