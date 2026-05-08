import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      titre: z.string(),
      ordre: z.number(),
      descriptionCourte: z.string(),
      valeurR: z.string().optional(),
      icone: z.enum(['spray', 'sous-sol', 'entretoit', 'efficacite', 'confort']),
      specialite: z.boolean().default(false),
      avantages: z.array(z.string()).min(1),
      applications: z.array(z.string()).min(1),
      admissibleSubvention: z.boolean().default(false),
      photo: image().optional(),
      photoAlt: z.string().optional(),
    }),
});

const subventions = defineCollection({
  loader: glob({ base: './src/content/subventions', pattern: '**/*.md' }),
  schema: z.object({
    nom: z.string(),
    ordre: z.number(),
    gestionnaire: z.string(),
    descriptionCourte: z.string(),
    montantMax: z.string(),
    admissibilite: z.array(z.string()).min(1),
    couvert: z.array(z.string()).min(1),
    lienOfficiel: z.string().url().optional(),
    couleurAccent: z.enum(['bleu', 'vert', 'gris']).default('bleu'),
  }),
});

type Categorie = 'residentiel' | 'commercial' | 'agricole';

const realisations = defineCollection({
  loader: glob({ base: './src/content/realisations', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      titre: z.string(),
      ordre: z.number(),
      categorie: z.enum([
        'residentiel',
        'commercial',
        'agricole',
      ]) satisfies z.ZodType<Categorie>,
      ville: z.string(),
      annee: z.number().int(),
      typesIsolation: z.array(z.string()).min(1),
      superficiePiedsCarres: z.number().int().optional(),
      photoPrincipale: image(),
      photoPrincipaleAlt: z.string(),
      avantApres: z
        .object({
          avant: image(),
          apres: image(),
          legende: z.string().optional(),
        })
        .optional(),
      stats: z
        .object({
          economiesPercent: z.number().int().optional(),
          valeurRAtteinte: z.string().optional(),
          dureeChantier: z.string().optional(),
        })
        .optional(),
      resume: z.string(),
    }),
});

export const collections = { services, subventions, realisations };
