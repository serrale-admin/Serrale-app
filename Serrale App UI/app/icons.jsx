// Lucide-style line icons — 2px stroke, rounded caps
const Icon = ({ d, size = 20, color = 'currentColor', strokeWidth = 2, fill = 'none', children, viewBox = '0 0 24 24', style }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconHome = (p) => <Icon {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z"/></Icon>;
const IconBriefcase = (p) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></Icon>;
const IconDoc = (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/></Icon>;
const IconChat = (p) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
const IconFilter = (p) => <Icon {...p}><path d="M4 6h16M7 12h10M10 18h4"/></Icon>;
const IconShieldCheck = (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></Icon>;
const IconStar = (p) => <Icon {...p}><path d="M12 2l3 7 7 .8-5.3 4.7 1.6 7.1L12 17.8 5.7 21.6l1.6-7.1L2 9.8 9 9z"/></Icon>;
const IconStarFilled = (p) => <Icon {...p} fill="currentColor"><path d="M12 2l3 7 7 .8-5.3 4.7 1.6 7.1L12 17.8 5.7 21.6l1.6-7.1L2 9.8 9 9z"/></Icon>;
const IconMapPin = (p) => <Icon {...p}><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="2.5"/></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
const IconWallet = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h13l3 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M16 12h3"/></Icon>;
const IconImage = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="M21 15l-5-5L5 21"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;
const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="M9 18l6-6-6-6"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>;
const IconBookmark = (p) => <Icon {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Icon>;
const IconBookmarkFilled = (p) => <Icon {...p} fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconPaperclip = (p) => <Icon {...p}><path d="M21 11.5l-9 9a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 0 1-2.6-2.6l8.5-8.4"/></Icon>;
const IconSend = (p) => <Icon {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Icon>;
const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>;
const IconEyeOff = (p) => <Icon {...p}><path d="M17.94 17.94A10 10 0 0 1 12 19c-6 0-10-7-10-7a17 17 0 0 1 4-4.5"/><path d="M9.9 4.24A9 9 0 0 1 12 4c6 0 10 7 10 7a17 17 0 0 1-2.05 2.94"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M2 2l20 20"/></Icon>;
const IconGoogle = (p) => (
  <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45 24c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.5-9.3 6.5-15.9z"/>
    <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.4c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.5 15.5 46 24 46z"/>
    <path fill="#FBBC05" d="M11.9 28.6c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.6H4.7C3.2 17.7 2.5 20.7 2.5 24s.7 6.3 2.2 9.2l7.2-5.6z"/>
    <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 3.2l6-6C34.7 3.4 29.8 1 24 1 15.5 1 8.3 5.5 4.7 12.4l7.2 5.6c1.7-5.1 6.5-8.5 12.1-8.5z"/>
  </svg>
);
const IconRocket = (p) => <Icon {...p}><path d="M5 14l-2 7 7-2 9-9-5-5-9 9z"/><path d="M14 5l5 5"/><circle cx="14" cy="10" r="1.5" fill="currentColor"/></Icon>;
const IconSparkles = (p) => <Icon {...p}><path d="M12 3l1.7 4.5L18 9l-4.3 1.5L12 15l-1.7-4.5L6 9l4.3-1.5z"/><path d="M19 14l.7 1.5L21 16l-1.3.5L19 18l-.7-1.5L17 16l1.3-.5z"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>;
const IconMail = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></Icon>;
const IconPhone = (p) => <Icon {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2z"/></Icon>;
const IconTools = (p) => <Icon {...p}><path d="M14.7 6.3a4 4 0 1 0 5.7 5.7l-9.4 9.4-3.7-1-1-3.7 9.4-9.4z"/><path d="M9 15l-2 2"/></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></Icon>;
const IconHelp = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.7.5-2 1.2-2 2.5"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></Icon>;
const IconGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></Icon>;

window.SerraleIcons = {
  IconHome, IconBriefcase, IconDoc, IconChat, IconUser, IconBell, IconSearch, IconFilter,
  IconShieldCheck, IconStar, IconStarFilled, IconMapPin, IconClock, IconWallet, IconImage,
  IconSettings, IconLogout, IconChevronRight, IconChevronLeft, IconBookmark, IconBookmarkFilled,
  IconPlus, IconPaperclip, IconSend, IconArrowRight, IconCheck, IconEye, IconEyeOff, IconGoogle,
  IconRocket, IconSparkles, IconLock, IconMail, IconPhone, IconTools, IconCalendar, IconHelp,
  IconGlobe, IconShield,
};
