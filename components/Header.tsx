import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Bell, Pen, Search, SquarePen } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function Header() {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/(modals)/search');
  };

  const handleNotificationsPress = () => {
    router.push('/(modals)/notifications');
  };

  const handleCreatePress = () => {
    router.push('/story/create');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/pawprintlogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />


          <Text style={styles.logoText}>PawPrint</Text>
        </View>
        <View style={styles.actions}>
          {/* Create Story Button (pen icon) */}
          <TouchableOpacity style={styles.iconButton} onPress={handleCreatePress}>
            <SquarePen size={24} color={colors.black} />
          </TouchableOpacity>
          {/* Search Button */}
          <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
            <Search size={24} color={colors.text} />
          </TouchableOpacity>
          {/* Notifications Button with badge */}
          <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
            <Bell size={24} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.heroContainer}>
        {/* ... (Report Lost Pet, Report Found Pet buttons, etc.) ... */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 16,
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
    paddingTop: 16,
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
});