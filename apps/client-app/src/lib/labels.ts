import type { Lang } from '../types';
import { useAppStore } from '../store/appStore';

export interface Labels {
  tabs: { home: string; search: string; request: string; profile: string };
  searchPlaceholder: string;
  nearbyTitle: string;
  popularTitle: string;
  verifiedTitle: string;
  pastWorkTitle: string;
  viewAll: string;
}

export function labelsFor(lang: Lang): Labels {
  const am = lang === 'am';
  return {
    tabs: {
      home: am ? 'መነሻ' : 'Home',
      search: am ? 'ፈልግ' : 'Search',
      request: am ? 'ጥያቄ' : 'Request',
      profile: am ? 'መገለጫ' : 'Profile',
    },
    searchPlaceholder: am ? 'ባለሙያ ፈልግ…' : 'Search plumber, painter, nanny…',
    nearbyTitle: am ? 'በአቅራቢያ ያሉ' : 'Nearby providers',
    popularTitle: am ? 'ታዋቂ ምድቦች' : 'Popular categories',
    verifiedTitle: am ? 'የተረጋገጡ' : 'Verified providers',
    pastWorkTitle: am ? 'የቀደመ ስራ' : 'Recent work',
    viewAll: am ? 'ሁሉንም' : 'View all',
  };
}

/** Returns localized labels reactive to the current language. */
export function useLabels(): Labels {
  const lang = useAppStore((s) => s.lang);
  return labelsFor(lang);
}
