import { useState } from 'react';

export type Stage = 'form' | 'brief' | 'article';

export const useStageNavigation = () => {
  const [stage, setStage] = useState<Stage>('form');

  const goToStage = (newStage: Stage) => {
    setStage(newStage);
  };

  const resetFlow = () => {
    setStage('form');
  };

  return {
    stage,
    goToStage,
    resetFlow,
    setStage
  };
};