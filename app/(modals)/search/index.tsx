import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

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

export default function SearchScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const applyFilters = useCallback((text: string, activeFilters: FilterState) => {
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
      const breedTerms = activeFilters.breed.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        breedTerms.every(term => (report.breed || '').toLowerCase().includes(term))
      );
    }

    // Color filter
    if (activeFilters.color) {
      const colorTerms = activeFilters.color.toLowerCase().split(/\s+/);
      filtered = filtered.filter(report =>
        colorTerms.every(term => report.color.toLowerCase().includes(term))
      );
    }

    // Size filter
    if (activeFilters.size !== 'all') {
      filtered = filtered.filter(report => report.size === activeFilters.size);
    }

    // Location and distance filter
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

    // Date range filter
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

  const handleBack = () => {
    router.back();
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(searchTerm, updated);
  };

  const getCurrentLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const locationString = address[0] ? 
        `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() :
        'Current Location';

      updateFilter('location', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: locationString
      });
      updateFilter('typedLocation', locationString);
    } catch (error) {
      setLocationError('Error getting location');
      console.error('Error:', error);
    }
  };

  const handleLocationSearch = async (text: string) => {
    updateFilter('typedLocation', text);
    
    if (!text) {
      updateFilter('location', null);
      return;
    }

    try {
      const results = await Location.geocodeAsync(text);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const address = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        const locationString = address[0] ? 
          `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() :
          text;

        updateFilter('location', {
          latitude,
          longitude,
          address: locationString
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
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
            <Text style={styles.filterLabel}>Location</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationInputContainer}>
                <MapPin size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.locationInput}
                  value={filters.typedLocation}
                  onChangeText={handleLocationSearch}
                  placeholder="Enter location"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <TouchableOpacity 
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
              >
                <MapPin size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            {locationError && (
              <Text style={styles.locationError}>{locationError}</Text>
            )}
            
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceLabel}>
                Search within {filters.distance} km
              </Text>
              <View style={styles.distanceOptions}>
                {[5, 10, 25, 50].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceOption,
                      filters.distance === distance && styles.distanceOptionActive
                    ]}
                    onPress={() => updateFilter('distance', distance)}
                  >
                    <Text style={[
                      styles.distanceOptionText,
                      filters.distance === distance && styles.distanceOptionTextActive
                    ]}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
            <Text style={styles.filterLabel}>Date Posted</Text>
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
            onPress={() => {
              setFilters({
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
              applyFilters(searchTerm, {
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
            }}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <ScrollView style={styles.resultsContainer}>
        {filters.location && (
          <View style={styles.activeFilters}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.activeFiltersText}>
              Within {filters.distance}km of {filters.location.address}
            </Text>
          </View>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  currentLocationButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  distanceContainer: {
    marginTop: 12,
  },
  distanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 16,
  },
  distanceOptionActive: {
    backgroundColor: colors.primary,
  },
  distanceOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  distanceOptionTextActive: {
    color: colors.white,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  activeFiltersText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
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