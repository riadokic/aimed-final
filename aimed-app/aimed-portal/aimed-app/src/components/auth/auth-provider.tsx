"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const PUBLIC_PATHS = ["/login", "/registracija", "/reset-password", "/politika-privatnosti", "/uslovi-koristenja", "/gdpr-sigurnost"];

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => { },
  signInWithGoogle: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep ref in sync so the auth listener always has the latest pathname
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes — redirect to dashboard on SIGNED_IN if on public page
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        const current = pathnameRef.current;
        const isPublic =
          current === "/" ||
          PUBLIC_PATHS.some((p) => current.startsWith(p));
        if (isPublic) {
          router.push("/dashboard");
          router.refresh();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function signInWithGoogle() {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
