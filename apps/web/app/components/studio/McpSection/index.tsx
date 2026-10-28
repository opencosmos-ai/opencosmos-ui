'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs, type BreadcrumbItemLegacy } from '@opencosmos/ui';
import { McpOverview } from '../McpOverview';
import { OverviewTab } from './OverviewTab';
import { InstallationTab } from './InstallationTab';
import { ToolsTab } from './ToolsTab';
import { UsageTab } from './UsageTab';
import { TroubleshootingTab } from './TroubleshootingTab';

type McpTab = 'mcp-server-overview' | 'overview' | 'installation' | 'tools' | 'usage' | 'troubleshooting';

function deriveMcpTab(activeItemId: string | undefined): McpTab {
    const validTabs: McpTab[] = ['overview', 'installation', 'tools', 'usage', 'troubleshooting'];
    if (activeItemId && validTabs.includes(activeItemId as McpTab)) return activeItemId as McpTab;
    // If no activeItemId, show the section overview
    return 'mcp-server-overview';
}

interface McpSectionProps {
    activeItemId?: string;
    breadcrumbs?: BreadcrumbItemLegacy[];
    onItemChange?: (itemId: string) => void;
}

export function McpSection({ activeItemId, breadcrumbs, onItemChange }: McpSectionProps) {
    const [activeTab, setActiveTab] = useState<McpTab>(() => deriveMcpTab(activeItemId));

    // Adjust derived state during render when the prop changes, rather than in
    // an effect: https://react.dev/learn/you-might-not-need-an-effect
    const [prevActiveItemId, setPrevActiveItemId] = useState(activeItemId);
    if (activeItemId !== prevActiveItemId) {
        setPrevActiveItemId(activeItemId);
        setActiveTab(deriveMcpTab(activeItemId));
    }

    const handleTabChange = (id: string) => {
        setActiveTab(id as McpTab);
        onItemChange?.(id);
    };

    return (
        <div className="w-full min-w-0">
            <div className="mb-0">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="mb-6">
                        <Breadcrumbs variant="subtle" items={breadcrumbs} />
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeTab === 'mcp-server-overview' && <McpOverview onNavigate={handleTabChange} />}
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'installation' && <InstallationTab />}
                {activeTab === 'tools' && <ToolsTab />}
                {activeTab === 'usage' && <UsageTab />}
                {activeTab === 'troubleshooting' && <TroubleshootingTab />}
            </div>
        </div>
    );
}
