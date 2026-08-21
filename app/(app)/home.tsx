import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../FirebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Gig } from '../../types/gig';
import { fetchOpenGigs, seedSampleGigs } from '../../services/gigService';
import CategoryPills from '../../components/CategoryPills';
import GigCard from '../../components/GigCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  // Load gigs from Firestore
  const loadGigs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchOpenGigs();
      setGigs(data);
    } catch (err: any) {
      console.error('Failed to load gigs:', err);
      setError('Could not load gigs. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);

  // Filter gigs based on search input and selected category
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      // Category match
      const matchCategory =
        selectedCategory === 'All' ||
        gig.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(gig.category.toLowerCase());

      // Search match
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchCategory;

      const titleMatch = gig.title?.toLowerCase().includes(query);
      const descMatch = gig.description?.toLowerCase().includes(query);
      const clientMatch = gig.clientName?.toLowerCase().includes(query);
      const tagsMatch = gig.tags?.some((t) => t.toLowerCase().includes(query));

      return matchCategory && (titleMatch || descMatch || clientMatch || tagsMatch);
    });
  }, [gigs, searchQuery, selectedCategory]);

  // Handle seeding test data
  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedSampleGigs();
      Alert.alert('Success', 'Sample gigs have been added to Firestore!');
      await loadGigs();
    } catch (err: any) {
      Alert.alert('Seeding Failed', err?.message || 'Could not seed sample gigs.');
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Ambience Blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      {/* Main Content */}
      <FlatList
        data={filteredGigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GigCard
            gig={item}
            onPress={() => router.push(`/gig/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadGigs(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Header: User greeting & Profile/Logout */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hey, {firstName}! 👋</Text>
                <Text style={styles.subtitle}>Find your next youth opportunity</Text>
              </View>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarText}>
                  {(user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search gigs, skills, keywords..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Opportunity Status & Quick Seed Action */}
            <View style={styles.resultsInfoRow}>
              <Text style={styles.resultsCount}>
                {loading ? 'Searching opportunities...' : `${filteredGigs.length} open ${filteredGigs.length === 1 ? 'gig' : 'gigs'} available`}
              </Text>

              {/* Seed Button for testing / quick setup */}
              <TouchableOpacity
                style={styles.seedButton}
                onPress={handleSeedData}
                disabled={seeding}
                activeOpacity={0.8}
              >
                {seeding ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="sparkles-outline" size={13} color={colors.primary} />
                    <Text style={styles.seedText}>Seed Gigs</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading open opportunities...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.emptyTitle}>Oops!</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => loadGigs()}
              >
                <Text style={styles.actionButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.centerBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No Open Gigs Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search query or selecting a different category.'
                  : 'There are no open gigs right now. Tap "Seed Gigs" above to populate sample gigs!'}
              </Text>
              {(searchQuery || selectedCategory !== 'All') && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.actionButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
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
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primaryGlow,
    opacity: 0.35,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.accentLight,
    opacity: 0.45,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: spacing.xs,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    gap: 4,
  },
  seedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  actionButtonText: {
    color: '#080B14',
    fontSize: 13,
    fontWeight: '700',
  },
});
