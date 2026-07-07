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
  /**
   * User-facing copy for mapped failure classes and the crash-recovery screen.
   * Every string here is safe to show a user — it NEVER contains a stack trace,
   * backend internal, SQL/Supabase detail, or raw provider response. The
   * error-presentation mapper (`lib/error-presentation.ts`) resolves a caught
   * error to one of these {titleKey, messageKey} pairs.
   */
  errors: {
    /** Generic retry action + a few contextual variants. */
    retry: string;
    dismiss: string;
    goHome: string;
    signIn: string;
    // failure classes ---------------------------------------------------------
    offlineTitle: string;
    offlineMessage: string;
    /** DNS / TLS / connection-refused — a reachability failure, not plain offline. */
    connectionTitle: string;
    connectionMessage: string;
    timeoutTitle: string;
    timeoutMessage: string;
    /** 400 — the request was rejected as invalid. */
    validationTitle: string;
    validationMessage: string;
    /** 401 — session expired. Presented as a sign-in prompt, never a scary error. */
    sessionExpiredTitle: string;
    sessionExpiredMessage: string;
    /** 403 — not allowed. */
    forbiddenTitle: string;
    forbiddenMessage: string;
    /** 404 — not found. */
    notFoundTitle: string;
    notFoundMessage: string;
    /** 409 — conflict / duplicate. */
    conflictTitle: string;
    conflictMessage: string;
    /** 429 — rate limited. `{wait}` is substituted with a human wait when known. */
    rateLimitedTitle: string;
    rateLimitedMessage: string;
    rateLimitedMessageWait: string;
    /** 5xx — server error. */
    serverTitle: string;
    serverMessage: string;
    /** Non-JSON / malformed response body. */
    malformedTitle: string;
    malformedMessage: string;
    /** 503 + maintenance signal. */
    maintenanceTitle: string;
    maintenanceMessage: string;
    /** Catch-all for an unclassified error. */
    unknownTitle: string;
    unknownMessage: string;
  };
  /** Global crash-recovery (error boundary) screen. */
  recovery: {
    title: string;
    message: string;
    action: string;
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
    errors: {
      retry: am ? 'እንደገና ሞክር' : 'Try again',
      dismiss: am ? 'ዝጋ' : 'Dismiss',
      goHome: am ? 'ወደ መነሻ' : 'Go home',
      signIn: am ? 'ግባ' : 'Sign in',
      offlineTitle: am ? 'ከበይነመረብ ውጪ ነዎት' : "You're offline",
      offlineMessage: am
        ? 'ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።'
        : 'Check your connection and try again.',
      connectionTitle: am ? 'መገናኘት አልተቻለም' : "Couldn't connect",
      connectionMessage: am
        ? 'ሰራሌ ጋር መድረስ አልተቻለም። ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።'
        : "Couldn't reach SERRALE. Check your internet and try again.",
      timeoutTitle: am ? 'ጊዜው አልፏል' : 'Request timed out',
      timeoutMessage: am
        ? 'ግንኙነቱ ዘገየ። ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።'
        : 'The connection is slow. Check your internet and try again.',
      validationTitle: am ? 'ማረም ያስፈልጋል' : 'Please check your details',
      validationMessage: am
        ? 'ያስገቡት መረጃ ትክክል አይመስልም። አረጋግጠው እንደገና ይሞክሩ።'
        : "Some details don't look right. Please review and try again.",
      sessionExpiredTitle: am ? 'ከመለያዎ ወጥተዋል' : 'Signed out',
      sessionExpiredMessage: am
        ? 'ክፍለ ጊዜዎ አብቅቷል። ለመቀጠል እባክዎ እንደገና ይግቡ።'
        : 'Your session has expired. Please sign in again to continue.',
      forbiddenTitle: am ? 'አይፈቀድም' : 'Not allowed',
      forbiddenMessage: am
        ? 'ይህን ለማድረግ ፍቃድ የለዎትም።'
        : "You don't have permission to do that.",
      notFoundTitle: am ? 'አልተገኘም' : 'Not found',
      notFoundMessage: am
        ? 'የፈለጉት ነገር አልተገኘም። ተወግዶ ሊሆን ይችላል።'
        : "We couldn't find what you were looking for.",
      conflictTitle: am ? 'ቀድሞ ተከናውኗል' : 'Already done',
      conflictMessage: am
        ? 'ይህ ጥያቄ ቀድሞ ተልኳል። ደግመው መላክ አያስፈልግም።'
        : 'This was already submitted. No need to send it again.',
      rateLimitedTitle: am ? 'በጣም ብዙ ሙከራዎች' : 'Too many attempts',
      rateLimitedMessage: am
        ? 'ትንሽ ቆይተው እንደገና ይሞክሩ።'
        : 'Please wait a moment and try again.',
      rateLimitedMessageWait: am
        ? 'እባክዎ {wait} ጠብቀው እንደገና ይሞክሩ።'
        : 'Please wait {wait} and try again.',
      serverTitle: am ? 'የሆነ ችግር ተፈጥሯል' : 'Something went wrong',
      serverMessage: am
        ? 'በእኛ በኩል ችግር አጋጥሟል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።'
        : 'We hit a problem on our side. Please try again shortly.',
      malformedTitle: am ? 'ያልተጠበቀ ምላሽ' : 'Unexpected response',
      malformedMessage: am
        ? 'ያልተጠበቀ ምላሽ ደረሰን። እባክዎ እንደገና ይሞክሩ።'
        : 'We received an unexpected response. Please try again.',
      maintenanceTitle: am ? 'ጥገና በመካሄድ ላይ' : 'Under maintenance',
      maintenanceMessage: am
        ? 'ሰራሌ ለአጭር ጊዜ ጥገና ላይ ነው። እባክዎ ትንሽ ቆይተው ይመለሱ።'
        : 'SERRALE is briefly under maintenance. Please check back soon.',
      unknownTitle: am ? 'የሆነ ችግር ተፈጥሯል' : 'Something went wrong',
      unknownMessage: am
        ? 'እባክዎ እንደገና ይሞክሩ።'
        : 'Please try again.',
    },
    recovery: {
      title: am ? 'የሆነ ችግር ተፈጥሯል' : 'Something went wrong',
      message: am
        ? 'መተግበሪያው ያልተጠበቀ ችግር አጋጥሞታል። እንደገና ማስጀመር ብዙ ጊዜ ይፈታዋል።'
        : 'The app ran into an unexpected problem. Restarting usually fixes it.',
      action: am ? 'መተግበሪያውን እንደገና አስጀምር' : 'Restart the app',
    },
  };
}

/** Returns localized labels reactive to the current language. */
export function useLabels(): Labels {
  const lang = useAppStore((s) => s.lang);
  return labelsFor(lang);
}
