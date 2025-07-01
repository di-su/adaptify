import { useState } from 'react';

export const useExpandableSection = (totalSections: number = 0) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    const allSections = new Set<number>();
    for (let i = 0; i < totalSections; i++) {
      allSections.add(i);
    }
    setExpandedSections(allSections);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const isExpanded = (index: number) => expandedSections.has(index);

  return {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll,
    isExpanded
  };
};