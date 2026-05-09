import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAccessToken } from "@serrale/auth";
import { LoadingScreen } from "../src/client/screens/LoadingScreen";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      const token = await getAccessToken();
      
      // In development, if no token, go to login
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      router.replace("/tabs/home");
    };

    bootstrap();
  }, [router]);

  return <LoadingScreen />;
}
