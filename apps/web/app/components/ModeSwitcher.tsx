'use client';

import React from 'react';
import { ThemeSwitcher } from '@opencosmos/ui';
import { useMounted } from '@/hooks/useMounted';

/**
 * Mode switcher for the design system documentation
 * Uses the ThemeSwitcher component with expandable options
 */
export function ModeSwitcher() {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-4 right-8 z-50"
      title="Switch between light and dark modes"
    >
      <ThemeSwitcher size="md" />
    </div>
  );
}
