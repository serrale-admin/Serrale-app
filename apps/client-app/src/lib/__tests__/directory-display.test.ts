import { CATS, SERVICE_LOCATIONS } from '../../data/mock';
import { labelsFor } from '../labels';
import { areaLabel, categoryLabel, serviceGroupLabel } from '../directory-display';

describe('directory-display', () => {
  it('localizes category and area labels like the Categories tab', () => {
    const plumbers = CATS.find((c) => c.id === 'plumbers')!;
    expect(categoryLabel(plumbers, false)).toBe('Plumbers');
    expect(categoryLabel(plumbers, true)).toBe('የቧንቧ ባለሙያዎች');
    expect(areaLabel('Bole', false)).toBe('Bole');
    expect(areaLabel('Bole', true)).toBe('ቦሌ');
  });

  it('uses the same group labels as Search', () => {
    const labels = labelsFor('am');
    expect(serviceGroupLabel('Home Services', labels)).toBe(labels.categories.homeServices);
    expect(serviceGroupLabel('Repairs & Maintenance', labels)).toBe(labels.categories.repairsMaintenance);
  });

  it('covers every join area slug from web', () => {
    const joinSlugs = SERVICE_LOCATIONS.filter((l) => l.slug !== 'addis-ababa').map((l) => l.slug);
    expect(joinSlugs).toEqual(['bole', 'summit', 'cmc', 'kazanchis', 'yeka', 'piassa', 'megenagna', 'ayat']);
  });
});
