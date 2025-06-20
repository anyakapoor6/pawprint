import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, MapPin, Filter, X, ChevronLeft } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { PetReport, ReportType, PetType } from '@/types/pet';
import { usePets } from '@/store/pets';
import PetCard from '@/components/PetCard';
import React from 'react';
import MiniPetCard from '@/components/MiniPetCard';



interface SearchScreenProps {
  onClose?: () => void;
}

type ReportTypeFilter = ReportType | 'all' | 'reunited';

type FilterState = {
  reportType: ReportTypeFilter;
  petType: PetType | 'all';
  breed: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'all';
  gender: 'male' | 'female' | 'unknown' | 'all';
  age: 'baby' | 'adult' | 'senior' | 'all';
  distance: number;
  dateRange: 'recent' | 'week' | 'month' | 'all';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
};

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetReport[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    reportType: 'all',
    petType: 'all',
    breed: '',
    color: '',
    size: 'all',
    gender: 'all',
    age: 'all',
    distance: 25,
    dateRange: 'all',
  });

  const router = useRouter();
  const { reports } = usePets();


  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text.length > 2) {
      const filtered = reports.filter((report) => {
        if (report.status === 'reunited') return false; // exclude reunited

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
      setFiltersApplied(true);
    } else {
      setResults([]);
      setFiltersApplied(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setFiltersApplied(false);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleLocationSelect = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = address
        ? `${address.street || ''} ${address.city || ''} ${address.region || ''}`
        : 'Current Location';

      updateFilter('location', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: formattedAddress.trim(),
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Failed to get location. Please try again.');
    }
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const applyFilters = () => {
    let filtered = reports.filter(r => r.status !== 'reunited');

    if (filters.reportType !== 'all') {
      if (filters.reportType === 'reunited') {
        filtered = reports.filter(r => r.status === 'reunited');
      } else {
        filtered = reports.filter(
          r => r.reportType === filters.reportType && r.status !== 'reunited'
        );
      }
    } else {
      // Default to excluding reunited unless explicitly filtered for it
      filtered = reports.filter(r => r.status !== 'reunited');
    }


    if (filters.petType !== 'all') {
      filtered = filtered.filter(r => r.type === filters.petType);
    }

    if (filters.breed) {
      filtered = filtered.filter(r =>
        r.breed?.toLowerCase().includes(filters.breed.toLowerCase())
      );
    }

    if (filters.color) {
      filtered = filtered.filter(r =>
        r.color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    if (filters.size !== 'all') {
      filtered = filtered.filter(r => r.size === filters.size);
    }

    if (filters.gender !== 'all') {
      filtered = filtered.filter(r => r.gender === filters.gender);
    }

    if (filters.age !== 'all') {
      filtered = filtered.filter(r => r.ageCategory === filters.age);
    }


    if (filters.location && filters.distance) {
      filtered = filtered.filter(report => {
        if (!report.lastSeenLocation) return false;

        const distance = calculateDistance(
          filters.location!.latitude,
          filters.location!.longitude,
          report.lastSeenLocation.latitude,
          report.lastSeenLocation.longitude
        );

        return distance <= filters.distance;
      });
    }

    setResults(filtered);
    setShowFilters(false);
    setFiltersApplied(true);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const resetFilters = () => {
    setFilters({
      reportType: 'all',
      petType: 'all',
      breed: '',
      color: '',
      size: 'all',
      gender: 'all',
      age: 'all',
      distance: 25,
      dateRange: 'all',
    });
  };

  const handlePetPress = (id: string) => {
    router.push(`/pet/${id}`);
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
          onPress={toggleFilters}
        >
          <Filter size={20} color={showFilters ? colors.white : colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
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

      {showFilters ? (
        <ScrollView style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filters</Text>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Report Type</Text>
            <View style={styles.filterOptions}>
              {(['all', 'lost', 'found', 'reunited'] as const).map((type) => (

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
                    {type === 'all'
                      ? 'All'
                      : type === 'lost'
                        ? 'Lost'
                        : type === 'found'
                          ? 'Found'
                          : 'Reunited'}

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
            <Text style={styles.filterLabel}>Age Group</Text>
            <View style={styles.filterOptions}>
              {(['all', 'baby', 'adult', 'senior'] as const).map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.filterOption,
                    filters.age === age && styles.filterOptionActive
                  ]}
                  onPress={() => updateFilter('age', age)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.age === age && styles.filterOptionTextActive
                  ]}>
                    {age === 'all' ? 'All' : age.charAt(0).toUpperCase() + age.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
            {filters.location && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>
                  Search within {filters.distance} mi
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
                        {distance} mi
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
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : filtersApplied ? (
        <ScrollView style={styles.resultsContainer}>
          {results.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No pets found matching your criteria</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your filters or search terms</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultCount}>{results.length} pets found</Text>
              <View style={styles.resultsGrid}>
                {results.map((report) => (
                  <View key={report.id} style={styles.resultItem}>
                    <MiniPetCard
                      report={report}
                      onPress={() => handlePetPress(report.id)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Use the search bar or filters to find pets</Text>
        </View>
      )}
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
  searchBar: {
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
  filtersContainer: {
    flex: 1,
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
    marginBottom: 40,
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
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});