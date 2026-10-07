/**
 * Controlled vocabulary for discovery. Terms exist here so staff can assign
 * them, but the storefront shows a term ONLY when at least one published
 * product carries it (master brief: "do not display categories with zero
 * products"). Synonyms feed search ("office bag" → Office & Work).
 */
export interface TermSeed {
  kind: 'style' | 'occasion' | 'collection';
  slug: string;
  label: string;
  description: string;
  synonyms: string[];
}

export const STYLE_TERMS: TermSeed[] = [
  { kind: 'style', slug: 'totes', label: 'Totes', description: 'Open, generous shapes carried on the shoulder or by hand.', synonyms: ['tote', 'totes', 'shopper', 'tote bag'] },
  { kind: 'style', slug: 'shoulder-bags', label: 'Shoulder Bags', description: 'Worn on the shoulder from a short or medium strap.', synonyms: ['shoulder', 'shoulder bag', 'hobo'] },
  { kind: 'style', slug: 'crossbody', label: 'Crossbody', description: 'Worn across the body from a long strap.', synonyms: ['crossbody', 'cross body', 'cross-body', 'messenger'] },
  { kind: 'style', slug: 'handbags', label: 'Handbags', description: 'Carried by hand or in the crook of the arm.', synonyms: ['handbag', 'hand bag', 'purse'] },
  { kind: 'style', slug: 'top-handle', label: 'Top Handle', description: 'Structured shapes with a handle on top.', synonyms: ['top handle', 'top-handle', 'handle bag'] },
  { kind: 'style', slug: 'mini-bags', label: 'Mini Bags', description: 'Small-format pieces.', synonyms: ['mini', 'small bag', 'mini bag'] },
  { kind: 'style', slug: 'clutches', label: 'Clutches', description: 'Held in the hand, without a long strap.', synonyms: ['clutch', 'clutches', 'envelope', 'evening clutch'] },
  { kind: 'style', slug: 'satchels', label: 'Satchels', description: 'Structured, flat-based bags with a flap or top closure.', synonyms: ['satchel', 'satchels'] },
  { kind: 'style', slug: 'bucket-bags', label: 'Bucket Bags', description: 'Rounded shapes, often with a drawstring top.', synonyms: ['bucket', 'bucket bag', 'drawstring'] },
  { kind: 'style', slug: 'sling-bags', label: 'Sling Bags', description: 'Compact bags on a single sling strap.', synonyms: ['sling', 'sling bag'] },
  { kind: 'style', slug: 'backpacks', label: 'Backpacks', description: 'Carried on the back with two straps.', synonyms: ['backpack', 'rucksack'] },
];

export const OCCASION_TERMS: TermSeed[] = [
  { kind: 'occasion', slug: 'everyday', label: 'Everyday', description: 'Pieces suited to regular daily use.', synonyms: ['everyday', 'daily', 'every day', 'day to day'] },
  { kind: 'occasion', slug: 'office-and-work', label: 'Office & Work', description: 'Structured, composed pieces for the working day.', synonyms: ['office', 'work', 'professional', 'formal', 'business', 'office bag'] },
  { kind: 'occasion', slug: 'party-and-evening', label: 'Party & Evening', description: 'Statement and evening pieces.', synonyms: ['party', 'evening', 'night out', 'date night', 'cocktail'] },
  { kind: 'occasion', slug: 'weddings-and-occasions', label: 'Weddings & Occasions', description: 'For celebrations and special events.', synonyms: ['wedding', 'festive', 'function', 'event', 'occasion', 'celebration'] },
  { kind: 'occasion', slug: 'travel', label: 'Travel', description: 'Pieces suited to travel days.', synonyms: ['travel', 'trip', 'weekend away', 'holiday'] },
  { kind: 'occasion', slug: 'casual', label: 'Casual', description: 'Relaxed pieces for off-duty days.', synonyms: ['casual', 'relaxed', 'weekend', 'off duty'] },
];

export const ALL_TERMS = [...STYLE_TERMS, ...OCCASION_TERMS];

export const termId = (t: Pick<TermSeed, 'kind' | 'slug'>) => `${t.kind}:${t.slug}`;
