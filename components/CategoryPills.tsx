import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { GigCategory } from '../types/gig';

interface CategoryItem {
  id: GigCategory;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', label: 'All Gigs', icon: '🔥' },
  { id: 'Tech & Coding', label: 'Tech & Code', icon: '💻' },
  { id: 'Design & Creative', label: 'Design', icon: '🎨' },
  { id: 'Writing & Translation', label: 'Writing', icon: '✍️' },
  { id: 'Events & Hospitality', label: 'Events', icon: '🎉' },
  { id: 'Tutoring & Teaching', label: 'Tutoring', icon: '📚' },
  { id: 'Photo & Video', label: 'Video & Photo', icon: '🎬' },
  { id: 'Marketing & Social Media', label: 'Marketing', icon: '🚀' },
];

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryPills({
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.sm,
  },
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 6,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: '#080B14',
    fontWeight: '700',
  },
});
