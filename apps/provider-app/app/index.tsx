import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAccessToken } from "@serrale/auth";

import { ProviderLoadingScreen } from "../src/screens/provider/ProviderLoadingScreen";

export default function ProviderIndexScreen() {
  const router = useRouter();

  useEffect(() => {
    getAccessToken()
      .then((token) => {
        if (token) {
          router.replace("/tabs/home");
          return;
        }

        router.replace("/auth/login");
      })
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router]);

  return <ProviderLoadingScreen message="Preparing your account..." />;
}
