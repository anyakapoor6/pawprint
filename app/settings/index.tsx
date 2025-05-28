import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Lock, Globe, Trash2, CircleHelp as HelpCircle, Mail, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useSettings } from '@/store/settings';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    pushNotifications, 
    emailNotifications,
    togglePushNotifications,
    toggleEmailNotifications,
  } = useSettings();

  const handlePushToggle = async () => {
    if (!pushNotifications) {
      // Request permission when enabling notifications
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates about lost pets.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
    }
    togglePushNotifications();
  };

  const handleEmailToggle = () => {
    if (!emailNotifications) {
      Alert.alert(
        'Enable Email Notifications',
        'You will receive important updates and matches via email.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: toggleEmailNotifications 
          }
        ]
      );
    } else {
      toggleEmailNotifications();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the account
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTerms = () => {
    router.push('/terms-of-service');
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'Send us an email at pawprintapp6@gmail.com and we\'ll get back to you as soon as possible.',
      [
        { text: 'OK' }
      ]
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>Edit Profile</Text>
                <Text style={styles.menuItemSubtitle}>Update your personal information</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Get notified about matches and updates</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handlePushToggle}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <Mail size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive email updates and alerts</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={handleEmailToggle}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Lock size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>Read our privacy policy</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleTerms}
          >
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.gray[200] }]}>
                <Globe size={20} color={colors.gray[600]} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingDescription}>Read our terms of service</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleSupport}
          >
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <HelpCircle size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingDescription}>Contact our support team</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                <Trash2 size={20} color={colors.error} />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={styles.settingDescription}>Permanently delete your account</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.email}>{user?.email}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontWeight: '500',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});