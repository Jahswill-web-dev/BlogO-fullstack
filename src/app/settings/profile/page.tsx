"use client";

import { Suspense } from "react";
import { ProfileSettingsEditor } from "@/components/modules/ProfileSettingsEditor";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfileSettingsEditor />
    </Suspense>
  );
}
