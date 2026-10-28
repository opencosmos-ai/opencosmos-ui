'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs, type BreadcrumbItemLegacy, Tabs, TabsList, TabsTrigger, TabsContent } from '@opencosmos/ui';
import { ChartsSections } from './ChartsSections';
import { OpenGraphCardPage } from './pages/blocks/OpenGraphCardPage';
import { BrandBuilder } from './BrandBuilder/BrandBuilder';
import { ToolsOverview } from './ToolsOverview';

type ToolsTab = 'tools-overview' | 'brand-builder' | 'open-graph-card' | 'charts';

function deriveToolsTab(activeItemId: string | undefined): ToolsTab {
  if (!activeItemId) return 'tools-overview';
  if (activeItemId === 'brand-builder') return 'brand-builder';
  if (activeItemId.startsWith('charts') || activeItemId === 'area-chart' || activeItemId === 'bar-chart' || activeItemId === 'line-chart' || activeItemId === 'pie-chart') return 'charts';
  if (activeItemId === 'open-graph-card') return 'open-graph-card';
  return 'tools-overview';
}

interface ToolsSectionProps {
  activeItemId?: string;
  breadcrumbs?: BreadcrumbItemLegacy[];
  onItemChange?: (itemId: string) => void;
}

export function ToolsSection({ activeItemId, breadcrumbs = [], onItemChange }: ToolsSectionProps) {
  const [activeTab, setActiveTab] = useState<ToolsTab>(() => deriveToolsTab(activeItemId));

  // Adjust derived state during render when the prop changes, rather than in an
  // effect: https://react.dev/learn/you-might-not-need-an-effect
  const [prevActiveItemId, setPrevActiveItemId] = useState(activeItemId);
  if (activeItemId !== prevActiveItemId) {
    setPrevActiveItemId(activeItemId);
    setActiveTab(deriveToolsTab(activeItemId));
  }

  const handleTabChange = (value: string) => {
    const tab = value as ToolsTab;
    setActiveTab(tab);
    onItemChange?.(tab);
  };

  return (
    <div className="space-y-8 w-full min-w-0">
      <div className="mb-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <div className="mb-4">
            <Breadcrumbs variant="subtle" items={breadcrumbs} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'tools-overview' && <ToolsOverview onNavigate={handleTabChange} />}
        {activeTab === 'brand-builder' && <BrandBuilder />}
        {activeTab === 'open-graph-card' && <OpenGraphCardPage />}
        {activeTab === 'charts' && (
          <ChartsSections
            activeItemId={activeItemId}
            breadcrumbs={[]}
            onItemChange={onItemChange}
          />
        )}
      </div>
    </div>
  );
}
