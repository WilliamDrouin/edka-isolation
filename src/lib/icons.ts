export type IconName = 'spray' | 'cellulose' | 'fibre' | 'combles' | 'sous-sol' | 'industriel';

export const iconPaths: Record<IconName, string> = {
  spray: 'M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6Z M7 14l3 3 7-7',
  cellulose:
    'M12 2v4 M4.93 7.93l2.83 2.83 M19.07 7.93l-2.83 2.83 M2 14h4 M18 14h4 M5.5 19l3-3 M18.5 19l-3-3 M9 14a3 3 0 1 1 6 0c0 1.66-1.34 3-3 3s-3-1.34-3-3Z',
  fibre: 'M3 6h18 M3 10h18 M3 14h18 M3 18h18',
  combles: 'M3 12L12 3l9 9 M5 10v10h14V10',
  'sous-sol': 'M3 7h18v10H3z M3 12h18 M9 7v10 M15 7v10',
  industriel: 'M3 21V8l9-5 9 5v13 M9 21V12h6v9 M3 21h18',
};
