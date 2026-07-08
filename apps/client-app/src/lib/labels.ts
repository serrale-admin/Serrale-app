import type { Lang } from '../types';
import { useAppStore } from '../store/appStore';

/**
 * Substitute `{token}` placeholders in a localized template. Follows the same
 * `{...}`-token convention as `errors.rateLimitedMessageWait` ({wait}); the
 * completeness test asserts the token set is identical across EN and AM for
 * every template so a translation can never drop an interpolation.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

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
  /** Reusable single words / short phrases shared across many screens. */
  common: {
    back: string;
    cancel: string;
    clear: string;
    reset: string;
    filter: string;
    filters: string;
    loading: string;
    share: string;
    save: string;
    saved: string;
    verified: string;
    call: string;
    whatsapp: string;
    today: string;
    language: string;
    notifications: string;
    settings: string;
    helpSupport: string;
    safetyTips: string;
    savedProviders: string;
    browseProviders: string;
    loginWithPhone: string;
    welcomeToSerrale: string;
    requestService: string;
  };
  /** Screen-reader-only strings (accessibilityLabel) with no on-screen text. */
  a11y: {
    digit: string; // {n}
    loadingProviders: string;
    loadingProvider: string;
    loadingSuggestions: string;
    verifiedProvider: string;
    saveProvider: string; // {name}
    callProvider: string; // {name}
    whatsappProvider: string; // {name}
    location: string; // {area}
    searchProviders: string;
    searchSuggestions: string;
    filterCategories: string;
    selectService: string;
    selectArea: string;
    viewAllReviews: string;
    banner: string; // {n}
  };
  auth: {
    loginSubtitle: string;
    reasonProfile: string;
    reasonRequest: string;
    invalidPhone: string;
    sending: string;
    sendCode: string;
    continueAsGuest: string;
  };
  verify: {
    title: string;
    sentToPrefix: string;
    sentToSuffix: string;
    reenterPhone: string;
    enterCode: string;
    tempSession: string;
    expiredReRequest: string;
    codeExpired: string;
    incorrectCode: string;
    codeResent: string;
    resend: string;
    resendIn: string; // {seconds}
    changeNumber: string;
    demoAutofill: string;
    verifying: string;
    verify: string;
  };
  request: {
    title: string;
    subtitle: string;
    serviceLabel: string;
    servicePlaceholder: string;
    areaLabel: string;
    describeLabel: string;
    descPlaceholder: string;
    whenLabel: string;
    budgetLabel: string;
    contactLabel: string;
    submit: string;
    submitting: string;
    chooseService: string;
    describeWork: string;
    successTitle: string;
    successText: string; // {area}
    successDupTitle: string;
    successDupText: string;
    postAnother: string;
    gateTitle: string;
    gateText: string;
    continueBrowsing: string;
    when: { today: string; thisWeek: string; flexible: string };
    contact: { call: string; whatsapp: string; both: string };
    budget: {
      notSure: string;
      under1000: string;
      between1: string;
      between2: string;
      over7000: string;
    };
  };
  provider: {
    availableToday: string;
    hasPastWork: string;
    whatsappAvailable: string;
    yearsExperience: string; // {n}
    aboutExp: string; // {n} {area}
    aboutServing: string; // {area}
    reviewsMeta: string; // {n}
    about: string;
    services: string;
    noPastWork: string;
    reviews: string;
    noReviews: string;
    showingReviews: string;
    staySafe: string;
    safetyText: string;
    reportSent: string;
    reportProvider: string;
    linkCopied: string;
    reviewedBadge: string;
    pastWorkBadge: string;
    a11yRated: string; // {name} {service} {rating}
    a11yArea: string; // {name} {service} {area}
  };
  providersList: {
    emptyTitleYet: string;
    emptyTitle: string;
    emptyText: string;
    changeFilters: string;
    searching: string;
    suffixFor: string; // {q}
    suffixNear: string; // {area}
    nearMe: string; // {area}
    suggestOpensRequest: string; // {label}
    suggestSearch: string; // {label} {count}
    suggestCount: string; // {n}
  };
  categoryDetail: {
    providersNear: string; // {count} {area}
    providersNearNoCount: string; // {area}
  };
  categoriesIndex: {
    searchServices: string;
  };
  search: {
    noMatch: string; // {q}
  };
  bookmarks: {
    emptyTitle: string;
    emptyText: string;
  };
  settings: {
    accountInfo: string;
    guest: string;
    accountInfoToast: string;
    phoneNumber: string;
    notSet: string;
    defaultArea: string;
    notificationsToast: string;
    on: string;
    privacy: string;
    privacyToast: string;
    terms: string;
    termsToast: string;
    deleteAccount: string;
    deleteToast: string;
  };
  language: {
    default: string;
    amharic: string;
    selectedSuffix: string;
  };
  help: {
    callSupport: string;
    callingSupport: string;
    whatsappSupport: string;
    chatWithTeam: string;
    faq: string;
    commonQuestions: string;
    openingFaq: string;
    reportIssue: string;
    reportIssueSub: string;
    openingReport: string;
    telegram: string;
    joinCommunity: string;
    openingTelegram: string;
  };
  safety: {
    tip1Title: string;
    tip1Text: string;
    tip2Title: string;
    tip2Text: string;
    tip3Title: string;
    tip3Text: string;
    tip4Title: string;
    tip4Text: string;
  };
  profile: {
    becomeProvider: string;
    becomeProviderToast: string;
    myRequests: string;
    noRequests: string;
    noNotifications: string;
    logout: string;
    guestText: string;
  };
  contact: {
    calling: string; // {name}
    openingWhatsapp: string;
    waMessage: string; // {service}
    callTitle: string; // {name}
    callNow: string;
    messageTitle: string; // {name}
    onWhatsapp: string;
    openWhatsapp: string;
  };
  banner: {
    slide1Title: string;
    slide1Sub: string;
    slide2Title: string;
    slide2Sub: string;
    slide2Cta: string;
    slide3Title: string;
    slide3Sub: string;
    slide3Cta: string;
  };
  filter: {
    location: string;
    locationHint: string;
    showCount: string; // {count}
  };
  location: {
    title: string;
  };
  splash: {
    tagline: string;
    preparing: string;
  };
  home: {
    browseNear: string; // {area}
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
    waitSecond: string;
    waitSeconds: string;
    waitMinute: string;
    waitMinutes: string;
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
    common: {
      back: am ? 'ተመለስ' : 'Back',
      cancel: am ? 'ይቅር' : 'Cancel',
      clear: am ? 'አጽዳ' : 'Clear',
      reset: am ? 'ዳግም አስጀምር' : 'Reset',
      filter: am ? 'አጣራ' : 'Filter',
      filters: am ? 'ማጣሪያዎች' : 'Filters',
      loading: am ? 'በመጫን ላይ…' : 'Loading…',
      share: am ? 'አጋራ' : 'Share',
      save: am ? 'አስቀምጥ' : 'Save',
      saved: am ? 'ተቀምጧል' : 'Saved',
      verified: am ? 'የተረጋገጠ' : 'Verified',
      call: am ? 'ደውል' : 'Call',
      whatsapp: 'WhatsApp',
      today: am ? 'ዛሬ' : 'Today',
      language: am ? 'ቋንቋ' : 'Language',
      notifications: am ? 'ማሳወቂያዎች' : 'Notifications',
      settings: am ? 'ቅንብሮች' : 'Settings',
      helpSupport: am ? 'እገዛ እና ድጋፍ' : 'Help & Support',
      safetyTips: am ? 'የደህንነት ምክሮች' : 'Safety tips',
      savedProviders: am ? 'የተቀመጡ ባለሙያዎች' : 'Saved providers',
      browseProviders: am ? 'ባለሙያዎችን ያስሱ' : 'Browse providers',
      loginWithPhone: am ? 'በስልክ ይግቡ' : 'Log in with phone',
      welcomeToSerrale: am ? 'ወደ ሰራሌ እንኳን በደህና መጡ' : 'Welcome to SERRALE',
      requestService: am ? 'አገልግሎት ይጠይቁ' : 'Request service',
    },
    a11y: {
      digit: am ? 'አሃዝ {n}' : 'Digit {n}',
      loadingProviders: am ? 'ባለሙያዎችን በመጫን ላይ' : 'Loading providers',
      loadingProvider: am ? 'ባለሙያ በመጫን ላይ' : 'Loading provider',
      loadingSuggestions: am ? 'ጥቆማዎችን በመጫን ላይ' : 'Loading suggestions',
      verifiedProvider: am ? 'የተረጋገጠ ባለሙያ' : 'Verified provider',
      saveProvider: am ? '{name}ን አስቀምጥ' : 'Save {name}',
      callProvider: am ? '{name}ን ደውል' : 'Call {name}',
      whatsappProvider: am ? '{name}ን በ WhatsApp' : 'WhatsApp {name}',
      location: am ? 'አካባቢ፣ {area}' : 'Location, {area}',
      searchProviders: am ? 'ባለሙያዎችን ፈልግ' : 'Search providers',
      searchSuggestions: am ? 'የፍለጋ ጥቆማዎች' : 'Search suggestions',
      filterCategories: am ? 'ምድቦችን አጣራ' : 'Filter categories',
      selectService: am ? 'አገልግሎት ይምረጡ' : 'Select a service',
      selectArea: am ? 'አካባቢ ይምረጡ' : 'Select an area',
      viewAllReviews: am ? 'ሁሉንም ግምገማዎች ይመልከቱ' : 'View all reviews',
      banner: am ? 'ባነር {n}' : 'Banner {n}',
    },
    auth: {
      loginSubtitle: am
        ? 'ለመቀጠል የኢትዮጵያ ስልክ ቁጥርዎን ይጠቀሙ። የማረጋገጫ ኮድ በኤስኤምኤስ እንልካለን።'
        : "Use your Ethiopian phone number to continue. We'll send a verification code by SMS.",
      reasonProfile: am ? 'መገለጫዎን ለማስተዳደር ይግቡ' : 'Log in to manage your profile',
      reasonRequest: am ? 'ጥያቄ ለመለጠፍ ይግቡ' : 'Log in to post a request',
      invalidPhone: am
        ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912 345 678)።'
        : 'Enter a valid Ethiopian phone number (e.g. 0912 345 678).',
      sending: am ? 'በመላክ ላይ…' : 'Sending…',
      sendCode: am ? 'ኮድ ላክ' : 'Send code',
      continueAsGuest: am ? 'እንደ እንግዳ ቀጥል' : 'Continue as guest',
    },
    verify: {
      title: am ? 'የማረጋገጫ ኮድ ያስገቡ' : 'Enter verification code',
      sentToPrefix: am ? '6-አሃዝ ኮድ ወደ ' : 'We sent a 6-digit code to ',
      sentToSuffix: am ? ' ልከናል።' : '.',
      reenterPhone: am ? 'ኮድ ለመቀበል ስልክዎን እንደገና ያስገቡ' : 'Enter your phone again to receive a code',
      enterCode: am ? '6-አሃዙን ኮድ ያስገቡ።' : 'Enter the 6-digit code.',
      tempSession: am
        ? 'ጊዜያዊ የአገልጋይ ክፍለ ጊዜ ችግር። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።'
        : 'Temporary server session issue. Please try again in a moment.',
      expiredReRequest: am
        ? 'ማረጋገጫዎ አብቅቷል። እባክዎ አዲስ ኮድ ይጠይቁ።'
        : 'Your verification expired. Please request a new code.',
      codeExpired: am
        ? 'ያ ኮድ አብቅቷል። እባክዎ አዲስ ይጠይቁ።'
        : 'That code expired. Please request a new one.',
      incorrectCode: am
        ? 'ያ ኮድ ትክክል አይደለም። እባክዎ ኤስኤምኤሱን አረጋግጠው እንደገና ይሞክሩ።'
        : 'That code is incorrect. Please check the SMS and try again.',
      codeResent: am ? 'ኮድ እንደገና ተልኳል' : 'Code resent',
      resend: am ? 'ኮድ እንደገና ላክ' : 'Resend code',
      resendIn: am ? 'ኮድ እንደገና ላክ በ{seconds}ሰ' : 'Resend code in {seconds}s',
      changeNumber: am ? 'ቁጥር ቀይር' : 'Change number',
      demoAutofill: am ? 'ማሳያ፡ ኮዱን በራስ-ሙላ' : 'Demo: auto-fill code',
      verifying: am ? 'በማረጋገጥ ላይ…' : 'Verifying…',
      verify: am ? 'አረጋግጥ' : 'Verify',
    },
    request: {
      title: am ? 'ጥያቄ ለጥፍ' : 'Post a request',
      subtitle: am
        ? 'የሚፈልጉትን ይንገሩን — ጥቂት ጊዜ ብቻ ይወስዳል።'
        : 'Tell us what you need — it only takes a moment.',
      serviceLabel: am ? 'ምን አገልግሎት ይፈልጋሉ?' : 'What service do you need?',
      servicePlaceholder: am ? 'ለምሳሌ ቧንቧ ሰራተኛ፣ አጽጂ፣ ቀለም ቀቢ' : 'e.g. plumber, cleaner, painter',
      areaLabel: am ? 'የት ይፈልጉታል?' : 'Where do you need it?',
      describeLabel: am ? 'ስራውን ይግለጹ' : 'Describe the work',
      descPlaceholder: am
        ? 'ለምሳሌ፡ የሚያፈስ ማጠቢያ ገንዳ ማስተካከል እፈልጋለሁ።'
        : 'Example: I need help fixing a leaking sink.',
      whenLabel: am ? 'መቼ ይፈልጉታል?' : 'When do you need it?',
      budgetLabel: am ? 'በጀት' : 'Budget',
      contactLabel: am ? 'ባለሙያዎች እንዴት ያግኙዎት?' : 'How should providers contact you?',
      submit: am ? 'ጥያቄ አስገባ' : 'Submit request',
      submitting: am ? 'በማስገባት ላይ…' : 'Submitting…',
      chooseService: am ? 'አገልግሎት ይምረጡ' : 'Choose a service',
      describeWork: am ? 'ስራውን በአጭሩ ይግለጹ' : 'Describe the work briefly',
      successTitle: am ? 'ጥያቄዎ ደርሶናል' : 'We received your request',
      successText: am
        ? 'ሰራሌ ጥያቄዎን በ{area} አካባቢ ካሉ ተስማሚ ባለሙያዎች ጋር ለማገናኘት ይረዳል።'
        : 'SERRALE will help match your request with relevant providers near {area}.',
      successDupTitle: am ? 'ጥያቄዎ አስቀድሞ ገብቷል' : 'Your request is already in',
      successDupText: am
        ? 'ይህን ጥያቄ አስቀድመን ይዘናል — እንደገና መላክ አያስፈልግም። ሰራሌ ከባለሙያዎች ጋር ማገናኘቱን ይቀጥላል።'
        : 'We already have this request on file — no need to send it again. SERRALE will keep matching it with providers.',
      postAnother: am ? 'ሌላ ጥያቄ ለጥፍ' : 'Post another request',
      gateTitle: am ? 'የአገልግሎት ጥያቄ ለጥፍ' : 'Post a service request',
      gateText: am
        ? 'ለሰራሌ የሚፈልጉትን ለመንገር በስልክዎ ይግቡ። ትክክለኛውን ባለሙያ እንዲያገኙ እንረዳዎታለን።'
        : "Log in with your phone to tell SERRALE what you need. We'll help you find the right provider.",
      continueBrowsing: am ? 'ማሰስ ቀጥል' : 'Continue browsing',
      when: {
        today: am ? 'ዛሬ' : 'Today',
        thisWeek: am ? 'በዚህ ሳምንት' : 'This week',
        flexible: am ? 'ተለዋዋጭ' : 'Flexible',
      },
      contact: {
        call: am ? 'ደውል' : 'Call',
        whatsapp: 'WhatsApp',
        both: am ? 'ሁለቱም' : 'Both',
      },
      budget: {
        notSure: am ? 'እርግጠኛ አይደለሁም' : 'Not sure',
        under1000: am ? 'ከ1,000 ብር በታች' : 'Under 1,000 ETB',
        between1: am ? '1,000–3,000 ብር' : '1,000–3,000 ETB',
        between2: am ? '3,000–7,000 ብር' : '3,000–7,000 ETB',
        over7000: am ? '7,000+ ብር' : '7,000+ ETB',
      },
    },
    provider: {
      availableToday: am ? 'ዛሬ ይገኛል' : 'Available today',
      hasPastWork: am ? 'ያለፈ ስራ አለው' : 'Has past work',
      whatsappAvailable: am ? 'WhatsApp አለ' : 'WhatsApp available',
      yearsExperience: am ? '{n} ዓመት ልምድ' : '{n} years experience',
      aboutExp: am
        ? 'በ{area} በማገልገል {n} ዓመት የተግባር ልምድ።'
        : '{n} years of hands-on experience, serving {area}.',
      aboutServing: am ? 'በ{area} በማገልገል ላይ።' : 'Serving {area}.',
      reviewsMeta: am ? '· {n} ግምገማ ·' : '· {n} reviews ·',
      about: am ? 'ስለ' : 'About',
      services: am ? 'አገልግሎቶች' : 'Services',
      noPastWork: am ? 'እስካሁን ያለፈ ስራ አልተጨመረም።' : 'No past work added yet.',
      reviews: am ? 'ግምገማዎች' : 'Reviews',
      noReviews: am ? 'እስካሁን ግምገማ የለም።' : 'No reviews yet.',
      showingReviews: am ? 'ሁሉንም ግምገማዎች በማሳየት ላይ' : 'Showing all reviews',
      staySafe: am ? 'ደህንነትዎን ይጠብቁ' : 'Stay safe',
      safetyText: am
        ? 'ስራ ከመጀመርዎ በፊት ዋጋ፣ ጊዜና የስራ ስፋትን በግልጽ ይስማሙ።'
        : 'Agree on price, time, and work scope clearly before starting work.',
      reportSent: am ? 'ሪፖርት ወደ ሰራሌ ተልኳል' : 'Report sent to SERRALE',
      reportProvider: am ? 'ባለሙያ ሪፖርት አድርግ' : 'Report provider',
      linkCopied: am ? 'የመገለጫ አገናኝ ተቀድቷል' : 'Profile link copied',
      reviewedBadge: am ? 'ተገምግሟል' : 'Reviewed',
      pastWorkBadge: am ? 'ያለፈ ስራ' : 'Past work',
      a11yRated: am ? '{name}፣ {service}፣ ደረጃ {rating}' : '{name}, {service}, rated {rating}',
      a11yArea: am ? '{name}፣ {service}፣ {area}' : '{name}, {service}, {area}',
    },
    providersList: {
      emptyTitleYet: am ? 'እስካሁን ባለሙያ አልተገኘም' : 'No providers found yet',
      emptyTitle: am ? 'ባለሙያ አልተገኘም' : 'No providers found',
      emptyText: am
        ? 'ሌላ አካባቢ ይሞክሩ ወይም እርዳታ ይጠይቁ እኛም ባለሙያ እንፈልጋለን።'
        : 'Try another area or request help and we will look for a provider.',
      changeFilters: am ? 'ማጣሪያዎችን ቀይር' : 'Change filters',
      searching: am ? 'በመፈለግ ላይ…' : 'Searching…',
      suffixFor: am ? ' ለ "{q}"' : ' for "{q}"',
      suffixNear: am ? ' በ{area} አካባቢ' : ' near {area}',
      nearMe: am ? 'በአቅራቢያዬ ({area})' : 'Near me ({area})',
      suggestOpensRequest: am
        ? '{label}። የአገልግሎት ጥያቄ ቅጹን ይከፍታል'
        : '{label}. Opens the service request form',
      suggestSearch: am ? 'የፍለጋ ጥቆማ፡ {label}{count}' : 'Search suggestion: {label}{count}',
      suggestCount: am ? '፣ {n} ባለሙያዎች' : ', {n} providers',
    },
    categoryDetail: {
      providersNear: am ? '{count} ባለሙያዎች በ{area} አካባቢ' : '{count} providers near {area}',
      providersNearNoCount: am ? 'ባለሙያዎች በ{area} አካባቢ' : 'Providers near {area}',
    },
    categoriesIndex: {
      searchServices: am ? 'አገልግሎቶች ፈልግ' : 'Search services',
    },
    search: {
      noMatch: am ? '“{q}” የሚዛመድ ምድብ የለም።' : 'No categories match “{q}”.',
    },
    bookmarks: {
      emptyTitle: am ? 'እስካሁን የተቀመጠ ባለሙያ የለም' : 'No saved providers yet',
      emptyText: am
        ? 'እዚህ ለማስቀመጥ በማንኛውም ባለሙያ ላይ ያለውን የዕልባት ምልክት ይንኩ።'
        : 'Tap the bookmark icon on any provider to save them here.',
    },
    settings: {
      accountInfo: am ? 'የመለያ መረጃ' : 'Account information',
      guest: am ? 'እንግዳ' : 'Guest',
      accountInfoToast: am ? 'የመለያ መረጃ' : 'Account info',
      phoneNumber: am ? 'ስልክ ቁጥር' : 'Phone number',
      notSet: am ? 'አልተዘጋጀም' : 'Not set',
      defaultArea: am ? 'ነባሪ አካባቢ' : 'Default area',
      notificationsToast: am ? 'የማሳወቂያ ቅንብሮች' : 'Notification settings',
      on: am ? 'በርቷል' : 'On',
      privacy: am ? 'ግላዊነት' : 'Privacy',
      privacyToast: am ? 'የግላዊነት ቅንብሮች' : 'Privacy settings',
      terms: am ? 'ውሎች እና ፖሊሲዎች' : 'Terms & policies',
      termsToast: am ? 'ውሎች' : 'Terms',
      deleteAccount: am ? 'መለያ ሰርዝ' : 'Delete account',
      deleteToast: am ? 'ለመሰረዝ ድጋፍን ያግኙ' : 'Contact support to delete',
    },
    language: {
      default: am ? 'ነባሪ' : 'Default',
      amharic: am ? 'አማርኛ' : 'Amharic',
      selectedSuffix: am ? '፣ ተመርጧል' : ', selected',
    },
    help: {
      callSupport: am ? 'ሰራሌ ድጋፍን ይደውሉ' : 'Call SERRALE support',
      callingSupport: am ? 'ሰራሌ ድጋፍን በመደወል ላይ…' : 'Calling SERRALE support…',
      whatsappSupport: am ? 'WhatsApp ድጋፍ' : 'WhatsApp support',
      chatWithTeam: am ? 'ከቡድናችን ጋር ይወያዩ' : 'Chat with our team',
      faq: am ? 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች' : 'Frequently asked questions',
      commonQuestions: am ? 'የተለመዱ ጥያቄዎች' : 'Common questions',
      openingFaq: am ? 'FAQ በመክፈት ላይ…' : 'Opening FAQ…',
      reportIssue: am ? 'ችግር ሪፖርት አድርግ' : 'Report an issue',
      reportIssueSub: am ? 'ምን እንደተሳሳተ ይንገሩን' : 'Tell us what went wrong',
      openingReport: am ? 'የሪፖርት ቅጽ በመክፈት ላይ…' : 'Report form opening…',
      telegram: am ? 'የቴሌግራም ማህበረሰብ' : 'Telegram community',
      joinCommunity: am ? 'ማህበረሰቡን ይቀላቀሉ' : 'Join the community',
      openingTelegram: am ? 'ቴሌግራም በመክፈት ላይ…' : 'Opening Telegram…',
    },
    safety: {
      tip1Title: am ? 'መጀመሪያ በውሎች ይስማሙ' : 'Agree on terms first',
      tip1Text: am
        ? 'ማንኛውም ስራ ከመጀመሩ በፊት ዋጋ፣ ጊዜና የስራ ስፋትን በግልጽ ይስማሙ።'
        : 'Agree on price, time, and work scope clearly before any work begins.',
      tip2Title: am ? 'የመተማመኛ ምልክቶችን ይምረጡ' : 'Prefer trust signals',
      tip2Text: am
        ? 'የተረጋገጡና በአስተዳዳሪ የተገመገሙ የሚታይ ያለፈ ስራ ያላቸውን ባለሙያዎች ይምረጡ።'
        : 'Choose verified and admin-reviewed providers with visible past work.',
      tip3Title: am ? 'በደህና ይገናኙ' : 'Meet safely',
      tip3Text: am
        ? 'ቦታውን ያረጋግጡ እና የመጀመሪያ ግንኙነትን በሰራሌ ውስጥ ያድርጉ።'
        : 'Confirm the location and keep initial contact within SERRALE.',
      tip4Title: am ? 'መዝገቦችን ይያዙ' : 'Keep records',
      tip4Text: am
        ? 'የባለሙያውን መገለጫ እና የተስማሙበትን ዝርዝር ያስቀምጡ።'
        : 'Save the provider profile and the details you agreed on.',
    },
    profile: {
      becomeProvider: am ? 'የአገልግሎት ባለሙያ ይሁኑ' : 'Become a service provider',
      becomeProviderToast: am ? 'የባለሙያ ምዝገባ በቅርቡ ይከፈታል' : 'Provider sign-up opening soon',
      myRequests: am ? 'የእኔ ጥያቄዎች' : 'My requests',
      noRequests: am ? 'እስካሁን ንቁ ጥያቄ የለም' : 'No active requests yet',
      noNotifications: am ? 'አዲስ ማሳወቂያ የለም' : 'No new notifications',
      logout: am ? 'ውጣ' : 'Log out',
      guestText: am
        ? 'ባለሙያዎችን ለማስቀመጥ እና ጥያቄዎችን ለማስተዳደር በስልክ ይቀጥሉ።'
        : 'Continue with phone to save providers and manage requests.',
    },
    contact: {
      calling: am ? '{name}ን በመደወል ላይ…' : 'Calling {name}…',
      openingWhatsapp: am ? 'WhatsApp በመክፈት ላይ…' : 'Opening WhatsApp…',
      waMessage: am
        ? 'ሰላም፣ አገልግሎትዎን በሰራሌ አገኘሁ። በ{service} እርዳታ እፈልጋለሁ። ትገኛለህ?'
        : 'Hello, I found your service on SERRALE. I need help with {service}. Are you available?',
      callTitle: am ? '{name}ን ይደውሉ?' : 'Call {name}?',
      callNow: am ? 'አሁን ደውል' : 'Call now',
      messageTitle: am ? '{name}ን መልእክት ላክ' : 'Message {name}',
      onWhatsapp: am ? 'በ WhatsApp' : 'on WhatsApp',
      openWhatsapp: am ? 'WhatsApp ክፈት' : 'Open WhatsApp',
    },
    banner: {
      slide1Title: am ? 'የተረጋገጡ፣ በአስተዳዳሪ የተገመገሙ ባለሙያዎች' : 'Verified, admin-reviewed pros',
      slide1Sub: am ? 'በአቅራቢያዎ የታመኑ የአካባቢ ባለሙያዎች' : 'Trusted local providers near you',
      slide2Title: am ? 'ባለሙያ ይፈልጋሉ? እንረዳዎታለን' : "Need a provider? We'll help",
      slide2Sub: am ? 'ከአንድ ደቂቃ ባነሰ ጊዜ ጥያቄ ይለጥፉ' : 'Post a request in under a minute',
      slide2Cta: am ? 'ጠይቅ' : 'Request',
      slide3Title: am ? 'በቀጥታ ይደውሉ ወይም WhatsApp ያድርጉ' : 'Call or WhatsApp directly',
      slide3Sub: am ? 'የአካባቢ ባለሙያዎችን ወዲያውኑ ያግኙ' : 'Reach local providers instantly',
      slide3Cta: am ? 'አስስ' : 'Browse',
    },
    filter: {
      location: am ? 'አካባቢ' : 'Location',
      locationHint: am
        ? 'አንድ አካባቢ ይምረጡ፣ ወይም ለመላው አዲስ አበባ ምንም አይምረጡ።'
        : 'Pick one area, or none for all of Addis Ababa.',
      showCount: am ? '{count} ባለሙያዎችን አሳይ' : 'Show {count} providers',
    },
    location: {
      title: am ? 'አካባቢ ይምረጡ' : 'Choose area',
    },
    splash: {
      tagline: am ? 'የታመኑ የአካባቢ አገልግሎቶች' : 'Trusted local services',
      preparing: am ? 'አካባቢዎን በማዘጋጀት ላይ…' : 'Preparing your area…',
    },
    home: {
      browseNear: am ? 'በ{area} አካባቢ ያሉ ባለሙያዎችን ያስሱ' : 'Browse providers near {area}',
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
      waitSecond: am ? 'ሰከንድ' : 'second',
      waitSeconds: am ? 'ሰከንድ' : 'seconds',
      waitMinute: am ? 'ደቂቃ' : 'minute',
      waitMinutes: am ? 'ደቂቃ' : 'minutes',
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
