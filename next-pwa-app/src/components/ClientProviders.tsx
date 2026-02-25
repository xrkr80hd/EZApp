"use client";

import useServiceWorker from "@/hooks/useServiceWorker";
import InstallPrompt from "@/components/InstallPrompt";

export default function ClientProviders() {
  useServiceWorker();

  return <InstallPrompt />;
}
