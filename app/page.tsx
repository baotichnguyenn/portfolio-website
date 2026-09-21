'use client';

import { useCallback, useState } from 'react';
import { CareerDrawer } from '@/components/CareerDrawer';
import { Stage } from '@/components/Stage';

export default function Home() {
  const [careersOpen, setCareersOpen] = useState(false);
  const close = useCallback(() => setCareersOpen(false), []);
  const open = useCallback(() => setCareersOpen(true), []);

  return (
    <main>
      <Stage pushed={careersOpen} onOpenCareers={open} />
      <CareerDrawer open={careersOpen} onClose={close} />
    </main>
  );
}
