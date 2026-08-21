import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Gig } from '../types/gig';

interface GigCardProps {
  gig: Gig;
  onPress: () => void;
}

export default function GigCard({ gig, onPress }: GigCardProps) {
  const isHourly = gig.budgetType === 'hourly';
  const displayBudget = isHourly ? `$${gig.budget}/hr` : `$${gig.budget}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Top Meta: Category & Remote/Location */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{gig.category}</Text>
        </View>

        <View
          style={[
            styles.locationBadge,
            gig.isRemote ? styles.remoteBadge : styles.onSiteBadge,
          ]}
        >
          <Ionicons
            name={gig.isRemote ? 'globe-outline' : 'location-outline'}
            size={12}
            color={gig.isRemote ? '#38BDF8' : '#34D399'}
          />
          <Text
            style={[
              styles.locationText,
              { color: gig.isRemote ? '#38BDF8' : '#34D399' },
            ]}
          >
            {gig.isRemote ? 'Remote' : gig.location}
          </Text>
        </View>
      </View>

      {/* Gig Title */}
      <Text style={styles.title} numberOfLines={2}>
        {gig.title}
      </Text>

      {/* Description Snippet */}
      <Text style={styles.description} numberOfLines={2}>
        {gig.description}
      </Text>

      {/* Tags Row */}
      {gig.tags && gig.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {gig.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {gig.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{gig.tags.length - 3}</Text>
          )}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Footer: Budget & Client/Deadline */}
      <View style={styles.bottomRow}>
        {/* Left: Client & Deadline */}
        <View style={styles.clientInfo}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>
              {gig.clientName ? gig.clientName[0].toUpperCase() : 'C'}
            </Text>
          </View>
          <View>
            <Text style={styles.clientName} numberOfLines={1}>
              {gig.clientName}
            </Text>
            {gig.deadline && (
              <Text style={styles.deadlineText}>⏳ {gig.deadline}</Text>
            )}
          </View>
        </View>

        {/* Right: Budget Tag & Arrow */}
        <View style={styles.budgetBox}>
          <Text style={styles.budgetValue}>{displayBudget}</Text>
          <Text style={styles.budgetType}>
            {isHourly ? 'Est. rate' : 'Fixed pay'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  remoteBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  onSiteBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 23,
    marginTop: spacing.xs,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  clientName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  deadlineText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  budgetBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  budgetType: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
