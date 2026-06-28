import type { Category, PastWork, Provider, Review } from '../types';

export const AREAS: string[] = [
  'All Addis Ababa',
  'Bole',
  'Yeka',
  'Kirkos',
  'Arada',
  'Lideta',
  'Gullele',
  'Kolfe Keranio',
  'Nifas Silk-Lafto',
  'Akaki Kality',
  'Lemi Kura',
];

export const CATS: Category[] = [
  { id: 'plumbers', name: 'Plumbers', am: 'ቧንቧ', icon: 'ph-wrench', count: 1200, group: 'Home & Repair', subs: ['Pipe leak', 'Sink repair', 'Water pressure', 'Bathroom', 'Emergency', 'Installation'] },
  { id: 'electricians', name: 'Electricians', am: 'ኤሌክትሪክ', icon: 'ph-lightning', count: 950, group: 'Home & Repair', subs: ['Switch repair', 'Wiring', 'Lighting', 'Breaker', 'Installation'] },
  { id: 'painters', name: 'Painters', am: 'ቀለም', icon: 'ph-paint-roller', count: 780, group: 'Home & Repair', subs: ['Interior', 'Exterior', 'Wall finishing', 'Doors'] },
  { id: 'carpenters', name: 'Carpenters', am: 'እንጨት', icon: 'ph-hammer', count: 650, group: 'Home & Repair', subs: ['Furniture', 'Doors', 'Shelves', 'Repairs'] },
  { id: 'appliance', name: 'Appliance Repair', am: 'መጠገኛ', icon: 'ph-wrench', count: 540, group: 'Home & Repair', subs: ['Fridge', 'Washing machine', 'Stove', 'TV'] },
  { id: 'locksmiths', name: 'Locksmiths', am: 'ቁልፍ', icon: 'ph-key', count: 210, group: 'Home & Repair', subs: ['Lock change', 'Key copy', 'Emergency'] },
  { id: 'cleaners', name: 'Cleaners', am: 'ጽዳት', icon: 'ph-sparkle', count: 1150, group: 'Cleaning & Care', subs: ['Home cleaning', 'Office cleaning', 'Move-in', 'Deep cleaning'] },
  { id: 'nannies', name: 'Nannies', am: 'ህፃን ተንከባካቢ', icon: 'ph-baby', count: 900, group: 'Cleaning & Care', subs: ['Daytime', 'Full-time', 'Newborn'] },
  { id: 'laundry', name: 'Laundry', am: 'ልብስ', icon: 'ph-t-shirt', count: 340, group: 'Cleaning & Care', subs: ['Wash', 'Iron', 'Pickup'] },
  { id: 'gardeners', name: 'Gardeners', am: 'አትክልት', icon: 'ph-plant', count: 280, group: 'Cleaning & Care', subs: ['Lawn', 'Trimming', 'Planting'] },
  { id: 'pest', name: 'Pest Control', am: 'ተባይ', icon: 'ph-bug', count: 190, group: 'Cleaning & Care', subs: ['Insects', 'Rodents', 'Fumigation'] },
  { id: 'movers', name: 'Movers', am: 'ማጓጓዣ', icon: 'ph-truck', count: 420, group: 'Moving & Delivery', subs: ['House move', 'Office move', 'Furniture'] },
  { id: 'drivers', name: 'Drivers', am: 'ሹፌር', icon: 'ph-steering-wheel', count: 610, group: 'Moving & Delivery', subs: ['Daily', 'Airport', 'Errands'] },
  { id: 'photographers', name: 'Photographers', am: 'ፎቶ', icon: 'ph-camera', count: 360, group: 'Events & Personal', subs: ['Events', 'Portrait', 'Product'] },
  { id: 'cooks', name: 'Cooks & Catering', am: 'ምግብ', icon: 'ph-cooking-pot', count: 430, group: 'Events & Personal', subs: ['Home cooking', 'Events', 'Ethiopian dishes'] },
  { id: 'makeup', name: 'Makeup Artists', am: 'ሜካፕ', icon: 'ph-palette', count: 220, group: 'Events & Personal', subs: ['Wedding', 'Event', 'Studio'] },
  { id: 'tailors', name: 'Tailors', am: 'ልብስ ስፌት', icon: 'ph-scissors', count: 390, group: 'Events & Personal', subs: ['Custom', 'Repair', 'Traditional'] },
  { id: 'designers', name: 'Designers', am: 'ዲዛይን', icon: 'ph-pen-nib', count: 180, group: 'Digital & Office', subs: ['Logo', 'Branding', 'Print'] },
  { id: 'developers', name: 'Developers', am: 'ዴቨሎፐር', icon: 'ph-code', count: 150, group: 'Digital & Office', subs: ['Web', 'Mobile', 'Support'] },
  { id: 'marketing', name: 'Marketing', am: 'ግብይት', icon: 'ph-megaphone', count: 120, group: 'Digital & Office', subs: ['Social', 'Ads', 'Content'] },
];

export const PROV: Provider[] = [
  { id: 'tekle-plumbing', name: 'Tekle Plumbing', service: 'Plumber', categoryId: 'plumbers', rating: 4.9, reviewCount: 256, area: 'Bole', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 8, price: 'Standard', description: 'Pipe leaks, sink repair, and water pressure.', phone: '+251911234567' },
  { id: 'abebe-painting', name: 'Abebe Painting', service: 'Painter', categoryId: 'painters', rating: 4.8, reviewCount: 128, area: 'Lideta', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 6, price: 'Budget', description: 'Interior painting, wall finishing, small repairs.', phone: '+251911234568' },
  { id: 'amanuel-electric', name: 'Amanuel Electric', service: 'Electrician', categoryId: 'electricians', rating: 4.8, reviewCount: 173, area: 'Nifas Silk-Lafto', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 10, price: 'Standard', description: 'Switch repair, wiring, lighting, installation.', phone: '+251911234569' },
  { id: 'bethel-cleaning', name: 'Bethel Cleaning', service: 'Cleaner', categoryId: 'cleaners', rating: 4.7, reviewCount: 146, area: 'Yeka', verified: true, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 4, price: 'Budget', description: 'Home, office, deep cleaning, and support.', phone: '+251911234570' },
  { id: 'hanna-childcare', name: 'Hanna Childcare', service: 'Nanny', categoryId: 'nannies', rating: 4.9, reviewCount: 89, area: 'Bole', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 7, price: 'Standard', description: 'Experienced daytime and full-time care.', phone: '+251911234571' },
  { id: 'yonas-carpentry', name: 'Yonas Carpentry', service: 'Carpenter', categoryId: 'carpenters', rating: 4.6, reviewCount: 64, area: 'Kirkos', verified: false, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 5, price: 'Standard', description: 'Custom furniture, doors, shelves, repairs.', phone: '+251911234572' },
  { id: 'selam-appliance', name: 'Selam Appliance', service: 'Appliance Repair', categoryId: 'appliance', rating: 4.7, reviewCount: 112, area: 'Arada', verified: true, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 9, price: 'Standard', description: 'Fridge, washing machine, and stove repair.', phone: '+251911234573' },
  { id: 'dawit-movers', name: 'Dawit Movers', service: 'Mover', categoryId: 'movers', rating: 4.5, reviewCount: 78, area: 'Kolfe Keranio', verified: false, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 3, price: 'Budget', description: 'House and office moving, careful handling.', phone: '+251911234574' },
  { id: 'marta-catering', name: 'Marta Catering', service: 'Catering', categoryId: 'cooks', rating: 4.9, reviewCount: 201, area: 'Bole', verified: true, adminReviewed: true, availableToday: false, hasPastWork: true, exp: 11, price: 'Premium', description: 'Home cooking, events, and Ethiopian dishes.', phone: '+251911234575' },
  { id: 'robel-electric', name: 'Robel Electric', service: 'Electrician', categoryId: 'electricians', rating: 4.6, reviewCount: 54, area: 'Yeka', verified: false, adminReviewed: true, availableToday: true, hasPastWork: false, exp: 4, price: 'Budget', description: 'Lighting, breaker, and home wiring fixes.', phone: '+251911234576' },
  { id: 'sara-cleaning', name: 'Sara Cleaning', service: 'Cleaner', categoryId: 'cleaners', rating: 4.8, reviewCount: 97, area: 'Lideta', verified: true, adminReviewed: true, availableToday: true, hasPastWork: true, exp: 6, price: 'Standard', description: 'Move-in and deep cleaning specialist.', phone: '+251911234577' },
  { id: 'kbrom-plumbing', name: 'Kbrom Plumbing', service: 'Plumber', categoryId: 'plumbers', rating: 4.7, reviewCount: 132, area: 'Gullele', verified: true, adminReviewed: false, availableToday: false, hasPastWork: true, exp: 7, price: 'Standard', description: 'Bathroom, kitchen, and emergency plumbing.', phone: '+251911234578' },
];

export const REVIEWS: Review[] = [
  { providerId: 'tekle-plumbing', userName: 'Marta', area: 'Bole', rating: 5, text: 'Found him quickly and the sink repair was done the same day.' },
  { providerId: 'tekle-plumbing', userName: 'Henok', area: 'Bole', rating: 5, text: 'On time and fair price. Highly recommend.' },
  { providerId: 'abebe-painting', userName: 'Daniel', area: 'Lideta', rating: 5, text: 'Clean finishing and professional communication.' },
  { providerId: 'abebe-painting', userName: 'Sara', area: 'Lideta', rating: 4, text: 'Good work, finished in two days as promised.' },
  { providerId: 'hanna-childcare', userName: 'Liya', area: 'Bole', rating: 5, text: 'Very caring and reliable with my daughter.' },
];

export const PASTWORK: PastWork[] = [
  { providerId: 'abebe-painting', title: 'Kitchen repaint in Bole', category: 'Painting', area: 'Bole', icon: 'ph-paint-roller', bg: '#086246', note: 'Completed in 2 days with clean finishing.' },
  { providerId: 'tekle-plumbing', title: 'Bathroom leak repair', category: 'Plumbing', area: 'Yeka', icon: 'ph-wrench', bg: '#064734', note: 'Fixed pipe leak and water pressure issue.' },
  { providerId: 'yonas-carpentry', title: 'Custom wardrobe build', category: 'Carpentry', area: 'Kirkos', icon: 'ph-hammer', bg: '#0b5a40', note: 'Built and fitted a full bedroom wardrobe.' },
  { providerId: 'bethel-cleaning', title: 'Office deep clean', category: 'Cleaning', area: 'Yeka', icon: 'ph-sparkle', bg: '#16875F', note: 'Full office deep clean over a weekend.' },
];

export const GROUP_NAMES = [
  'Home & Repair',
  'Cleaning & Care',
  'Moving & Delivery',
  'Events & Personal',
  'Digital & Office',
];
