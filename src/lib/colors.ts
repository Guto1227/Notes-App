export const PASTEL_COLORS = [
  '#FFD1DC', // Light Pink
  '#FFFACD', // Lemon Chiffon
  '#ADD8E6', // Light Blue
  '#98FB98', // Pale Green
  '#D8BFD8', // Thistle
  '#FFE4B5', // Moccasin
];

export const getRandomPastelColor = (): string => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};
