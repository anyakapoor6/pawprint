import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Settings, Bell, Heart, LogOut, ChevronRight, Search as SearchIcon, BookOpen, MessageCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useReports } from '@/store/reports';
import { useEngagement } from '@/store/engagement';
import { getUserProfile } from '@/lib/user';
import type { UserProfile, UserReport } from '@/lib/user';
import type { Route } from 'expo-router';
import StoryCard from '@/components/StoryCard';

export default function ProfileScreen() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { reports, getUserReports, isLoading: reportsLoading } = useReports();
  const { loadStoryEngagementPreview, loadReportEngagementPreview, storyEngagementPreviews, reportEngagementPreviews } = useEngagement();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await getUserProfile(user.id);
      if (error) throw error;
      setProfile(data);

      // Load user's reports and their engagement data
      const userReports = await getUserReports(user.id);
      await Promise.all([
        ...userReports.map((report: UserReport) => loadReportEngagementPreview(report.id)),
      ]);

      // Calculate total engagement metrics
      const storyLikes = Object.values(storyEngagementPreviews).reduce((sum, preview) => sum + preview.like_count, 0);
      const reportLikes = Object.values(reportEngagementPreviews).reduce((sum, preview) => sum + preview.like_count, 0);
      const storyComments = Object.values(storyEngagementPreviews).reduce((sum, preview) => sum + preview.comment_count, 0);
      const reportComments = Object.values(reportEngagementPreviews).reduce((sum, preview) => sum + preview.comment_count, 0);

      setTotalLikes(storyLikes + reportLikes);
      setTotalComments(storyComments + reportComments);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in' as Route);
    } catch (err) {
      console.error('Error signing out:', err);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleNavigate = (route: Route) => {
    router.push(route);
  };

  if (authLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }
  if (!user) {
    // Optionally, redirect to sign-in here
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            loadProfile();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeReports = (reports || []).filter(report => report && report.status === 'pending');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => router.push('/profile/edit')}
        >
          <Image
            source={{ uri: profile?.photo_url || user?.photo }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile?.name || user?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeReports.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalLikes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalComments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Stories</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/profile/my-stories')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <BookOpen size={20} color={colors.accent} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>My Stories</Text>
              <Text style={styles.menuItemSubtitle}>View your personal stories</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your Reports</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/my-reports')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>My Reports</Text>
              <Text style={styles.menuItemSubtitle}>Manage your lost and found reports</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/saved-pets')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Heart size={20} color={colors.accent} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Saved Pets</Text>
              <Text style={styles.menuItemSubtitle}>Pets you've bookmarked</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Notifications</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/notifications')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.gray[200] }]}>
              <Bell size={20} color={colors.gray[600]} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Notification Feed</Text>
              <Text style={styles.menuItemSubtitle}>See recent alerts and updates</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/notifications/notification-preferences')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.gray[200] }]}>
              <Settings size={20} color={colors.gray[600]} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Notification Settings</Text>
              <Text style={styles.menuItemSubtitle}>Control what you get notified about</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/search')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.gray[200] }]}>
              <SearchIcon size={20} color={colors.gray[600]} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Search</Text>
              <Text style={styles.menuItemSubtitle}>Search for lost and found pets</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.error + '20' }]}>
              <LogOut size={20} color={colors.error} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={[styles.menuItemTitle, { color: colors.error }]}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.appVersion}>PawPrint v1.0.0</Text>
          <TouchableOpacity>
            <Text style={styles.termsLink}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  termsLink: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});