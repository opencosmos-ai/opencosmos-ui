'use client';

import { useState, useEffect } from 'react';
import { TertiaryNav, Breadcrumbs, type BreadcrumbItemLegacy } from '@opencosmos/ui';
import { BrandTab } from './BrandTab';
import { ColorsTab } from './ColorsTab';
import { TypographyTab } from './TypographyTab';
import { SpacingTab } from './SpacingTab';
import { MotionTab } from './MotionTab';
import { SyntaxTab } from './SyntaxTab';
import { InteractionsTab } from './InteractionsTab';
import { DesignTokensOverview } from '../DesignTokensOverview';

type TokenTab = 'tokens-overview' | 'foundations' | 'brand' | 'colors' | 'typography' | 'spacing' | 'syntax' | 'motion' | 'interactions';

function deriveTokenTab(activeItemId: string | undefined, current: TokenTab): TokenTab {
  if (activeItemId && ['foundations', 'brand', 'colors', 'typography', 'spacing', 'syntax', 'motion', 'interactions'].includes(activeItemId)) {
    return activeItemId as TokenTab;
  }
  if (!activeItemId || activeItemId === 'tokens') return 'tokens-overview';
  return current;
}

interface TokensSectionProps {
  activeItemId?: string;
  breadcrumbs?: BreadcrumbItemLegacy[];
  onItemChange?: (itemId: string) => void;
}

export function TokensSection({ activeItemId, breadcrumbs, onItemChange }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState<TokenTab>(
    () => deriveTokenTab(activeItemId, 'tokens-overview')
  );

  // Adjust derived state during render when the prop changes, rather than in an
  // effect: https://react.dev/learn/you-might-not-need-an-effect
  const [prevActiveItemId, setPrevActiveItemId] = useState(activeItemId);
  if (activeItemId !== prevActiveItemId) {
    setPrevActiveItemId(activeItemId);
    setActiveTab((current) => deriveTokenTab(activeItemId, current));
  }

  // Handle tab selection and notify parent
  const handleTabChange = (id: string) => {
    setActiveTab(id as TokenTab);
    onItemChange?.(id);
  };

  // Available tabs for TertiaryNav
  const availableTabs = [
    { id: 'brand', label: 'Brand' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'syntax', label: 'Syntax' },
    { id: 'motion', label: 'Motion' },
  ];

  return (
    <div className="w-full min-w-0">
      <div className="mb-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <div className="mb-4">
            <Breadcrumbs variant="subtle" items={breadcrumbs} />
          </div>
        )}
      </div>

      {/* Tab Content with spacing for sticky nav */}
      <div className="mt-4">
        {(activeTab === 'tokens-overview' || activeTab === 'foundations') && <DesignTokensOverview onNavigate={handleTabChange} />}
        {activeTab === 'brand' && <BrandTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'typography' && <TypographyTab />}
        {activeTab === 'spacing' && <SpacingTab />}
        {activeTab === 'interactions' && <InteractionsTab />}
        {activeTab === 'syntax' && <SyntaxTab />}
        {activeTab === 'motion' && <MotionTab />}
      </div>
    </div>
  );
}
