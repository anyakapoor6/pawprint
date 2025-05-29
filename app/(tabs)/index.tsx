import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MapPin, Heart, Award, Clock, ChevronRight, SquarePen as PenSquare, Search, Bell } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { PetReport, Story } from '@/types/pet';
import { mockReports, mockStories } from '@/data/mockData';
import PetCard from '@/components/PetCard';
import StoryCard from '@/components/StoryCard';
import ImpactStats from '@/components/ImpactStats';
import { useNotifications } from '@/store/notifications';

export default function HomeScreen() {
  const [urgentReports, setUrgentReports] = useState<PetReport[]>([]);
  const [recentReports, setRecentReports] = useState<PetReport[]>([]);
  const [foundPets, setFoundPets] = useState<PetReport[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Get urgent reports
    const urgent = mockReports.filter(report => report.isUrgent).slice(0, 5);
    
    // Get recent reports
    const recent = [...mockReports]
      .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime())
      .slice(0, 5);
    
    // Get found pets
    const found = mockReports
      .filter(report => report.reportType === 'found' && report.status === 'active')
      .slice(0, 5);
    
    // Get latest stories
    const latestStories = mockStories.slice(0, 3);
    
    setUrgentReports(urgent);
    setRecentReports(recent);
    setFoundPets(found);
    setStories(latestStories);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
              style={styles.logoImage} 
            />
            <Text style={styles.logoText}>PawPrint</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/(modals)/search')}
            >
              <Search size={24} color={colors.text} />
            </TouchableOpacity>
            <Link href="/story/create" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <PenSquare size={24} color={colors.text} />
              </TouchableOpacity>
            </Link>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/(modals)/notifications')}
            >
              <Bell size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>
            Connect, Care, and Share in Your Pet Community
          </Text>
          <View style={styles.actionButtonsContainer}>
            <Link href="/report?type=lost" asChild>
              <TouchableOpacity style={[styles.actionButton, styles.lostButton]}>
                <Text style={styles.actionButtonText}>Report Lost Pet</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/report?type=found" asChild>
              <TouchableOpacity style={[styles.actionButton, styles.foundButton]}>
                <Text style={styles.actionButtonText}>Report Found Pet</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={colors.urgent} />
            <Text style={styles.sectionHeaderText}>Urgent Cases</Text>
            <Link href="/urgent" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {urgentReports.map(report => (
              <PetCard key={report.id} report={report} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.sectionHeaderText}>Recently Reported</Text>
            <Link href="/recent" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {recentReports.map(report => (
              <PetCard key={report.id} report={report} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={colors.secondary} />
            <Text style={styles.sectionHeaderText}>Found Pets</Text>
            <Link href="/found" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {foundPets.map(report => (
              <PetCard key={report.id} report={report} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={colors.accent} />
            <Text style={styles.sectionHeaderText}>Storyboard</Text>
            <Link href="/stories" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </Link>
          </View>
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </View>

        <ImpactStats />
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
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  heroContainer: {
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostButton: {
    backgroundColor: colors.urgent,
  },
  foundButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});