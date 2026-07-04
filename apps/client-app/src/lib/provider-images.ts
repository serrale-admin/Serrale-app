import type { ImageSourcePropType } from 'react-native';

const images: Record<string, ImageSourcePropType> = {
  'Tekle Plumbing': require('../../assets/providers/provider-tekle.webp'),
  'Abebe Painting': require('../../assets/providers/provider-abebe.webp'),
  'Amanuel Electric': require('../../assets/providers/provider-amanuel.webp'),
  'Bethel Cleaning': require('../../assets/providers/provider-bethel.webp'),
};

export function providerImage(name: string): ImageSourcePropType | undefined {
  return images[name];
}
