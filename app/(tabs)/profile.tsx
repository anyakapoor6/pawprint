import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Settings, Bell, Heart, Award, LogOut, ChevronRight, Search as SearchIcon, BookOpen } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useStories } from '@/store/stories';
import StoryCard from '@/components/StoryCard';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { getUserStories } = useStories();
  const userStories = getUserStories(user?.id || '');
  
  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const handleNavigate = (route: string) => {
    router.push(route);
  };

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
          <Image source={{ uri: user?.photo }} style={styles.profileImage} />
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStories.length}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Active Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>$50</Text>
            <Text style={styles.statLabel}>Rewards Given</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Stories</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigate('/(tabs)/stories')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <BookOpen size={20} color={colors.accent} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>My Stories</Text>
              <Text style={styles.menuItemSubtitle}>View and share your pet stories</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {userStories.length > 0 && (
          <View style={styles.storiesSection}>
            {userStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </View>
        )}

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
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/rewards')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <Award size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Rewards</Text>
              <Text style={styles.menuItemSubtitle}>Manage and track rewards you've offered</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNavigate('/(modals)/notifications')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.gray[200] }]}>
              <Bell size={20} color={colors.gray[600]} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>Manage your notification preferences</Text>
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
  storiesSection: {
    marginTop: 8,
    marginBottom: 24,
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
});