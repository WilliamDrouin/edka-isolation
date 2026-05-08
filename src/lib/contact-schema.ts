import { z } from 'zod';

export const typeProjetValues = [
  'residentiel',
  'commercial',
  'agricole',
  'industriel',
  'autre',
] as const;

export type TypeProjet = (typeof typeProjetValues)[number];

export const typeProjetLabels: Record<TypeProjet, string> = {
  residentiel: 'Résidentiel (maison, chalet)',
  commercial: 'Commercial (bureau, commerce)',
  agricole: 'Agricole (étable, ferme, grange)',
  industriel: 'Industriel (entrepôt, usine)',
  autre: 'Autre / non sûr',
};

export const contactSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Votre nom doit contenir au moins 2 caractères.')
    .max(100, 'Votre nom est trop long.'),
  courriel: z
    .string()
    .trim()
    .toLowerCase()
    .email('Veuillez entrer une adresse courriel valide.')
    .max(200),
  telephone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal('')),
  typeProjet: z.enum(typeProjetValues, {
    message: 'Veuillez choisir un type de projet.',
  }),
  typeBatiment: z
    .string()
    .trim()
    .max(120, 'Description trop longue.')
    .optional()
    .or(z.literal('')),
  superficiePiedsCarres: z
    .union([
      z.coerce.number().int().positive().max(1_000_000),
      z.literal(''),
      z.literal(null),
      z.undefined(),
    ])
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Décrivez brièvement votre projet (10 caractères min).')
    .max(2000, 'Message trop long (max 2000 caractères).'),
  // Honeypot — doit rester vide. Si rempli, c'est un bot.
  siteWeb: z.string().max(0, 'Champ invalide.').optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
