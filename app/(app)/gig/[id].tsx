import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { Gig } from '../../../types/gig';
import { getGigById, applyForGig } from '../../../services/gigService';

export default function GigDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function loadGigDetails() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getGigById(id);
        if (!data) {
          setError('Gig not found or may have closed.');
        } else {
          setGig(data);
        }
      } catch (err: any) {
        console.error('Failed to load gig details:', err);
        setError('Could not load opportunity details.');
      } finally {
        setLoading(false);
      }
    }

    loadGigDetails();
  }, [id]);

  const handleApply = async () => {
    if (!gig || !user) return;
    if (!coverNote.trim()) {
      Alert.alert('Cover Note Required', 'Please provide a short message explaining why you are a great fit.');
      return;
    }

    try {
      setApplying(true);
      await applyForGig(
        gig.id,
        user.uid,
        user.displayName || 'Youth Candidate',
        user.email || '',
        coverNote.trim()
      );
      setHasApplied(true);
      setModalVisible(false);
      Alert.alert(
        'Application Sent! 🎉',
        'Your application has been submitted to the client. You can track updates here.'
      );
      // Increment applicant count locally
      setGig((prev) =>
        prev
          ? {
              ...prev,
              applicantsCount: (prev.applicantsCount || 0) + 1,
            }
          : null
      );
    } catch (err: any) {
      Alert.alert('Application Failed', err?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading gig details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !gig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Gig not found'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Open Gigs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHourly = gig.budgetType === 'hourly';
  const displayBudget = isHourly ? `$${gig.budget}/hr` : `$${gig.budget}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Blobs */}
      <View style={styles.blobTop} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Opportunity Details
        </Text>
        <View style={styles.placeholderBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Badges */}
        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{gig.category}</Text>
          </View>
          <View
            style={[
              styles.locationChip,
              gig.isRemote ? styles.remoteChip : styles.onSiteChip,
            ]}
          >
            <Ionicons
              name={gig.isRemote ? 'globe-outline' : 'location-outline'}
              size={14}
              color={gig.isRemote ? '#38BDF8' : '#34D399'}
            />
            <Text
              style={[
                styles.locationChipText,
                { color: gig.isRemote ? '#38BDF8' : '#34D399' },
              ]}
            >
              {gig.isRemote ? 'Remote' : gig.location}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{gig.title}</Text>

        {/* Budget & Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Budget / Pay</Text>
            <Text style={styles.statValuePrimary}>{displayBudget}</Text>
            <Text style={styles.statSubText}>{isHourly ? 'Hourly Rate' : 'Fixed Project Pay'}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration / Est.</Text>
            <Text style={styles.statValue}>{gig.duration || 'Flexible'}</Text>
            <Text style={styles.statSubText}>{gig.deadline || 'Apply soon'}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Applicants</Text>
            <Text style={styles.statValue}>{gig.applicantsCount || 0}</Text>
            <Text style={styles.statSubText}>Applied</Text>
          </View>
        </View>

        {/* Client Info Banner */}
        <View style={styles.clientBanner}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarText}>
              {gig.clientName ? gig.clientName[0].toUpperCase() : 'C'}
            </Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{gig.clientName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {gig.clientRating ? gig.clientRating.toFixed(1) : '5.0'} Verified Client
              </Text>
            </View>
          </View>
        </View>

        {/* Gig Description */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About the Gig</Text>
          <Text style={styles.descriptionText}>{gig.description}</Text>
        </View>

        {/* Skills & Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Required Skills & Tags</Text>
            <View style={styles.tagsRow}>
              {gig.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom CTA Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPriceLabel}>Payment</Text>
          <Text style={styles.bottomPriceValue}>{displayBudget}</Text>
        </View>

        <TouchableOpacity
          style={[styles.applyButton, hasApplied && styles.appliedButton]}
          onPress={() => {
            if (!hasApplied) setModalVisible(true);
          }}
          disabled={hasApplied}
          activeOpacity={0.85}
        >
          <Ionicons
            name={hasApplied ? 'checkmark-circle' : 'flash'}
            size={18}
            color="#080B14"
          />
          <Text style={styles.applyButtonText}>
            {hasApplied ? 'Applied' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Apply Proposal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Opportunity</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Send a short note to <Text style={{ color: colors.primary }}>{gig.clientName}</Text> introducing yourself and why you're a great fit.
            </Text>

            <TextInput
              style={styles.coverInput}
              placeholder="e.g. Hi! I have experience with this and can start right away..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={coverNote}
              onChangeText={setCoverNote}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator size="small" color="#080B14" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  blobTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primaryGlow,
    opacity: 0.3,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  backButtonText: {
    color: '#080B14',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholderBtn: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  remoteChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  onSiteChip: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
    marginBottom: spacing.md,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.surfaceBorder,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statValuePrimary: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statSubText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs + 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  tagBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0E1322',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  appliedButton: {
    backgroundColor: colors.success,
  },
  applyButtonText: {
    color: '#080B14',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F1528',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  coverInput: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.text,
    padding: spacing.md,
    fontSize: 14,
    height: 110,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#080B14',
    fontSize: 14,
    fontWeight: '800',
  },
});
