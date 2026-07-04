import type { ImageSourcePropType } from 'react-native';

const images: Record<string, ImageSourcePropType> = {
  plumbers: require('../../assets/categories/plumber.webp'),
  electricians: require('../../assets/categories/electrician.webp'),
  cleaners: require('../../assets/categories/cleaner.webp'),
  painters: require('../../assets/categories/painter.webp'),
  nannies: require('../../assets/categories/nanny.webp'),
  carpenters: require('../../assets/categories/carpenter.webp'),
  drivers: require('../../assets/categories/driver.webp'),
  appliance: require('../../assets/categories/extended/phone-computer-repair.png'),
  locksmiths: require('../../assets/categories/home-repair.webp'),
  laundry: require('../../assets/categories/cleaner.webp'),
  gardeners: require('../../assets/categories/gardener.webp'),
  pest: require('../../assets/categories/gardener.webp'),
  movers: require('../../assets/categories/extended/moving-delivery.png'),
  photographers: require('../../assets/categories/painter.webp'),
  cooks: require('../../assets/categories/cleaner.webp'),
  makeup: require('../../assets/categories/painter.webp'),
  tailors: require('../../assets/categories/painter.webp'),
  designers: require('../../assets/categories/painter.webp'),
  developers: require('../../assets/categories/extended/phone-computer-repair.png'),
  marketing: require('../../assets/categories/painter.webp'),
};

export function categoryImage(id?: string): ImageSourcePropType {
  return (id && images[id]) || images.plumbers;
}
