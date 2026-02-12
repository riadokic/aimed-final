"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { ProfileCompletionGate } from "@/components/auth/profile-completion-modal";
import { useAuth } from "@/components/auth/auth-provider";

const PUBLIC_PATHS = ["/login", "/registracija", "/reset-password", "/politika-privatnosti", "/uslovi-koristenja", "/gdpr-sigurnost"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isPublicPage =
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Public pages (landing, auth) — render children directly (no sidebar, no consent gate)
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Loading state — show nothing while checking session
  if (loading) {
    return null;
  }

  // Not authenticated — middleware handles redirect, but render nothing as fallback
  if (!user) {
    return null;
  }

  // Authenticated — profile completion → app
  return (
    <ProfileCompletionGate>
      <Sidebar />
      <PageContainer>{children}</PageContainer>
    </ProfileCompletionGate>
  );
}
