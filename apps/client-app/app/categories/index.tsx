import { Redirect } from 'expo-router';

/** Legacy `/categories` route — the Categories tab lives at `/(tabs)/search`. */
export default function CategoriesIndexRedirect() {
  return <Redirect href="/(tabs)/search" />;
}
