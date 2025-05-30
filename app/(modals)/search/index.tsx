import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Search as SearchIcon, MapPin, Filter, X, ChevronLeft } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType, PetSize } from '@/types/pet';
import { mockReports } from '@/data/mockData';
import PetCard from '@/components/PetCard';

interface FilterState {
  reportType: ReportType | 'all';
  petType: PetType | 'all';
  breed: string;
  color: string;
  size: PetSize | 'all';
  gender: 'male' | 'female' | 'unknown' | 'all';
  ageRange: 'puppy' | 'young' | 'adult' | 'senior' | 'all';
  distance: number;
  dateRange: 'recent' | 'week' | 'month' | 'all';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    breed: '',
    color: '',
    size: 'all',
    gender: 'all',
    ageRange: 'all',
    distance: 25,
    dateRange: 'all',
  });
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    applyFilters(text, filters);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const applyFilters = (text: string, activeFilters: FilterState) => {
    let filtered = [...mockReports];

    // Search term filter
    if (text.length > 2) {
      const searchTerms = text.toLowerCase().split(/\s+/);
      filtered = filtered.filter((report) => {
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

    // Size filter
    if (activeFilters.size !== 'all') {
      filtered = filtered.filter(report => report.size === activeFilters.size);
    }

    // Gender filter
    if (activeFilters.gender !== 'all') {
      filtered = filtered.filter(report => report.gender === activeFilters.gender);
    }

    // Age range filter
    if (activeFilters.ageRange !== 'all') {
      filtered = filtered.filter(report => {
        if (!report.age) return false;
        const age = parseInt(report.age);
        switch (activeFilters.ageRange) {
          case 'puppy': return age <= 1;
          case 'young': return age > 1 && age <= 3;
          case 'adult': return age > 3 && age <= 8;
          case 'senior': return age > 8;
          default: return true;
        }
      });
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

    // Location and distance filter
    if (activeFilters.location && activeFilters.distance) {
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

  const handleLocationSelect = async () => {
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

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? `${address[0].city}, ${address[0].region}` : 'Current Location'
      };

      updateFilter('location', locationData);
    } catch (error) {
      setLocationError('Error getting location');
      console.error('Error:', error);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      reportType: 'all',
      petType: 'all',
      breed: '',
      color: '',
      size: 'all',
      gender: 'all',
      ageRange: 'all',
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
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? colors.white : colors.primary} />
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

      <ScrollView style={styles.content}>
        {showFilters && (
          <View style={styles.filtersContainer}>
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
              <Text style={styles.filterLabel}>Gender</Text>
              <View style={styles.filterOptions}>
                {(['all', 'male', 'female', 'unknown'] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.filterOption,
                      filters.gender === gender && styles.filterOptionActive
                    ]}
                    onPress={() => updateFilter('gender', gender)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.gender === gender && styles.filterOptionTextActive
                    ]}>
                      {gender === 'all' ? 'All' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Age</Text>
              <View style={styles.filterOptions}>
                {(['all', 'puppy', 'young', 'adult', 'senior'] as const).map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.filterOption,
                      filters.ageRange === age && styles.filterOptionActive
                    ]}
                    onPress={() => updateFilter('ageRange', age)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.ageRange === age && styles.filterOptionTextActive
                    ]}>
                      {age === 'all' ? 'All' : age.charAt(0).toUpperCase() + age.slice(1)}
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
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleLocationSelect}
              >
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationButtonText}>
                  {filters.location ? filters.location.address : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
              {locationError && (
                <Text style={styles.errorText}>{locationError}</Text>
              )}
              {filters.location && (
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceLabel}>
                    Search within {filters.distance} km
                  </Text>
                  <View style={styles.distanceOptions}>
                    {[5, 10, 25, 50, 100].map((distance) => (
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
                          {distance}km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
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
          </View>
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
                    <PetCard 
                      report={report}
                      onPress={() => handlePetPress(report.id)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
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
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    padding: 16,
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
  filterInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
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
  filterButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.white,
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