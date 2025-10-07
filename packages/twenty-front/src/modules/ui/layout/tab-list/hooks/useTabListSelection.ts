import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type UseTabListSelectionProps = {
  behaveAsLinks: boolean;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
};

export type UseTabListSelectionResult = {
  activeTabId: string | null;
  setActiveTabId: (tabId: string | null) => void;
  onTabSelect: (tabId: string) => void;
  onTabSelectFromDropdown: (tabId: string) => void;
};

export const useTabListSelection = ({
  behaveAsLinks,
  componentInstanceId,
  onChangeTab,
}: UseTabListSelectionProps): UseTabListSelectionResult => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const handleTabSelect = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onChangeTab?.(tabId);
    },
    [setActiveTabId, onChangeTab],
  );

  const handleTabSelectFromDropdown = useCallback(
    (tabId: string) => {
      if (behaveAsLinks) {
        navigate(`#${tabId}`);
        onChangeTab?.(tabId);
        return;
      }

      handleTabSelect(tabId);
    },
    [behaveAsLinks, handleTabSelect, navigate, onChangeTab],
  );

  return {
    activeTabId,
    setActiveTabId,
    onTabSelect: handleTabSelect,
    onTabSelectFromDropdown: handleTabSelectFromDropdown,
  };
};
