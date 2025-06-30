'use client';

import { useEffect } from 'react';

export default function BackendWakeup() {
  useEffect(() => {
    const wakeupBackend = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
      } catch (error) {
        console.log('Backend wake-up call failed (this is normal if backend is starting up)');
      }
    };

    wakeupBackend();
  }, []);

  return null;
}