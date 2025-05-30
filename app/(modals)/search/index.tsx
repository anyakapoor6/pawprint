import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
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
  breed: string;
  color: string;
  size: 'small' | 'medium' | 'large' | 'all';
  gender: 'male' | 'female' | 'unknown' | 'all';
  age: string;
  distance: number;
  dateRange: 'recent' | 'week' | 'month' | 'all';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
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
    gender: 'all',
    age: '',
    distance: 25,
    dateRange: 'all',
  });

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (text.length > 2) {
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
    
    if (filters.reportType !== 'all') {
      filtered = filtered.filter(r => r.reportType === filters.reportType);
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

    if (filters.age) {
      filtered = filtered.filter(r => {
        if (!r.age) return false;
        const reportAge = parseInt(r.age);
        const filterAge = parseInt(filters.age);
        return !isNaN(reportAge) && !isNaN(filterAge) && reportAge === filterAge;
      });
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
  };

  const resetFilters = () => {
    setFilters({
      reportType: 'all',
      petType: 'all',
      breed: '',
      color: '',
      size: 'all',
      gender: 'all',
      age: '',
      distance: 25,
      dateRange: 'all',
    });
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
    return R * c;
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

      <View style={styles.contentContainer}>
        {showFilters && (
          <ScrollView style={styles.filtersScroll}>
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
                <Text style={styles.filterLabel}>Age (in years)</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.age}
                  onChangeText={(text) => updateFilter('age', text)}
                  placeholder="Enter age"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
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
                  onPress={() => {}}
                >
                  <MapPin size={20} color={colors.primary} />
                  <Text style={styles.locationButtonText}>
                    {filters.location ? filters.location.address : 'Use Current Location'}
                  </Text>
                </TouchableOpacity>
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
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
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
                    <PetCard 
                      report={report}
                      onPress={() => {}}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
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
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  filtersScroll: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.white,
  },
  filtersContainer: {
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