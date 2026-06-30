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
  more: string;
  explore: string;
  adminReviewed: string;
  completed: string;
  providersWord: string;
  safetyTitle: string;
  safetySubtitle: string;
  categories: {
    title: string;
    searchPlaceholder: string;
    popular: string;
    homeServices: string;
    adminReviewed: string;
    topRated: string;
    fastReliable: string;
    needHelpFast: string;
    needHelpFastSub: string;
    requestService: string;
    adminReviewedProviders: string;
    adminReviewedProvidersSub: string;
    postRecentWork: string;
    postRecentWorkSub: string;
    addWork: string;
    explore: string;
  };
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
    more: am ? 'ተጨማሪ' : 'More',
    explore: am ? 'ክፈት' : 'Explore',
    adminReviewed: am ? 'በአስተዳዳሪ የተረጋገጠ' : 'Admin reviewed',
    completed: am ? 'ተጠናቋል' : 'Completed',
    providersWord: am ? 'ባለሙያዎች' : 'providers',
    safetyTitle: am ? 'ከሰራሌ ጋር ደህንነትዎን ይጠብቁ' : 'Stay safe with SERRALE',
    safetySubtitle: am
      ? 'ስራ ከመጀመርዎ በፊት ዋጋ፣ ጊዜና የስራ ስፋት ይስማሙ።'
      : 'Agree on price, time, and work scope before starting.',
    categories: {
      title: am ? 'ምድቦች' : 'Categories',
      searchPlaceholder: am ? 'ምድቦች ፈልግ…' : 'Search categories…',
      popular: am ? 'ታዋቂ' : 'Popular',
      homeServices: am ? 'የቤት አገልግሎት' : 'Home services',
      adminReviewed: am ? 'የተረጋገጠ' : 'Admin reviewed',
      topRated: am ? 'ከፍተኛ ደረጃ' : 'Top rated',
      fastReliable: am ? 'ፈጣን እና አስተማማኝ' : 'FAST & RELIABLE',
      needHelpFast: am ? 'ፈጣን እርዳታ ይፈልጋሉ?' : 'Need help fast?',
      needHelpFastSub: am
        ? 'በአቅራቢያዎ የተረጋገጡ ባለሙያዎችን ያግኙ።'
        : 'Find verified local providers near you.',
      requestService: am ? 'አገልግሎት ይጠይቁ' : 'Request service',
      adminReviewedProviders: am ? 'በአስተዳዳሪ የተረጋገጡ ባለሙያዎች' : 'Admin-reviewed providers',
      adminReviewedProvidersSub: am
        ? 'የታመኑ ባለሙያዎችን በቀጥታ ይደውሉ ወይም በዋትስአፕ ያግኙ።'
        : 'Call or WhatsApp trusted providers directly.',
      postRecentWork: am ? 'የቅርብ ስራ ይለጥፉ' : 'Post recent work',
      postRecentWorkSub: am
        ? 'የተጠናቀቁ ስራዎችን አሳይተው እምነት ይገንቡ።'
        : 'Show completed jobs and build trust.',
      addWork: am ? 'ስራ ጨምር' : 'Add work',
      explore: am ? 'ክፈት' : 'Explore',
    },
  };
}

/** Returns localized labels reactive to the current language. */
export function useLabels(): Labels {
  const lang = useAppStore((s) => s.lang);
  return labelsFor(lang);
}
