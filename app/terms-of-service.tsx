import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: March 15, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing or using PawPrint's mobile application and website (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.text}>
            PawPrint is a platform that helps reunite lost pets with their owners by allowing users to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Create and manage lost pet reports</Text>
            <Text style={styles.bulletPoint}>• Report found pets</Text>
            <Text style={styles.bulletPoint}>• Search for lost pets</Text>
            <Text style={styles.bulletPoint}>• Communicate with other users</Text>
            <Text style={styles.bulletPoint}>• Share success stories</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.text}>
            You must create an account to use certain features of the Service. You agree to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Provide accurate information</Text>
            <Text style={styles.bulletPoint}>• Maintain the security of your account</Text>
            <Text style={styles.bulletPoint}>• Not share your account credentials</Text>
            <Text style={styles.bulletPoint}>• Notify us of any unauthorized use</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.text}>
            You agree not to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Submit false or misleading information</Text>
            <Text style={styles.bulletPoint}>• Harass or harm other users</Text>
            <Text style={styles.bulletPoint}>• Use the Service for illegal purposes</Text>
            <Text style={styles.bulletPoint}>• Attempt to access unauthorized areas</Text>
            <Text style={styles.bulletPoint}>• Interfere with the Service's operation</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Content</Text>
          <Text style={styles.text}>
            You retain ownership of content you submit but grant us a license to use, modify, and display it. You are responsible for ensuring you have the right to share any content you post.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Premium Features</Text>
          <Text style={styles.text}>
            Some features may require payment. By purchasing premium features, you agree to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Pay all applicable fees</Text>
            <Text style={styles.bulletPoint}>• Provide valid payment information</Text>
            <Text style={styles.bulletPoint}>• Accept our refund policy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
          <Text style={styles.text}>
            The Service is provided "as is" without warranties of any kind. We do not guarantee that:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• The Service will be error-free</Text>
            <Text style={styles.bulletPoint}>• Lost pets will be found</Text>
            <Text style={styles.bulletPoint}>• User information is accurate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.text}>
            We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.text}>
            We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.text}>
            For questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>pawprintapp6@gmail.com</Text>
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
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
  },
});