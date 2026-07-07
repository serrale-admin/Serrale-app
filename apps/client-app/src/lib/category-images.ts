import type { ImageSourcePropType } from 'react-native';

/**
 * Category photography keyed by the EXACT 24 backend ontology slugs. Only images
 * that are actually referenced here are bundled (each `require` is a bundle
 * entry), so unused assets — e.g. `extended/cctv-alt.png`,
 * `extended/service-collage.png` — are intentionally left out.
 *
 * Several slugs deliberately share one photo where a dedicated asset does not
 * exist (e.g. phone/computer/appliance repair share the repair collage). Unknown
 * slugs fall back to `home-repair` (a neutral service photo).
 */
const images: Record<string, ImageSourcePropType> = {
  // Home Services
  painters: require('../../assets/categories/painter.webp'),
  plumbers: require('../../assets/categories/plumber.webp'),
  electricians: require('../../assets/categories/electrician.webp'),
  cleaners: require('../../assets/categories/cleaner.webp'),
  nannies: require('../../assets/categories/nanny.webp'),
  carpenters: require('../../assets/categories/carpenter.webp'),
  masons: require('../../assets/categories/home-repair.webp'),
  welders: require('../../assets/categories/home-repair.webp'),
  'cctv-installation': require('../../assets/categories/extended/cctv.png'),
  'home-repair': require('../../assets/categories/home-repair.webp'),
  gardeners: require('../../assets/categories/gardener.webp'),

  // Repairs & Maintenance
  'phone-repair': require('../../assets/categories/extended/phone-computer-repair.png'),
  'computer-repair': require('../../assets/categories/extended/phone-computer-repair.png'),
  'appliance-repair': require('../../assets/categories/extended/phone-computer-repair.png'),
  'generator-repair': require('../../assets/categories/extended/generator-car-mechanics.png'),
  'car-mechanics': require('../../assets/categories/extended/generator-car-mechanics.png'),

  // Moving & Transport
  drivers: require('../../assets/categories/driver.webp'),
  'moving-service': require('../../assets/categories/extended/moving-delivery.png'),
  'truck-rental': require('../../assets/categories/extended/moving-delivery.png'),
  'delivery-service': require('../../assets/categories/extended/moving-delivery.png'),

  // Health & Wellness
  'home-care-nurses': require('../../assets/categories/extended/nurses.png'),
  caregivers: require('../../assets/categories/extended/nurses.png'),
  physiotherapists: require('../../assets/categories/extended/personal-trainer.png'),
  'personal-trainers': require('../../assets/categories/extended/personal-trainer.png'),
};

export function categoryImage(id?: string): ImageSourcePropType {
  return (id && images[id]) || images['home-repair'];
}
