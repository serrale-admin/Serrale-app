import { useEffect } from "react";
import { useRouter } from "expo-router";
import { clearSession, getAccessToken } from "@serrale/auth";
import { fetchMe } from "@serrale/api";

import { ProviderLoadingScreen } from "../src/screens/provider/ProviderLoadingScreen";

export default function ProviderIndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getAccessToken();

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        // Verify token and role with backend
        const me = await fetchMe();

        if (me.user.role !== "service_provider") {
          console.warn("Invalid role for provider app:", me.user.role);
          await clearSession();
          router.replace("/auth/login");
          return;
        }

        // Check onboarding status (Step 4.6)
        if (me.onboarding?.next_step && me.onboarding.next_step !== "completed") {
          // If there is a specific intake screen, route there.
          // For now, we'll assume they go to home or we can add logic for specific steps.
          router.replace("/tabs/home"); 
        } else {
          router.replace("/tabs/home");
        }
      } catch (error) {
        console.error("Boot verification failed:", error);
        await clearSession();
        router.replace("/auth/login");
      }
    };

    bootstrap();
  }, [router]);

  return <ProviderLoadingScreen message="Verifying session..." />;
}
