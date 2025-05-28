import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType, PetSize } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

interface SearchScreenProps {
  onClose?: () => void;
}

type FilterState = {
  reportType: ReportType | 'all';
  petType: PetType | 'all';
  size: PetSize | 'all';
  breed: string;
  color: string;
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    size: 'all',
    breed: '',
    color: '',
    distance: 5,
    location: null,
    typedLocation: '',
    dateRange: 'all',
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
      }
    })();
  }, []);

  const searchLocation = async (address: string) => {
    try {
      setIsSearchingLocation(true);
      setLocationError(null);
      
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setFilters(prev => ({
          ...prev,
          location: {
            latitude,
            longitude,
            address,
          },
        }));
        applyFilters(searchTerm, {
          ...filters,
          location: {
            latitude,
            longitude,
            address,
          },
        });
      } else {
        setLocationError('Location not found');
      }
    } catch (error) {
      setLocationError('Error searching location');
      console.error('Geocoding error:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    ) / 1000; // Convert to kilometers
  };

  const applyFilters = useCallback((text: string, activeFilters: FilterState) => {
    let filtered = [...mockReports];
    
    // Filter by report type
    if (activeFilters.reportType !== 'all') {
      filtered = filtered.filter(r => r.reportType === activeFilters.reportType);
    }
    
    // Filter by pet type
    if (activeFilters.petType !== 'all') {
      filtered = filtered.filter(r => r.type === activeFilters.petType);
    }

    // Filter by size
    if (activeFilters.size !== 'all') {
      filtered = filtered.filter(r => r.size === activeFilters.size);
    }

    // Filter by breed
    if (activeFilters.breed.trim()) {
      const breedTerms = activeFilters.breed.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        report.breed && breedTerms.every(term => 
          report.breed!.toLowerCase().includes(term)
        )
      );
    }

    // Filter by color
    if (activeFilters.color.trim()) {
      const colorTerms = activeFilters.color.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        colorTerms.every(term => 
          report.color.toLowerCase().includes(term)
        )
      );
    }

    // Filter by location and distance
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

    // Filter by date range
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

    // Search term filtering
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

    setResults(filtered);
  }, []);

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

  const handleLocationChange = (text: string) => {
    setFilters(prev => ({ ...prev, typedLocation: text }));
    setLocationError(null);
  };

  const handleLocationSearch = () => {
    if (filters.typedLocation.trim()) {
      searchLocation(filters.typedLocation.trim());
    }
  };

  const clearLocation = () => {
    setFilters(prev => ({
      ...prev,
      location: null,
      typedLocation: '',
    }));
    setLocationError(null);
    applyFilters(searchTerm, {
      ...filters,
      location: null,
      typedLocation: '',
    });
  };

  const resetFilters = () => {
    const defaultFilters = {
      reportType: 'all' as const,
      petType: 'all' as const,
      size: 'all' as const,
      breed: '',
      color: '',
      distance: 5,
      location: null,
      typedLocation: '',
      dateRange: 'all' as const,
    };
    setFilters(defaultFilters);
    applyFilters(searchTerm, defaultFilters);
  };

  const getActiveFiltersText = () => {
    const parts = [];
    
    if (filters.petType !== 'all') {
      parts.push(filters.petType + 's');
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
    if (filters.reportType !== 'all') {
      parts.push(filters.reportType);
    }
    if (filters.location) {
      parts.push(`within ${filters.distance}km of ${filters.location.address}`);
    }
    if (filters.dateRange !== 'all') {
      parts.push(`from ${filters.dateRange}`);
    }

    return parts.length > 0 ? `Filters: ${parts.join(', ')}` : '';
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
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
            <Text style={styles.filterLabel}>Location</Text>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={styles.locationInput}
                value={filters.typedLocation}
                onChangeText={handleLocationChange}
                placeholder="Enter location to search nearby"
                placeholderTextColor={colors.textTertiary}
              />
              {filters.typedLocation ? (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleLocationSearch}
                  disabled={isSearchingLocation}
                >
                  <MapPin size={20} color={colors.white} />
                </TouchableOpacity>
              ) : null}
            </View>
            {locationError && (
              <Text style={styles.errorText}>{locationError}</Text>
            )}
            {filters.location && (
              <View style={styles.activeLocation}>
                <Text style={styles.activeLocationText}>
                  Searching near: {filters.location.address}
                </Text>
                <TouchableOpacity
                  style={styles.clearLocationButton}
                  onPress={clearLocation}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {filters.location && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Search Radius</Text>
              <View style={styles.filterOptions}>
                {[5, 10, 25, 50].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.filterOption,
                      filters.distance === distance && styles.filterOptionActive
                    ]}
                    onPress={() => updateFilter('distance', distance)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.distance === distance && styles.filterOptionTextActive
                    ]}>
                      {distance}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
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
          
          <View style={styles.filterButtons}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
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
  filterButtonActive: {
    backgroundColor: colors.primary,
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
  filterInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  activeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  activeLocationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearLocationButton: {
    padding: 4,
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