export type IconName = 'spray' | 'sous-sol' | 'entretoit' | 'efficacite' | 'confort';

export const iconPaths: Record<IconName, string> = {
  // Bouclier coché — uréthane giclé / étanchéité
  spray: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  // Cube avec niveaux — sous-sol / fondation
  'sous-sol': 'M3 7h18v10H3z M3 12h18 M9 7v10 M15 7v10',
  // Maison à toit triangulaire — entretoit / combles
  entretoit: 'M3 12L12 3l9 9 M5 10v10h14V10',
  // Éclair — efficacité énergétique
  efficacite: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  // Thermomètre — confort thermique
  confort: 'M14 14V4a2 2 0 0 0-4 0v10a4 4 0 1 0 4 0z M12 4v10',
};
