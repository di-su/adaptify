import { useState } from 'react';

export type Tab = 'generator' | 'history';

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');

  return {
    activeTab,
    setActiveTab
  };
};