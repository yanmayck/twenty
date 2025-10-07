import { type ReactNode, useMemo, useState } from 'react';

import { TabListInitialActiveTabEffect } from '@/ui/layout/tab-list/components/TabListInitialActiveTabEffect';
import {
  TabListContextProvider,
  type TabListContextValue,
} from '@/ui/layout/tab-list/contexts/TabListContext';
import { useTabListOverflow } from '@/ui/layout/tab-list/hooks/useTabListOverflow';
import { useTabListSelection } from '@/ui/layout/tab-list/hooks/useTabListSelection';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { type OnDragEndResponder } from '@hello-pangea/dnd';

export type TabListProviderProps = {
  visibleTabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
  onAddTab?: () => void;
  isDraggable?: boolean;
  onDragEnd?: OnDragEndResponder;
  children: ReactNode;
};

export const TabListProvider = ({
  visibleTabs,
  loading,
  behaveAsLinks,
  className,
  componentInstanceId,
  onChangeTab,
  onAddTab,
  isDraggable,
  onDragEnd,
  children,
}: TabListProviderProps) => {
  const [tabWidthsById, setTabWidthsById] = useState<TabWidthsById>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [moreButtonWidth, setMoreButtonWidth] = useState(0);
  const [addButtonWidth, setAddButtonWidth] = useState(0);

  const handleTabWidthChange = (
    dimensions: { width: number; height: number },
    tabId?: string,
  ) => {
    if (!tabId) return;

    setTabWidthsById((prev) => {
      if (prev[tabId] !== dimensions.width) {
        return {
          ...prev,
          [tabId]: dimensions.width,
        };
      }

      return prev;
    });
  };

  const handleContainerWidthChange = (dimensions: {
    width: number;
    height: number;
  }) => {
    setContainerWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  };

  const handleMoreButtonWidthChange = (dimensions: {
    width: number;
    height: number;
  }) => {
    setMoreButtonWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  };

  const handleAddButtonWidthChange = (dimensions: {
    width: number;
    height: number;
  }) => {
    setAddButtonWidth((prev) => {
      return prev !== dimensions.width ? dimensions.width : prev;
    });
  };

  const { activeTabId, setActiveTabId, onTabSelect, onTabSelectFromDropdown } =
    useTabListSelection({
      behaveAsLinks,
      componentInstanceId,
      onChangeTab,
    });

  const {
    visibleTabCount,
    overflowingTabs,
    overflowCount,
    hasOverflowingTabs,
    isActiveTabInOverflow,
  } = useTabListOverflow({
    visibleTabs,
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    hasAddButton: !!onAddTab,
    activeTabId,
  });

  const initialActiveTabId = useMemo(() => {
    if (visibleTabs.length === 0) {
      return null;
    }

    const activeTabExists = visibleTabs.some((tab) => tab.id === activeTabId);
    return activeTabExists ? activeTabId : (visibleTabs[0]?.id ?? null);
  }, [visibleTabs, activeTabId]);

  const isDragAndDropEnabled = isDraggable === true && onDragEnd !== undefined;

  const dropdownId = `tab-overflow-${componentInstanceId}`;

  const contextValue: TabListContextValue = {
    visibleTabs,
    visibleTabCount,
    overflowingTabs,
    overflowCount,
    hasOverflowingTabs,
    overflow: {
      overflowCount,
      isActiveTabInOverflow,
    },
    activeTabId,
    loading,
    behaveAsLinks,
    className,
    dropdownId,
    onAddTab,
    onTabSelect,
    onTabSelectFromDropdown,
    onContainerWidthChange: handleContainerWidthChange,
    onTabWidthChange: handleTabWidthChange,
    onMoreButtonWidthChange: handleMoreButtonWidthChange,
    onAddButtonWidthChange: handleAddButtonWidthChange,
    isDragAndDropEnabled,
    onDragEnd,
  };

  return (
    <TabListContextProvider value={contextValue}>
      <TabListInitialActiveTabEffect
        initialActiveTabId={initialActiveTabId}
        onSyncActiveTabId={setActiveTabId}
        onChangeTab={onChangeTab}
      />
      {children}
    </TabListContextProvider>
  );
};
