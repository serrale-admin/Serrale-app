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
    allServices: string;
    repairsMaintenance: string;
    movingTransport: string;
    healthWellness: string;
    filterTitle: string;
    serviceGroups: string;
    sortBy: string;
    mostProviders: string;
    alphabetical: string;
    showCategories: string; // {count}
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
    optional: string;
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
    refresh: string;
  };
  auth: {
    loginSubtitle: string;
    loginBannerBadge: string;
    loginBannerTitle: string;
    loginBannerSub: string;
    reasonProfile: string;
    reasonRequest: string;
    invalidPhone: string;
    sending: string;
    sendCode: string;
    continueAsGuest: string;
    orDivider: string;
    createProfileLink: string;
    customerNotFound: string;
    customerRegisterLink: string;
    providerLoginLink: string;
  };
  authChooser: {
    loginTitle: string;
    loginDesc: string;
    hireBadge: string;
    hireTitle: string;
    hireDesc: string;
    hireCta: string;
    providerBadge: string;
    providerTitle: string;
    providerDesc: string;
    providerCta: string;
    providerPhoneDetected: string;
    providerPhoneDetectedNamed: string;
    accountDetectedProvider: string;
    accountDetectedProviderNamed: string;
    accountDetectedCustomer: string;
  };
  clientProfile: {
    title: string;
    subtitle: string;
    save: string;
    saving: string;
    saved: string;
    profileType: string;
    individual: string;
    company: string;
    fullName: string;
    fullNamePlaceholder: string;
    contactName: string;
    companyName: string;
    phone: string;
    area: string;
    selectArea: string;
    idNumber: string;
    idNumberPlaceholder: string;
    idPhoto: string;
    licenseNumber: string;
    licenseNumberPlaceholder: string;
    licensePhoto: string;
    docPlaceholder: string;
    privateDocsHint: string;
    incomplete: string;
    basicSectionYou: string;
    basicSectionArea: string;
    basicAreaHint: string;
    providerPrimaryHint: string;
    providerLoginTitle: string;
    providerLoginSub: string;
    providerLoginSuccess: string;
    providerNotFound: string;
    providerRegisterLink: string;
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
    /** Shown when backend delivery=review_code (Play review; no SMS). */
    reviewCodeHint: string;
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
    engagementLabel: string;
    whenLabel: string;
    budgetLabel: string;
    contactLabel: string;
    submit: string;
    submitting: string;
    chooseService: string;
    chooseArea: string;
    describeWork: string;
    successTitle: string;
    successText: string; // {area}
    successDupTitle: string;
    successDupText: string;
    successBody: string;
    postAnother: string;
    gateTitle: string;
    gateText: string;
    continueBrowsing: string;
    sectionDetails: string;
    sectionTiming: string;
    sectionContact: string;
    submitHint: string;
    heroBadge: string;
    engagement: { temporary: string; permanent: string };
    when: { emergency: string; today: string; thisWeek: string; flexible: string };
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
    temporaryAvailable: string;
    permanentAvailable: string;
    businessProvider: string;
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
  activity: {
    screenTitle: string;
    tabRequests: string;
    tabSaved: string;
    emptyTitle: string;
    emptyText: string;
    postRequest: string;
    loginTitle: string;
    loginText: string;
    detailTitle: string;
    timeline: string;
    postAnother: string;
    temporary: string;
    permanent: string;
    viewMyRequests: string;
    displayStatus: {
      submitted: string;
      in_progress: string;
      closed: string;
      unavailable: string;
    };
  };
  rating: {
    sheetTitle: string;
    sheetSub: string; // {name}
    starsA11y: string;
    commentPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    ctaRate: string;
    ctaSignIn: string;
    ctaNeedContact: string;
    ctaAlready: string; // {n}
    errorGeneric: string;
    errorTooSoon: string;
    errorVelocity: string;
    errorComment: string;
    errorRateLimited: string;
    errorNeedContact: string;
    errorAlready: string;
  };
  settings: {
    accountInfo: string;
    guest: string;
    accountInfoToast: string;
    phoneNumber: string;
    notSet: string;
    defaultArea: string;
    defaultAreaHint: string;
    notificationsToast: string;
    on: string;
    privacy: string;
    privacyToast: string;
    terms: string;
    termsToast: string;
    deleteAccount: string;
    deleteToast: string;
    editProfile: string;
    phoneReadOnly: string;
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
    switchToProvider: string;
    switchToProviderSub: string;
    switchToProviderRelogin: string;
    becomeProvider: string;
    becomeProviderToast: string;
    myRequests: string;
    noRequests: string;
    noNotifications: string;
    logout: string;
    guestText: string;
    completeProfileTitle: string;
    completeProfileBody: string;
    completeProfileCta: string;
    roleProvider: string;
    roleCustomer: string;
    editProfile: string;
    viewPublicProfile: string;
    manageListing: string;
    sectionAccount: string;
    sectionAppSettings: string;
    appSettingsSub: string;
    sectionPreferences: string;
    sectionSupport: string;
    quickRequest: string;
    quickSaved: string;
    listingCategory: string;
    listingArea: string;
    listingBio: string;
    editTitle: string;
    editSubtitleCustomer: string;
    editSubtitleProvider: string;
    saved: string;
    phoneLocked: string;
  };
  providerJoin: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sectionContact: string;
    sectionService: string;
    sectionAbout: string;
    fullName: string;
    phone: string;
    whatsapp: string;
    providerType: string;
    providerTypeIndividual: string;
    providerTypeBusiness: string;
    serviceCategory: string;
    selectCategory: string;
    engagementLabel: string;
    engagementHint: string;
    engagement: { temporary: string; permanent: string };
    area: string;
    selectArea: string;
    experience: string;
    experienceExample: string;
    photoTitle: string;
    photoDesc: string;
    description: string;
    descriptionPlaceholder: string;
    selectedCategory: string; // {category}
    termsPrefix: string;
    termsLink: string;
    termsSuffix: string;
    termsRequired: string;
    submit: string;
    submitHint: string;
    requiredFields: string;
    fullNameRequired: string;
    phoneRequired: string;
    whatsappInvalid: string;
    categoryRequired: string;
    engagementRequired: string;
    sendingOtp: string;
    otpSentTitle: string;
    otpSentBody: string; // {phone}
    verifyAndRegister: string;
    verifyingOtp: string;
    registering: string;
    editDetails: string;
    trustAside: string;
    haveAccount: string;
    loginLink: string;
    alreadyRegistered: string;
    successTitle: string;
    successText: string;
    goToAccount: string;
    backToProfile: string;
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
    engagement: string;
    engagementAll: string;
    engagementTemporary: string;
    engagementPermanent: string;
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
  /** Backend `error.code` strings mapped to user-safe copy (mirrors Basic web `err.*`). */
  apiErrors: {
    INVALID_PHONE: string;
    INVALID_WHATSAPP: string;
    OTP_REQUEST_FAILED: string;
    OTP_COOLDOWN: string;
    OTP_PHONE_RATE_LIMITED: string;
    OTP_DAILY_LIMIT: string;
    OTP_INCORRECT: string;
    OTP_MAX_ATTEMPTS: string;
    OTP_EXPIRED: string;
    OTP_NOT_FOUND: string;
    OTP_INVALID_STATUS: string;
    VALIDATION_ERROR: string;
    REGISTER_FAILED: string;
    PHONE_ALREADY_REGISTERED: string;
    CUSTOMER_NOT_FOUND: string;
    PROVIDER_NOT_FOUND: string;
    generic: string;
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
      allServices: am ? 'ሁሉም አገልግሎቶች' : 'All services',
      repairsMaintenance: am ? 'ጥገና እና እንክብካቤ' : 'Repairs & Maintenance',
      movingTransport: am ? 'ማንቀሳቀስ እና ትራንስፖርት' : 'Moving & Transport',
      healthWellness: am ? 'ጤና እና ዌልነስ' : 'Health & Wellness',
      filterTitle: am ? 'አገልግሎቶችን አጣራ' : 'Filter services',
      serviceGroups: am ? 'የአገልግሎት ቡድኖች' : 'Service groups',
      sortBy: am ? 'ደርድር' : 'Sort by',
      mostProviders: am ? 'ብዙ ባለሙያዎች' : 'Most providers',
      alphabetical: am ? 'በፊደል ቅደም ተከተል' : 'Alphabetical',
      showCategories: am ? '{count} ምድቦችን አሳይ' : 'Show {count} categories',
      popular: am ? 'ታዋቂ' : 'Popular',
      homeServices: am ? 'የቤት አገልግሎቶች' : 'Home Services',
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
      optional: am ? 'አማራጭ' : 'optional',
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
      refresh: am ? 'አድስ' : 'Refresh',
    },
    auth: {
      loginSubtitle: am
        ? 'ለመቀጠል የኢትዮጵያ ስልክ ቁጥርዎን ይጠቀሙ። የማረጋገጫ ኮድ በኤስኤምኤስ እንልካለን።'
        : "Use your Ethiopian phone number to continue. We'll send a verification code by SMS.",
      loginBannerBadge: am ? 'ፈጣን እና አስተማማኝ' : 'FAST & RELIABLE',
      loginBannerTitle: am ? 'ታመኑ ባለሙያዎችን ያግኙ' : 'Find trusted local help',
      loginBannerSub: am
        ? 'ባለሙያዎችን ይፈልጉ፣ ይደውሉ ወይም አገልግሎት ይጠይቁ።'
        : 'Browse providers, call, or request service near you.',
      reasonProfile: am ? 'መገለጫዎን ለማስተዳደር ይግቡ' : 'Log in to manage your profile',
      reasonRequest: am ? 'ጥያቄ ለመለጠፍ ይግቡ' : 'Log in to post a request',
      invalidPhone: am
        ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912 345 678)።'
        : 'Enter a valid Ethiopian phone number (e.g. 0912 345 678).',
      sending: am ? 'በመላክ ላይ…' : 'Sending…',
      sendCode: am ? 'ኮድ ላክ' : 'Send code',
      continueAsGuest: am ? 'እንደ እንግዳ ቀጥል' : 'Continue as guest',
      orDivider: am ? 'ወይም' : 'or',
      createProfileLink: am ? 'አዲስ መገለጫ ይፍጠሩ' : 'Create a new profile',
      customerNotFound: am
        ? 'በዚህ ስልክ ቁጥር የደንበኛ መለያ የለም። መጀመሪያ መገለጫ ይፍጠሩ።'
        : 'No customer account for this phone. Create a profile first.',
      customerRegisterLink: am ? 'የደንበኛ መገለጫ ይፍጠሩ' : 'Create a customer profile',
      providerLoginLink: am ? 'እንደ ባለሙያ ይግቡ' : 'Log in as a provider',
    },
    authChooser: {
      loginTitle: am ? 'ወደ SERRALE ይቀጥሉ' : 'Continue to SERRALE',
      loginDesc: am
        ? 'እርዳታ ለመጠየት ወይም አገልግሎት ለመስጠት ይምረጡ።'
        : 'Choose whether you need help or you offer services.',
      hireBadge: am ? 'ደንበኛ' : 'Customer',
      hireTitle: am ? 'እርዳታ እፈልጋለሁ' : 'I need help',
      hireDesc: am
        ? 'ባለሙያ ይፈልጉ፣ ይደውሉ ወይም የአገልግሎት ጥያቄ ይላኩ።'
        : 'Find providers, call them, or post a service request.',
      hireCta: am ? 'የደንበኛ መግቢያ' : 'Customer login',
      providerBadge: am ? 'ባለሙያ' : 'Provider',
      providerTitle: am ? 'አገልግሎት እሰጣለሁ' : 'I offer services',
      providerDesc: am
        ? 'የእርስዎን የባለሙያ መዝገብ ያስተዳድሩ እና ደንበኞችን ይቀበሉ።'
        : 'Manage your listing and connect with customers.',
      providerCta: am ? 'የባለሙያ መግቢያ' : 'Provider login',
      providerPhoneDetected: am
        ? 'ይህ ስልክ እንደ ባለሙያ ተመዝግቧል። የባለሙያ መግቢያ ኮድ በመላክ ላይ…'
        : 'This phone is registered as a provider. Sending provider login code…',
      providerPhoneDetectedNamed: am
        ? 'እንኳን በደህና ተመለሱ {name}! የባለሙያ መግቢያ ኮድ በመላክ ላይ…'
        : 'Welcome back, {name}! Sending your provider login code…',
      accountDetectedProvider: am
        ? 'የባለሙያ መለያ ተገኝቷል። የባለሙያ መግቢያ ኮድ በመላክ ላይ…'
        : 'Provider account found. Sending provider login code…',
      accountDetectedProviderNamed: am
        ? 'እንኳን በደህና ተመለሱ {name}! የባለሙያ መግቢያ ኮድ በመላክ ላይ…'
        : 'Welcome back, {name}! Sending provider login code…',
      accountDetectedCustomer: am
        ? 'የደንበኛ መለያ ተገኝቷል። የመግቢያ ኮድ በመላክ ላይ…'
        : 'Customer account found. Sending login code…',
    },
    clientProfile: {
      title: am ? 'መገለጫዎን ያጠናቁ' : 'Complete your profile',
      subtitle: am
        ? 'ስምዎን እና አካባቢዎን ይምረጡ — ለጥያቄዎች እና ለእውቂያ ብቻ ያስፈልጋል።'
        : 'Add your name and pick your area — just enough for requests and contact.',
      save: am ? 'መገለጫ አስቀምጥ' : 'Save profile',
      saving: am ? 'በመቀመጥ ላይ…' : 'Saving…',
      saved: am ? 'መገለጫ ተቀምጧል' : 'Profile saved',
      profileType: am ? 'የመገለጫ አይነት' : 'Profile type',
      individual: am ? 'ግለሰብ' : 'Individual',
      company: am ? 'ኩባንያ' : 'Company',
      fullName: am ? 'ሙሉ ስም' : 'Full name',
      fullNamePlaceholder: am ? 'እንደ መሰል ገብርኤል' : 'e.g. Abebe Kebede',
      contactName: am ? 'የእውቂያ ስም' : 'Contact name',
      companyName: am ? 'የኩባንያ ስም' : 'Company name',
      phone: am ? 'ስልክ' : 'Phone',
      area: am ? 'አካባቢ' : 'Area',
      selectArea: am ? 'አካባቢ ይምረጡ' : 'Select area',
      idNumber: am ? 'መታወቂያ ቁጥር' : 'ID number',
      idNumberPlaceholder: am ? 'የመታወቂያ ቁጥር' : 'National ID number',
      idPhoto: am ? 'መታወቂያ ፎቶ / ማጣቀሻ' : 'ID photo / reference',
      licenseNumber: am ? 'የንግድ ፈቃድ ቁጥር' : 'Business license number',
      licenseNumberPlaceholder: am ? 'የፈቃድ ቁጥር' : 'License number',
      licensePhoto: am ? 'ፈቃድ ፎቶ / ማጣቀሻ' : 'License photo / reference',
      docPlaceholder: am ? 'URL ወይም ማጣቀሻ (አማራጭ)' : 'URL or reference (optional)',
      privateDocsHint: am
        ? 'መታወቂያ እና ፈቃድ ሰነዶች በግል ይቆያሉ — በድረ-ገጽ ላይ ብቻ ይታያሉ።'
        : 'ID and license details stay private — visible to SERRALE ops only.',
      incomplete: am ? 'ስምዎን እና አካባቢዎን ይምረጡ።' : 'Enter your name and pick an area.',
      basicSectionYou: am ? 'ስለ እርስዎ' : 'About you',
      basicSectionArea: am ? 'አካባቢ' : 'Your area',
      basicAreaHint: am ? 'በየት እንደሚገኙ ይምረጡ — ባለሙያዎች አቅራቢያዎን ይመለከታሉ።' : 'Where you usually need help — providers see your general area.',
      providerPrimaryHint: am
        ? 'ይህ ስልክ እንደ ባለሙያ ተመዝግቧል። የባለሙያ መለያዎን ከመገለጫ ይመልከቱ።'
        : 'This phone is registered as a provider. Manage your listing from Profile.',
      providerLoginTitle: am ? 'የባለሙያ መግቢያ' : 'Provider account',
      providerLoginSub: am
        ? 'የተመዘገቡ ባለሙያ መለያዎን በስልክዎ ይግቡ።'
        : 'Sign in to your registered provider account with your phone.',
      providerLoginSuccess: am ? 'እንኳን በደህና መጡ!' : 'Welcome back!',
      providerNotFound: am ? 'በዚህ ስልክ ባለሙያ መለያ የለም። መጀመሪያ ይመዝገቡ።' : 'No provider account for this phone. Register first.',
      providerRegisterLink: am ? 'እንደ ባለሙያ ይመዝገቡ' : 'Register as a provider',
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
      reviewCodeHint: am
        ? 'ለዚህ የግምገማ መለያ ኤስኤምኤስ አይላክም። በፕሌይ ኮንሶል ማስታወሻዎች ውስጥ ያለውን የግምገማ ኮድ ያስገቡ።'
        : 'No SMS for this Play review number. Enter the fixed 6-digit review code from Play Console notes — do not wait for a text.',
      resend: am ? 'ኮድ እንደገና ላክ' : 'Resend code',
      resendIn: am ? 'ኮድ እንደገና ላክ በ{seconds}ሰ' : 'Resend code in {seconds}s',
      changeNumber: am ? 'ቁጥር ቀይር' : 'Change number',
      demoAutofill: am ? 'ማሳያ፡ ኮዱን በራስ-ሙላ' : 'Demo: auto-fill code',
      verifying: am ? 'በማረጋገጥ ላይ…' : 'Verifying…',
      verify: am ? 'አረጋግጥ' : 'Verify',
    },
    request: {
      title: am ? 'ምን አገልግሎት እንደሚፈልጉ ይንገሩን' : 'Tell us what service you need',
      subtitle: am
        ? 'የሚፈልጉትን ይንገሩን — ባለሙያዎች በአካባቢዎ ሊያገኙዎት ይችላሉ።'
        : 'Tell us what you need — providers in your area can reach you.',
      serviceLabel: am ? 'አገልግሎት' : 'Service',
      servicePlaceholder: am ? 'አገልግሎት ይምረጡ' : 'Choose service',
      areaLabel: am ? 'አካባቢ' : 'Area',
      describeLabel: am ? 'ምን ያስፈልግዎታል?' : 'What do you need?',
      descPlaceholder: am ? 'ችግኙን በአጭር ይግለጹ።' : 'Describe the issue briefly.',
      engagementLabel: am ? 'ለምን ያህል ጊዜ ያስፈልግዎታል?' : 'How long do you need help?',
      whenLabel: am ? 'መቼ ያስፈልግዎታል?' : 'When do you need them?',
      budgetLabel: am ? 'በጀት' : 'Budget',
      contactLabel: am ? 'እንዴት ይገናኙ?' : 'Contact via',
      submit: am ? 'ጥያቄ ላክ' : 'Send request',
      submitting: am ? 'በመላክ ላይ…' : 'Sending…',
      chooseService: am ? 'አገልግሎት ይምረጡ' : 'Choose a service',
      chooseArea: am ? 'አካባቢ ይምረጡ' : 'Choose an area',
      describeWork: am ? 'ስራውን በአጭሩ ይግለጹ' : 'Describe the work briefly',
      successTitle: am ? 'ጥያቄዎ በምርመራ ላይ ነው' : 'Under review',
      successText: am
        ? 'ሰራሌ ጥያቄዎን በ{area} ከተስማሚ ባለሙያዎች ጋር ለማገናኘት ይረዳል።'
        : 'SERRALE will help match your request with relevant providers near {area}.',
      successDupTitle: am ? 'ጥያቄዎ አስቀድሞ በምርመራ ላይ ነው' : 'Already under review',
      successDupText: am
        ? 'ይህን ጥያቄ አስቀድመው ልከዋል — ሰራሌ ባለሙያዎችን መጠቆም ይቀጥላል።'
        : 'You already sent this request. SERRALE will keep suggesting providers.',
      successBody: am
        ? 'ቡድናችን ጥያቄዎን እያገናኘ ነው። ተስማሚ ባለሙያዎች በስልክ ወይም WhatsApp ሊያግኙዎት ይችላሉ።'
        : 'Our team is reviewing your request. Matching providers may contact you by phone or WhatsApp.',
      postAnother: am ? 'ሌላ ጥያቄ' : 'Post another',
      gateTitle: am ? 'እርዳታ ይጠይቁ' : 'Request help',
      gateText: am
        ? 'በስልክዎ ይግቡ እና የሚፈልጉትን ይንገሩን — ትክክለኛውን ባለሙያ እንረዳዎታለን።'
        : 'Log in with your phone to tell us what you need. We will help you find the right provider.',
      continueBrowsing: am ? 'ማሰስ ቀጥል' : 'Continue browsing',
      sectionDetails: am ? 'ዝርዝር' : 'Details',
      sectionTiming: am ? 'ጊዜ እና በጀት' : 'Timing & budget',
      sectionContact: am ? 'እውቂያ' : 'Contact',
      submitHint: am
        ? 'በአካባቢዎ ባለሙያዎች በስልክ ወይም WhatsApp ሊያግኙዎት ይችላሉ።'
        : 'Providers in your area may contact you by phone or WhatsApp.',
      heroBadge: am ? 'እርዳታ ይጠይቁ' : 'Request help',
      engagement: {
        temporary: am ? 'ጊዜያዊ' : 'Temporary',
        permanent: am ? 'ቋሚ' : 'Permanent',
      },
      when: {
        emergency: am ? 'አስቸኳይ' : 'Urgent',
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
      temporaryAvailable: am ? 'ለጊዜያዊ ሥራ ዝግጁ' : 'Available for temporary work',
      permanentAvailable: am ? 'ለቋሚ ሥራ ዝግጁ' : 'Available for permanent work',
      businessProvider: am ? 'ንግድ' : 'Business',
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
    activity: {
      screenTitle: am ? 'ጥያቄዎቼ' : 'My requests',
      tabRequests: am ? 'ጥያቄዎች' : 'Requests',
      tabSaved: am ? 'የተቀመጡ' : 'Saved',
      emptyTitle: am ? 'እስካሁን ጥያቄ የለም' : 'No requests yet',
      emptyText: am
        ? 'ጥያቄ ሲልኩ እዚህ ሁኔታውን እና ታሪኩን ማየት ይችላሉ።'
        : 'When you send a request, you can track its status and history here.',
      postRequest: am ? 'ጥያቄ ላክ' : 'Post a request',
      loginTitle: am ? 'ጥያቄዎችዎን ለማየት ይግቡ' : 'Log in to see your requests',
      loginText: am
        ? 'የተላኩ ጥያቄዎችዎን እና ሁኔታቸውን ለማየት በስልክ ይግቡ።'
        : 'Sign in with your phone to view submitted requests and their status.',
      detailTitle: am ? 'የጥያቄ ዝርዝር' : 'Request details',
      timeline: am ? 'ታሪክ' : 'Timeline',
      postAnother: am ? 'ሌላ ጥያቄ ላክ' : 'Post another',
      temporary: am ? 'ጊዜያዊ' : 'Temporary',
      permanent: am ? 'ቋሚ' : 'Permanent',
      viewMyRequests: am ? 'ጥያቄዎቼን ተመልከት' : 'View my requests',
      displayStatus: {
        submitted: am ? 'ተልኳል' : 'Submitted',
        in_progress: am ? 'በሂደት ላይ' : 'In progress',
        closed: am ? 'ተዘግቷል' : 'Closed',
        unavailable: am ? 'አልተገኘም' : 'Unavailable',
      },
    },
    rating: {
      sheetTitle: am ? 'ባለሙያውን ደረጃ ይስጡ' : 'Rate this provider',
      sheetSub: am
        ? 'ከ{name} ጋር ያለዎትን ልምድ ያጋሩ። ግምገማዎ ወዲያውኑ ይታያል።'
        : 'Share your experience with {name}. Your review goes live right away.',
      starsA11y: am ? 'ደረጃ ይምረጡ' : 'Choose a star rating',
      commentPlaceholder: am ? 'አማራጭ አስተያየት (አማራጭ)' : 'Optional comment',
      submit: am ? 'ግምገማ ላክ' : 'Submit review',
      submitting: am ? 'በመላክ ላይ…' : 'Submitting…',
      success: am ? 'አመሰግናለን — ግምገማዎ ቀጥታ ታይቷል።' : 'Thanks — your review is live.',
      ctaRate: am ? 'ደረጃ ይስጡ' : 'Rate',
      ctaSignIn: am ? 'ለመደረጃ መስጠት ይግቡ' : 'Sign in to rate',
      ctaNeedContact: am ? 'መጀመሪያ ይደውሉ ወይም WhatsApp ይላኩ' : 'Call or message first',
      ctaAlready: am ? 'እርስዎ ★{n} ሰጥተዋል' : 'You rated ★{n}',
      errorGeneric: am ? 'ግምገማ ማስገባት አልተቻለም። እንደገና ይሞክሩ።' : 'Could not submit your review. Try again.',
      errorTooSoon: am
        ? 'ከባለሙያው ጋር ካገናኙ በኋላ ትንሽ ይጠብቁ።'
        : 'Please wait a moment after contacting the provider before rating.',
      errorVelocity: am
        ? 'ዛሬ በጣም ብዙ ግምገማዎች ልከዋል። ነገ እንደገና ይሞክሩ።'
        : 'You have submitted too many reviews today. Try again tomorrow.',
      errorComment: am
        ? 'እባክዎ ያለ አገናኝ ወይም ስልክ ቁጥር አጭር ግምገማ ይጻፉ።'
        : 'Please write a short review without links or phone numbers.',
      errorRateLimited: am ? 'በጣም ብዙ ሙከራ። ትንሽ ቆይተው ይሞክሩ።' : 'Too many attempts. Please slow down and try again.',
      errorNeedContact: am ? 'መጀመሪያ ይደውሉ ወይም WhatsApp ይላኩ።' : 'Call or message the provider first.',
      errorAlready: am ? 'ይህን ባለሙያ አስቀድመው ደረጃ ሰጥተዋል።' : 'You have already rated this provider.',
    },
    settings: {
      accountInfo: am ? 'የመለያ መረጃ' : 'Account information',
      guest: am ? 'እንግዳ' : 'Guest',
      accountInfoToast: am ? 'የመለያ መረጃ' : 'Account info',
      phoneNumber: am ? 'ስልክ ቁጥር' : 'Phone number',
      notSet: am ? 'አልተዘጋጀም' : 'Not set',
      defaultArea: am ? 'የማሰስ አካባቢ' : 'Browse area',
      defaultAreaHint: am ? 'ባለሙያዎችን ለማሰስ ተጠቀም' : 'Used when browsing providers',
      notificationsToast: am ? 'የማሳወቂያ ቅንብሮች' : 'Notification settings',
      on: am ? 'በርቷል' : 'On',
      privacy: am ? 'ግላዊነት' : 'Privacy',
      privacyToast: am ? 'የግላዊነት ቅንብሮች' : 'Privacy settings',
      terms: am ? 'ውሎች እና ፖሊሲዎች' : 'Terms & policies',
      termsToast: am ? 'ውሎች' : 'Terms',
      deleteAccount: am ? 'መለያ ሰርዝ' : 'Delete account',
      deleteToast: am ? 'ለመሰረዝ ድጋፍን ያግኙ' : 'Contact support to delete',
      editProfile: am ? 'መገለጫ አርትዕ' : 'Edit profile',
      phoneReadOnly: am ? 'በ OTP የተረጋገጠ' : 'Verified by OTP',
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
      switchToProvider: am ? 'የባለሙያ መለያ ይጠቀሙ' : 'Switch to provider account',
      switchToProviderSub: am
        ? 'የ listing መገለጫዎን ለማስተዳደር ይቀይሩ።'
        : 'Manage your provider listing.',
      switchToProviderRelogin: am
        ? 'የባለሙያ መዳረሻ ለማደስ እንደገና በስልክ ይግቡ።'
        : 'Log out and sign in again with your phone to refresh provider access.',
      becomeProvider: am ? 'የአገልግሎት ባለሙያ ይሁኑ' : 'Become a service provider',
      becomeProviderToast: am ? 'የባለሙያ ምዝገባ በቅርቡ ይከፈታል' : 'Provider sign-up opening soon',
      myRequests: am ? 'የእኔ ጥያቄዎች' : 'My requests',
      noRequests: am ? 'እስካሁን ንቁ ጥያቄ የለም' : 'No active requests yet',
      noNotifications: am ? 'አዲስ ማሳወቂያ የለም' : 'No new notifications',
      logout: am ? 'ውጣ' : 'Log out',
      guestText: am
        ? 'ባለሙያዎችን ለማስቀመጥ እና ጥያቄዎችን ለማስተዳደር በስልክ ይቀጥሉ።'
        : 'Continue with phone to save providers and manage requests.',
      completeProfileTitle: am ? 'መገለጫዎን ያጠናቁ' : 'Complete your profile',
      completeProfileBody: am
        ? 'ስምዎን እና ቦታዎን ከዚህ መስክ ያክሉ — ጥያቄዎችን ለመለጠፍ ያስፈልጋል።'
        : 'Add your name and area here — required before posting requests.',
      completeProfileCta: am ? 'መገለጫ ለምን ያስፈልጋል?' : 'Why complete my profile?',
      roleProvider: am ? 'ባለሙያ' : 'Provider',
      roleCustomer: am ? 'ደንበኛ' : 'Customer',
      editProfile: am ? 'መገለጫ አርትዕ' : 'Edit profile',
      viewPublicProfile: am ? 'የህዝብ መገለጫ' : 'View public profile',
      manageListing: am ? 'የእርስዎ ዝርዝር' : 'Your listing',
      sectionAccount: am ? 'መለያ' : 'Account',
      sectionAppSettings: am ? 'የመተግበሪያ ቅንብሮች' : 'App settings',
      appSettingsSub: am ? 'አካባቢ፣ ግላዊነት እና ፖሊሲ' : 'Browse area, privacy & policies',
      sectionPreferences: am ? 'ምርጫዎች' : 'Preferences',
      sectionSupport: am ? 'ድጋፍ' : 'Support',
      quickRequest: am ? 'ጥያቄ' : 'Request',
      quickSaved: am ? 'ተቀመጡ' : 'Saved',
      listingCategory: am ? 'አገልግሎት' : 'Service',
      listingArea: am ? 'አካባቢ' : 'Area',
      listingBio: am ? 'ስለ ስራዎ' : 'About your work',
      editTitle: am ? 'መገለጫ አርትዕ' : 'Edit profile',
      editSubtitleCustomer: am
        ? 'ስምዎን እና አካባቢዎን ያዘምኑ — ጥያቄዎች እና እውቂያ ይህን ይጠቀማል።'
        : 'Update your name and area — used for requests and contact.',
      editSubtitleProvider: am
        ? 'የእርስዎን የባለሙያ listing ዝርዝሮችን ያዘምኑ።'
        : 'Update your provider listing details.',
      saved: am ? 'መገለጫ ተቀምጧል' : 'Profile saved',
      phoneLocked: am ? 'ስልክ በ OTP ተረጋግጧል — ለመቀየር ድጋፍን ያግኙ።' : 'Phone verified by OTP — contact support to change.',
    },
    providerJoin: {
      eyebrow: am ? 'ተመዝገብ' : 'Get listed',
      title: am ? 'በሰራሌ እንደ ባለሙያ ይቀላቀሉ' : 'Join SERRALE as a provider',
      subtitle: am
        ? 'ጥቂት መሰረታዊ መረጃ ያጋሩ እና ስልክዎን ያረጋግጡ። ፎቶ እና ሌሎቹ አማራጭ ናቸው።'
        : 'Share a few basic details and verify your phone. Photos and the rest are optional.',
      sectionContact: am ? 'የእርስዎ መረጃ' : 'Your details',
      sectionService: am ? 'የአገልግሎትዎ' : 'Your service',
      sectionAbout: am ? 'ስለ ስራዎ' : 'About your work',
      fullName: am ? 'ሙሉ ስም' : 'Full name',
      phone: am ? 'ስልክ ቁጥር' : 'Phone number',
      whatsapp: am ? 'የዋትስአፕ ቁጥር' : 'WhatsApp number',
      providerType: am ? 'የምዝገባ ዓይነት' : 'Registering as',
      providerTypeIndividual: am ? 'ግለሰብ ባለሙያ' : 'Individual provider',
      providerTypeBusiness: am ? 'ንግድ/የአገልግሎት ድርጅት' : 'Business / service company',
      serviceCategory: am ? 'የአገልግሎት ዘርፍ' : 'Service category',
      selectCategory: am ? 'ዘርፍ ይምረጡ' : 'Select a category',
      engagementLabel: am ? 'ለምን ዓይነት ሥራ ዝግጁ ነዎት?' : 'What work are you available for?',
      engagementHint: am ? 'ቢያንስ አንዱን ይምረጡ።' : 'Select at least one.',
      engagement: {
        temporary: am ? 'ጊዜያዊ' : 'Temporary',
        permanent: am ? 'ቋሚ' : 'Permanent',
      },
      area: am ? 'አካባቢ' : 'Area',
      selectArea: am ? 'አካባቢ ይምረጡ' : 'Select an area',
      experience: am ? 'ልምድ' : 'Experience',
      experienceExample: am ? 'ለምሳሌ፡ 5 ዓመት' : 'Example: 5 years',
      photoTitle: am ? 'የስራ ፎቶ መጫን (አማራጭ፣ በቅርብ ይመጣል)' : 'Work photo upload (optional, coming soon)',
      photoDesc: am ? 'ፎቶዎች በኋላ በስርዓቱ በኩል ይገናኛሉ።' : 'Photos will be connected later through a backend endpoint.',
      description: am ? 'አጭር መግለጫ' : 'Short description',
      descriptionPlaceholder: am ? 'ስለ አገልግሎትዎ በአጭሩ ይንገሩን።' : 'Tell customers briefly about your service.',
      selectedCategory: am ? 'የተመረጠ፡ {category}' : 'Selected: {category}',
      termsPrefix: am ? 'እኔ ' : 'I agree to the ',
      termsLink: am ? 'ውሎች እና ፖሊሲዎች' : 'Terms & Conditions',
      termsSuffix: am ? 'ን እקבላለሁ።' : '.',
      termsRequired: am
        ? 'ለመቀጠል ውሎች እና ፖሊሲዎችን መቀበል አለብዎት።'
        : 'Accept the Terms & Conditions to continue.',
      submit: am ? 'ምዝገባ ላክ' : 'Submit provider interest',
      submitHint: am
        ? 'ካስገቡ በኋላ ስልክዎን ለማረጋገጥ የማረጋገጫ ኮድ በኤስኤምኤስ እንልካለን።'
        : "We'll text a verification code to confirm your phone after you submit.",
      requiredFields: am
        ? 'መጀመሪያ ሙሉ ስም፣ ስልክ ቁጥር እና የአገልግሎት ዘርፍ ያስገቡ።'
        : 'Enter your full name, phone number, and service category first.',
      fullNameRequired: am ? 'ሙሉ ስምዎን ያስገቡ።' : 'Enter your full name.',
      phoneRequired: am ? 'የስልክ ቁጥርዎን ያስገቡ።' : 'Enter your phone number.',
      whatsappInvalid: am ? 'የዋትስአፕ ቁጥሩን ያረጋግጡ።' : 'Check the WhatsApp number.',
      categoryRequired: am ? 'የአገልግሎት ዘርፍዎን ይምረጡ።' : 'Choose your service category.',
      engagementRequired: am ? 'ቢያንስ አንድ የስራ ዓይነት ይምረጡ።' : 'Select at least one work type.',
      sendingOtp: am ? 'የማረጋገጫ ኮድ በመላክ ላይ…' : 'Sending verification code…',
      otpSentTitle: am ? 'ስልክዎን ያረጋግጡ' : 'Verify your phone',
      otpSentBody: am
        ? 'ወደ {phone} በኤስኤምኤስ የላክነውን ኮድ ያስገቡ።'
        : 'Enter the code we sent by SMS to {phone}.',
      verifyAndRegister: am ? 'አረጋግጥ እና መለያ ፍጠር' : 'Verify & create account',
      verifyingOtp: am ? 'ኮድ በማረጋገጥ ላይ…' : 'Verifying code…',
      registering: am ? 'የማውጫ መለያዎን በመፍጠር ላይ…' : 'Creating your directory account…',
      editDetails: am ? 'ዝርዝሮችን አስተካክል' : 'Edit details',
      trustAside: am
        ? 'በአቅራቢያዎ ያሉ ደንበኞች ይገኙዎት።'
        : 'Get found by customers near you.',
      haveAccount: am ? 'አስቀድመው ተመዝግበዋል?' : 'Already registered?',
      loginLink: am ? 'ይግቡ' : 'Log in',
      alreadyRegistered: am
        ? 'ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል። እባክዎ ይግቡ።'
        : 'This phone number is already registered. Please login.',
      successTitle: am ? 'የባለሙያ መለያዎ ዝግጁ ነው።' : 'Your provider account is ready.',
      successText: am
        ? 'አሁን በማውጫው ውስጥ ተዘርዝረዋል። ከመለያዎ ፎቶ እና ብሔራዊ መታወቂያ ያክሉ።'
        : 'You are now listed in the directory. Add a photo and your national ID from your account.',
      goToAccount: am ? 'ወደ መለያዬ ሂድ' : 'Go to my account',
      backToProfile: am ? 'ወደ መገለጫ ተመለስ' : 'Back to profile',
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
      engagement: am ? 'ለምን ያህል ጊዜ' : 'Engagement',
      engagementAll: am ? 'ሁሉም' : 'All',
      engagementTemporary: am ? 'ጊዜያዊ' : 'Temporary',
      engagementPermanent: am ? 'ቋሚ' : 'Permanent',
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
    apiErrors: {
      INVALID_PHONE: am
        ? 'ይህ ስልክ ቁጥር ትክክል አይደለም። እንደ 09XX XXX XXX ያለ ቁጥር ይጠቀሙ።'
        : 'That phone number is not valid. Use a number like 09XX XXX XXX.',
      INVALID_WHATSAPP: am
        ? 'ይህ የዋትሳፕ ቁጥር ትክክል አይደለም። እንደ 09XX XXX XXX ያለ ቁጥር ይጠቀሙ።'
        : 'That WhatsApp number is not valid. Use a number like 09XX XXX XXX.',
      OTP_REQUEST_FAILED: am
        ? 'አሁን የማረጋገጫ ኮድ መላክ አልተቻለም። እባክዎ ቆይተው ይሞክሩ።'
        : 'Could not send the verification code right now. Please try again shortly.',
      OTP_COOLDOWN: am
        ? 'ሌላ ኮድ ከመጠየቅዎ በፊት ትንሽ ይጠብቁ።'
        : 'Please wait a moment before requesting another code.',
      OTP_PHONE_RATE_LIMITED: am
        ? 'ለዚህ ቁጥር በጣም ብዙ የኮድ ጥያቄዎች። ከጥቂት ደቂቃ በኋላ ይሞክሩ።'
        : 'Too many code requests for this number. Try again in a few minutes.',
      OTP_DAILY_LIMIT: am
        ? 'የዛሬውን የኮድ ገደብ ጨርሰዋል። እባክዎ ነገ ይሞክሩ።'
        : "You've reached today's limit for codes. Please try again tomorrow.",
      OTP_INCORRECT: am
        ? 'ኮዱ ትክክል አይደለም። ኤስኤምኤሱን አረጋግጠው ደግመው ይሞክሩ።'
        : 'That code is incorrect. Check the SMS and try again.',
      OTP_MAX_ATTEMPTS: am
        ? 'በጣም ብዙ ሙከራዎች። አዲስ ኮድ ይጠይቁ እና ደግመው ይሞክሩ።'
        : 'Too many attempts. Request a new code and try again.',
      OTP_EXPIRED: am
        ? 'ኮዱ ጊዜው አልፏል። አዲስ ኮድ ይጠይቁ።'
        : 'That code has expired. Please request a new one.',
      OTP_NOT_FOUND: am
        ? 'የማረጋገጫ ጥያቄ አልተገኘም። አዲስ ኮድ ይጠይቁ።'
        : 'Verification request not found. Please request a new code.',
      OTP_INVALID_STATUS: am
        ? 'ይህ የማረጋገጫ ጥያቄ ተጠቅሟል። አዲስ ኮድ ይጠይቁ።'
        : 'This verification request is no longer valid. Please request a new code.',
      VALIDATION_ERROR: am
        ? 'ያስገቡት መረጃ ትክክል አይመስልም። አረጋግጠው እንደገና ይሞክሩ።'
        : "Some details don't look right. Please review and try again.",
      REGISTER_FAILED: am
        ? 'መለያ መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
        : 'Could not create your account. Please try again.',
      PHONE_ALREADY_REGISTERED: am
        ? 'ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል። እባክዎ ይግቡ።'
        : 'This phone number is already registered. Please login.',
      CUSTOMER_NOT_FOUND: am
        ? 'በዚህ ስልክ ቁጥር የደንበኛ መለያ የለም። መጀመሪያ መገለጫ ይፍጠሩ።'
        : 'No customer account for this phone. Create a profile first.',
      PROVIDER_NOT_FOUND: am
        ? 'በዚህ ስልክ ባለሙያ መለያ የለም። መጀመሪያ ይመዝገቡ።'
        : 'No provider account for this phone. Register first.',
      generic: am ? 'እባክዎ እንደገና ይሞክሩ።' : 'Please try again.',
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
