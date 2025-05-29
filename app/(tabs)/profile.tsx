import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Settings, Heart, Award, LogOut, ChevronRight, Search as SearchIcon, Bell, BookOpen } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { useStories } from '@/store/stories';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { getReportsByStatus } = usePets();
  const { getUserStories } = useStories();

  // Get user's reports
  const activeReports = getReportsByStatus('active');
  const resolvedReports = getReportsByStatus('resolved');
  const totalReports = activeReports.length + resolvedReports.length;
  
  // Get user's stories
  const userStories = getUserStories(user?.id || '');
  
  // Calculate rewards given based on resolved reports with rewards
  const rewardsGiven = resolvedReports.reduce((total, report) => {
    return total + (report.reward?.amount || 0);
  }, 0);

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
        
        <View style={styles.profileHeader}>
          <Image source={{ uri: user?.photo }} style={styles.profileImage} />
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalReports}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStories.length}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${rewardsGiven}</Text>
            <Text style={styles.statLabel}>Rewards Given</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
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
          onPress={() => handleNavigate('/(tabs)/stories')}
        >
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <BookOpen size={20} color={colors.primary} />
            </View>
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemTitle}>My Stories</Text>
              <Text style={styles.menuItemSubtitle}>View and manage your success stories</Text>
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
});