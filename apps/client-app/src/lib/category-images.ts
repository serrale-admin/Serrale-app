import type { ImageSourcePropType } from 'react-native';

/**
 * Category photography keyed by the EXACT 24 backend ontology slugs. Only images
 * that are actually referenced here are bundled (each `require` is a bundle
 * entry). The formerly-unused `extended/cctv-alt.png` and
 * `extended/service-collage.png` were removed from the repo (Task 10); the
 * remaining `extended/*` photos were converted from ~1 MB PNGs to display-size
 * WebP (600 px, q80) — a ~97% byte reduction — without changing any slug mapping.
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
  'cctv-installation': require('../../assets/categories/extended/cctv.webp'),
  'home-repair': require('../../assets/categories/home-repair.webp'),
  gardeners: require('../../assets/categories/gardener.webp'),

  // Repairs & Maintenance
  'phone-repair': require('../../assets/categories/extended/phone-computer-repair.webp'),
  'computer-repair': require('../../assets/categories/extended/phone-computer-repair.webp'),
  'appliance-repair': require('../../assets/categories/extended/phone-computer-repair.webp'),
  'generator-repair': require('../../assets/categories/extended/generator-car-mechanics.webp'),
  'car-mechanics': require('../../assets/categories/extended/generator-car-mechanics.webp'),

  // Moving & Transport
  drivers: require('../../assets/categories/driver.webp'),
  'moving-service': require('../../assets/categories/extended/moving-delivery.webp'),
  'truck-rental': require('../../assets/categories/extended/moving-delivery.webp'),
  'delivery-service': require('../../assets/categories/extended/moving-delivery.webp'),

  // Health & Wellness
  'home-care-nurses': require('../../assets/categories/extended/nurses.webp'),
  caregivers: require('../../assets/categories/extended/nurses.webp'),
  physiotherapists: require('../../assets/categories/extended/personal-trainer.webp'),
  'personal-trainers': require('../../assets/categories/extended/personal-trainer.webp'),
};

export function categoryImage(id?: string): ImageSourcePropType {
  return (id && images[id]) || images['home-repair'];
}
