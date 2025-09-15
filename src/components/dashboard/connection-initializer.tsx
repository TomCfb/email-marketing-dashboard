"use client";

import { useConnectionInit } from '@/hooks/use-connection-init';

export function ConnectionInitializer() {
  useConnectionInit();
  return null;
}
