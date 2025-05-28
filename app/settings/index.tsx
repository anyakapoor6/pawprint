import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Lock, Globe, Moon, Trash2, CircleHelp as HelpCircle, Mail, Monitor } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/store/auth';
import { useSettings } from '@/store/settings';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { 
    pushNotifications, 
    emailNotifications, 
    darkMode,
    useSystemTheme,
    togglePushNotifications,
    toggleEmailNotifications,
    toggleDarkMode,
    toggleUseSystemTheme,
  } = useSettings();

  const handlePushToggle = async () => {
    if (!pushNotifications) {
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
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Get notified about matches and updates</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handlePushToggle}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
            />
          </View>
          <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <Mail size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Email Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Receive email updates and alerts</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.gray[200] }]}>
                <Monitor size={20} color={colors.gray[600]} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Use System Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Match your device's appearance settings</Text>
              </View>
            </View>
            <Switch
              value={useSystemTheme}
              onValueChange={toggleUseSystemTheme}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
            />
          </View>
          <View style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.gray[200] }]}>
                <Moon size={20} color={colors.gray[600]} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {useSystemTheme ? 'Controlled by system settings' : 'Switch between light and dark themes'}
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              disabled={useSystemTheme}
              trackColor={{ false: colors.gray[200], true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem, { backgroundColor: colors.card }]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                <Trash2 size={20} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Permanently delete your account</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textTertiary }]}>Version 1.0.0</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
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
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  version: {
    fontSize: 14,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
  },
});