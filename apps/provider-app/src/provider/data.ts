import type {
  ProviderChatMessage,
  ProviderConversation,
  ProviderJob,
  ProviderPortfolioItem,
  ProviderProfile,
  ProviderProposal
} from "./types";

export const providerProfile: ProviderProfile = {
  name: "Samuel D.",
  firstName: "Samuel",
  specialty: "Brand Designer & Photographer",
  rating: 4.9,
  reviews: 47,
  jobsCompleted: 62,
  successRate: 96,
  earnings: "ETB 184k",
  location: "Bole, Addis Ababa",
  profileCompletion: 80
};

export const providerJobs: ProviderJob[] = [
  {
    id: "j1",
    title: "Logo & Brand Identity for Coffee Shop",
    client: "Buna House Ethiopia",
    clientVerified: true,
    category: "Design",
    catColor: "#7C3AED",
    catBg: "#F2EAFF",
    budgetMin: 8000,
    budgetMax: 12000,
    location: "Addis Ababa",
    posted: "2h ago",
    match: 92,
    description:
      "We are launching a premium coffee shop in Bole and need a complete brand identity including logo, color palette, typography, signage, and packaging mockups.",
    skills: ["Logo Design", "Brand Identity", "Adobe Illustrator", "Packaging"],
    timeline: "2 weeks",
    proposals: 12
  },
  {
    id: "j2",
    title: "Wedding & Event Photography",
    client: "Liya Mengesha",
    clientVerified: true,
    category: "Photography",
    catColor: "#0F766E",
    catBg: "#E7FAF6",
    budgetMin: 15000,
    budgetMax: 22000,
    location: "Kazanchis",
    posted: "5h ago",
    match: 88,
    description:
      "Need an experienced photographer for a traditional Ethiopian wedding with full-day coverage and edited gallery delivery within 14 days.",
    skills: ["Photography", "Photo Editing", "Lightroom"],
    timeline: "1 day shoot - 2 weeks editing",
    proposals: 8
  },
  {
    id: "j3",
    title: "E-commerce Website Build (Shopify)",
    client: "Habesha Threads",
    clientVerified: false,
    category: "Development",
    catColor: "#1769F2",
    catBg: "#EAF3FF",
    budgetMin: 25000,
    budgetMax: 40000,
    location: "Remote",
    posted: "1d ago",
    match: 76,
    description:
      "Custom Shopify build with payment integration, product catalog management, and launch-ready SEO setup.",
    skills: ["Shopify", "Liquid", "JavaScript"],
    timeline: "3-4 weeks",
    proposals: 18
  }
];

export const providerProposals: ProviderProposal[] = [
  {
    id: "p1",
    project: "Website Design for Local Clinic",
    client: "Tena Health Center",
    status: "Submitted",
    update: "Waiting for client response",
    submitted: "2 days ago",
    budget: "ETB 18,000",
    linkedJobId: "j3"
  },
  {
    id: "p2",
    project: "Product Photography for Fashion Brand",
    client: "Selam Atelier",
    status: "Viewed",
    update: "Awaiting reply",
    submitted: "5 days ago",
    budget: "ETB 9,500",
    linkedJobId: "j2"
  },
  {
    id: "p3",
    project: "Mobile App Onboarding Screens",
    client: "Ride Addis",
    status: "Shortlisted",
    update: "Client may schedule interview",
    submitted: "1 week ago",
    budget: "ETB 22,000",
    linkedJobId: "j1"
  },
  {
    id: "p4",
    project: "Restaurant Menu Redesign",
    client: "Yod Abyssinia",
    status: "Won",
    update: "Project starts Monday",
    submitted: "2 weeks ago",
    budget: "ETB 14,000"
  }
];

export const providerConversations: ProviderConversation[] = [
  {
    id: "m1",
    name: "Buna House Ethiopia",
    project: "Logo & Brand Identity",
    last: "Hi Samuel, your portfolio looks great. Can we schedule a call?",
    time: "2m",
    unread: 2,
    initials: "BH",
    bg: "#F2EAFF",
    fg: "#7C3AED"
  },
  {
    id: "m2",
    name: "Liya Mengesha",
    project: "Wedding Photography",
    last: "Perfect, see you on Saturday at 10am.",
    time: "1h",
    unread: 0,
    initials: "LM",
    bg: "#E7FAF6",
    fg: "#0F766E"
  },
  {
    id: "m3",
    name: "Ride Addis",
    project: "Onboarding Screens",
    last: "We loved your proposal. Are you available next week?",
    time: "3h",
    unread: 1,
    initials: "RA",
    bg: "#EAF3FF",
    fg: "#1769F2"
  },
  {
    id: "m4",
    name: "Yod Abyssinia",
    project: "Menu Redesign",
    last: "Sending the brief now. Talk soon!",
    time: "Yest.",
    unread: 0,
    initials: "YA",
    bg: "#FFF4E2",
    fg: "#F59E0B"
  }
];

export const providerChatMessages: ProviderChatMessage[] = [
  { id: 1, from: "them", text: "Hi Samuel, your portfolio looks great!", time: "10:24 AM" },
  {
    id: 2,
    from: "them",
    text: "We're particularly interested in your work for hospitality brands.",
    time: "10:24 AM"
  },
  {
    id: 3,
    from: "me",
    text: "Thank you. I'd love to learn more about the brief and your launch timeline.",
    time: "10:31 AM"
  },
  { id: 4, from: "them", text: "Of course. Sending the deck now.", time: "10:33 AM" },
  { id: 5, from: "them", text: "Can we schedule a call this week?", time: "10:34 AM" }
];

export const providerPortfolio: ProviderPortfolioItem[] = [
  {
    id: "pt1",
    title: "Tomoca Seasonal Campaign",
    service: "Brand Identity + Campaign Photography",
    result: "27% social engagement lift",
    period: "Jan 2026",
    summary: "Created a full visual identity and campaign asset kit for seasonal launch."
  },
  {
    id: "pt2",
    title: "Garden of Coffee Menu System",
    service: "Packaging + Menu Design",
    result: "Rolled out in 3 branches",
    period: "Nov 2025",
    summary: "Designed menu and packaging system balancing modern UI with local warmth."
  },
  {
    id: "pt3",
    title: "Ride Addis Onboarding UX",
    service: "Product Design",
    result: "14% onboarding completion increase",
    period: "Sep 2025",
    summary: "Reworked first-time user flows and visuals for a smoother onboarding journey."
  }
];
