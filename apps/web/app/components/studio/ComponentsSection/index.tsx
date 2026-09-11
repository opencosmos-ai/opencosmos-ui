'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs, type BreadcrumbItemLegacy } from '@opencosmos/ui';
import { EnhancedComponentPlayground } from './EnhancedComponentPlayground';
import { CategoryOverview } from './CategoryOverview';
import { componentRegistry } from '../../lib/component-registry';

interface ComponentsSectionProps {
  activeItemId?: string;
  category?: string;
  breadcrumbs?: BreadcrumbItemLegacy[];
  onItemChange?: (itemId: string) => void;
}

// Functional category organization
const COMPONENT_CATEGORIES = {
  actions: {
    label: 'Actions',
    description: 'Interactive elements that trigger behaviors',
    components: ['Button', 'Toggle', 'ToggleGroup'],
  },
  forms: {
    label: 'Forms',
    description: 'Input controls for data collection',
    components: ['Checkbox', 'Combobox', 'DragDrop', 'FileUpload', 'Form', 'Input', 'InputOTP', 'Label', 'RadioGroup', 'Select', 'Slider', 'Switch', 'Textarea'],
  },
  navigation: {
    label: 'Navigation',
    description: 'Components for moving through content',
    components: ['Breadcrumb', 'Command', 'Menubar', 'NavigationMenu', 'Pagination', 'Tabs'],
  },
  overlays: {
    label: 'Overlays',
    description: 'Contextual content layers',
    components: ['AlertDialog', 'ContextMenu', 'Dialog', 'Drawer', 'DropdownMenu', 'HoverCard', 'NotificationCenter', 'Popover', 'Sheet', 'Tooltip'],
  },
  feedback: {
    label: 'Feedback',
    description: 'Status and system communication',
    components: ['Alert', 'EmptyState', 'Stepper', 'Progress', 'Skeleton', 'ThinkingIndicator', 'Toaster'],
  },
  'data-display': {
    label: 'Data Display',
    description: 'Presenting information visually',
    components: ['Avatar', 'Badge', 'Calendar', 'Card', 'DataTable', 'StatCard', 'Timeline', 'TreeView', 'Table'],
  },
  layout: {
    label: 'Layout',
    description: 'Structural and spacing components',
    components: ['Accordion', 'AppSidebar', 'AspectRatio', 'Carousel', 'Collapsible', 'DatePicker', 'GlassSurface', 'ResizablePanelGroup', 'ScrollArea', 'Separator', 'Sidebar'],
  },
  // Legacy components (not yet migrated to functional categories)
  legacy: {
    label: 'Legacy',
    description: 'Components from @ecosystem/design-system',
    components: ['Code', 'Link', 'ProgressBar', 'Spinner', 'Switch'],
  },
};

/**
 * Robust lookup: case-insensitive match against registry keys.
 * Handles 'combobox' -> 'Combobox', 'toggle-group' -> 'ToggleGroup', etc.
 */
function findRegistryKey(activeItemId: string | undefined): string | undefined {
  if (!activeItemId) return undefined;
  const targetId = activeItemId.toLowerCase().replace(/-/g, '');
  const registryKey = Object.keys(componentRegistry).find(key =>
    key.toLowerCase().replace(/-/g, '') === targetId ||
    key.toLowerCase() === activeItemId.replace(/-/g, '').toLowerCase()
  );
  return registryKey && componentRegistry[registryKey] ? registryKey : undefined;
}

function inferCategory(registryKey: string | undefined): string | undefined {
  if (!registryKey) return undefined;
  for (const [categoryKey, cat] of Object.entries(COMPONENT_CATEGORIES)) {
    if ((cat.components as readonly string[]).includes(registryKey)) return categoryKey;
  }
  return undefined;
}

export function ComponentsSection({ activeItemId, category, breadcrumbs, onItemChange }: ComponentsSectionProps) {
  const [selectedComponent, setSelectedComponent] = useState<string>(
    () => findRegistryKey(activeItemId) ?? ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => category || inferCategory(findRegistryKey(activeItemId)) || 'actions'
  );

  // Adjust derived state during render when the props change, rather than in an
  // effect: https://react.dev/learn/you-might-not-need-an-effect
  const [prevProps, setPrevProps] = useState({ activeItemId, category });
  if (activeItemId !== prevProps.activeItemId || category !== prevProps.category) {
    setPrevProps({ activeItemId, category });

    if (category) {
      setSelectedCategory(category);
    }

    const registryKey = findRegistryKey(activeItemId);
    if (registryKey) {
      setSelectedComponent(registryKey);

      // If no category provided, infer it (fallback)
      if (!category) {
        const inferred = inferCategory(registryKey);
        if (inferred) setSelectedCategory(inferred);
      }
    }
  }

  // Handle component selection and notify parent
  const handleComponentChange = (componentName: string) => {
    setSelectedComponent(componentName);
    // Convert PascalCase to kebab-case (e.g., 'ProgressBar' -> 'progress-bar', 'Button' -> 'button')
    const kebabCase = componentName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    onItemChange?.(kebabCase);
  };

  // Get components for the selected category
  const categoryComponents = COMPONENT_CATEGORIES[selectedCategory as keyof typeof COMPONENT_CATEGORIES]?.components || [];
  const availableComponents = categoryComponents.filter(name => componentRegistry[name]);
  const componentItems = availableComponents.map(name => ({ id: name, label: name }));

  // Category navigation items
  const categoryItems = Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => ({
    id: key,
    label: category.label,
  }));

  return (
    <div className="space-y-8">
      <div>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <div className="mb-4">
            <Breadcrumbs variant="subtle" items={breadcrumbs} />
          </div>
        )}
      </div>

      {/* Category Overview or Component Playground */}
      <div className="mt-4">
        {selectedComponent && componentRegistry[selectedComponent] ? (
          <EnhancedComponentPlayground
            key={selectedComponent}
            componentName={selectedComponent}
            config={componentRegistry[selectedComponent]}
          />
        ) : (
          <CategoryOverview
            category={selectedCategory}
            components={availableComponents}
            onComponentSelect={handleComponentChange}
          />
        )}
      </div>
    </div>
  );
}
