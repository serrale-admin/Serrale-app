import { create } from "zustand";

export type Language = "en" | "am";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
}));

export const translations = {
  en: {
    // Auth
    welcome_back: "Welcome back",
    hire_trusted: "Hire trusted professionals across Ethiopia.",
    email: "Email address",
    password: "Password",
    forgot_password: "Forgot password?",
    log_in: "Log In",
    continue_google: "Continue with Google",
    new_to_serrale: "New to SERRALE?",
    create_account_link: "Create an account",
    
    // Bottom Nav
    home: "Home",
    categories: "Categories",
    post: "Post",
    messages: "Messages",
    profile: "Profile",

    // Home
    hello: "Hello",
    find_experts: "Find trusted experts for your next project.",
    search_placeholder: "Search services or experts...",
    hero_title: "Talents. Skills. Community.",
    hero_subtitle: "Ethiopia’s talent, working together.",
    post_project: "Post a Project",
    popular_categories: "Popular Categories",
    recommended_providers: "Recommended Providers",
    your_projects: "Your Projects",
    view_more: "View More",
    view_all: "View All",

    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    view_details: "View Details",
    view_profile: "View Profile",
    improve_profile: "Improve Profile",
    try_again: "Try Again",
    error_occurred: "Something went wrong",
    error_message: "We couldn’t load this page. Please try again.",

    // Onboarding
    preparing_workspace: "Preparing your workspace...",
    find_hire_grow: "Find. Hire. Grow.",
  },
  am: {
    // Auth
    welcome_back: "እንኳን ደህና መጡ",
    hire_trusted: "በኢትዮጵያ ውስጥ የተረጋገጡ ባለሙያዎችን ይቅጠሩ።",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    forgot_password: "የይለፍ ቃል ረሱ?",
    log_in: "ግባ",
    continue_google: "በGoogle ይቀጥሉ",
    new_to_serrale: "አዲስ ነዎት?",
    create_account_link: "መለያ ይፍጠሩ",

    // Bottom Nav
    home: "መነሻ",
    categories: "ምድቦች",
    post: "ፕሮጀክት ለጥፍ",
    messages: "መልዕክቶች",
    profile: "መገለጫ",

    // Home
    hello: "ሰላም",
    find_experts: "ለቀጣዩ ፕሮጀክትዎ የሚታመኑ ባለሙያዎችን ያግኙ።",
    search_placeholder: "አገልግሎቶችን ወይም ባለሙያዎችን ይፈልጉ...",
    hero_title: "ችሎታ። ክህሎት። ማህበረሰብ።",
    hero_subtitle: "የኢትዮጵያ ችሎታ በአንድነት ሲሰራ።",
    post_project: "ፕሮጀክት ለጥፍ",
    popular_categories: "ታዋቂ ምድቦች",
    recommended_providers: "የሚመከሩ ባለሙያዎች",
    your_projects: "የእርስዎ ፕሮጀክቶች",
    view_more: "ተጨማሪ ይመልከቱ",
    view_all: "ሁሉንም ይመልከቱ",

    // Common
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    edit: "አስተካክል",
    view_details: "ዝርዝር ይመልከቱ",
    view_profile: "መገለጫ ይመልከቱ",
    improve_profile: "መገለጫን አሻሽል",
    try_again: "እንደገና ይሞክሩ",
    error_occurred: "አንድ ችግኝ ተፈጥሯል",
    error_message: "ይህን ገጽ መጫን አልቻልንም። እባክዎ እንደገና ይሞክሩ።",

    // Onboarding
    preparing_workspace: "መተግበሪያው እየተዘጋጀ ነው...",
    find_hire_grow: "ያግኙ። ይቅጠሩ። ያሳድጉ።",
  },
};

export const useTranslation = () => {
  const { language } = useLanguageStore();
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };
  return { t, language };
};
