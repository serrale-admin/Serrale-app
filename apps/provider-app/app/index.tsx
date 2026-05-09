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

        // 1. Role Check
        if (me.user.role !== "service_provider") {
          console.warn("Invalid role for provider app:", me.user.role);
          await clearSession();
          router.replace("/auth/login");
          return;
        }

        // 2. Onboarding / Intake State Machine
        // Check if user has completed all mandatory onboarding steps
        const onboarding = me.onboarding;
        
        if (onboarding && onboarding.next_step && onboarding.next_step !== "completed") {
          const nextStep = onboarding.next_step;

          switch (nextStep) {
            case "identity_verification":
              // router.replace("/onboarding/identity"); 
              // For now, if screens don't exist, we fallback to home or a dedicated intake screen
              router.replace("/tabs/home");
              break;
            case "business_details":
              // router.replace("/onboarding/business");
              router.replace("/tabs/home");
              break;
            default:
              router.replace("/tabs/home");
          }
          return;
        }

        // 3. Success -> Dashboard
        router.replace("/tabs/home");
      } catch (error) {
        console.error("Boot verification failed:", error);
        // If it's a 401 or 403, clear session
        await clearSession();
        router.replace("/auth/login");
      }
    };

    bootstrap();
  }, [router]);

  return <ProviderLoadingScreen message="Verifying session..." />;
}
