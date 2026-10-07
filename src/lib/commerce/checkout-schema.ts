/**
 * Checkout input contract, shared by the form (client) and the API (server).
 * Strict: unknown fields are rejected. Only what delivery and support need.
 */
import { z } from 'zod';
import { normalisePhone } from '../enquiry/schema';

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `Please enter ${label}.` })
    .trim()
    .min(min, { error: min <= 1 ? `Please enter ${label}.` : `${label[0].toUpperCase()}${label.slice(1)} looks too short.` })
    .max(max, { error: `${label[0].toUpperCase()}${label.slice(1)} is too long.` })
    .refine((v) => !/[<>]/.test(v), { error: 'Please remove < and > characters.' });

export const addressSchema = z.strictObject({
  fullName: text(2, 80, 'the recipient’s full name'),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = normalisePhone(v);
      if (!n || !/^\+91[6-9]\d{9}$/.test(n)) {
        ctx.addIssue({ code: 'custom', message: 'Please enter a 10-digit Indian mobile number, e.g. 98711 71112.' });
      }
      return n ?? '';
    }),
  line1: text(3, 120, 'the address'),
  line2: z.string().trim().max(120, { error: 'Address line 2 is too long.' }).optional().default(''),
  city: text(2, 60, 'the city'),
  state: z.enum(INDIAN_STATES, { error: 'Please choose a state or union territory.' }),
  postalCode: z.string().trim().regex(/^[1-9]\d{5}$/, { error: 'Please enter a 6-digit PIN code.' }),
});

export const checkoutSchema = z.strictObject({
  email: z.email({ error: 'Please enter a valid email address.' }).trim().toLowerCase().max(160),
  address: addressSchema,
  saveAddress: z.boolean().optional().default(false),
  acceptTerms: z.literal(true, { error: 'Please confirm you accept the terms and policies.' }),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
