import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type TabWidthsById } from '@/ui/layout/tab-list/types/TabWidthsById';
import { calculateVisibleTabCount } from '@/ui/layout/tab-list/utils/calculateVisibleTabCount';
import { useMemo } from 'react';

type UseTabListOverflowProps = {
  visibleTabs: SingleTabProps[];
  tabWidthsById: TabWidthsById;
  containerWidth: number;
  moreButtonWidth: number;
  addButtonWidth: number;
  hasAddButton: boolean;
  activeTabId: string | null;
};

export type UseTabListOverflowResult = {
  visibleTabCount: number;
  overflowingTabs: SingleTabProps[];
  overflowCount: number;
  hasOverflowingTabs: boolean;
  isActiveTabInOverflow: boolean;
};

export const useTabListOverflow = ({
  visibleTabs,
  tabWidthsById,
  containerWidth,
  moreButtonWidth,
  addButtonWidth,
  hasAddButton,
  activeTabId,
}: UseTabListOverflowProps): UseTabListOverflowResult => {
  const visibleTabCount = useMemo(() => {
    return calculateVisibleTabCount({
      visibleTabs,
      tabWidthsById,
      containerWidth,
      moreButtonWidth,
      addButtonWidth: hasAddButton ? addButtonWidth : 0,
    });
  }, [
    visibleTabs,
    tabWidthsById,
    containerWidth,
    moreButtonWidth,
    addButtonWidth,
    hasAddButton,
  ]);

  const overflowingTabs = useMemo(
    () => visibleTabs.slice(visibleTabCount),
    [visibleTabs, visibleTabCount],
  );

  const overflowCount = overflowingTabs.length;
  const hasOverflowingTabs = overflowCount > 0;

  const isActiveTabInOverflow = useMemo(
    () =>
      activeTabId !== null &&
      overflowingTabs.some((tab) => tab.id === activeTabId),
    [activeTabId, overflowingTabs],
  );

  return {
    visibleTabCount,
    overflowingTabs,
    overflowCount,
    hasOverflowingTabs,
    isActiveTabInOverflow,
  };
};
