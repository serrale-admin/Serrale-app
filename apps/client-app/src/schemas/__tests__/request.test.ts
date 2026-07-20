import { requestSchema } from '../request';

const base = {
  categoryId: 'plumbers',
  area: 'Bole',
  engagement: '',
  when: 'Today',
  budget: '',
  preferredContact: 'Both',
};

describe('requestSchema', () => {
  it('allows an omitted or blank description', () => {
    expect(requestSchema.parse({ ...base, description: '' }).description).toBe('');
    expect(requestSchema.parse({ ...base, description: '   ' }).description).toBe('');
  });

  it('still requires a service and area', () => {
    expect(() => requestSchema.parse({ ...base, categoryId: '' })).toThrow();
    expect(() => requestSchema.parse({ ...base, area: '' })).toThrow();
  });
});
