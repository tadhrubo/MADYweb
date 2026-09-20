export type Ingredient = {
  slot: string;
  left: number;
  top: number;
  width: number;
  rotate: number;
  float: number;
  depth: number;
  side: 'left' | 'right';
};

export const ingredients: Ingredient[] = [
  ['chicken', 8.5, 13, 22.5, -6, 4.8, 1.15, 'left'],
  ['lettuce', 7, 40, 24.5, -8, 5.4, 0.85, 'left'],
  ['tomato', 10.5, 72, 12, -10, 4.4, 1.4, 'left'],
  ['pickles', 22.5, 82, 12, 6, 6.3, 0.9, 'left'],
  ['red-onion', 70.5, 10, 20, 8, 5.7, 1.2, 'right'],
  ['garlic-sauce', 73.7, 37, 16.5, -3, 4.9, 0.75, 'right'],
  ['chili', 80.5, 59, 11, -12, 6.8, 1.45, 'right'],
  ['flatbread', 67, 71, 24, 4, 5.9, 1, 'right'],
].map(([slot, left, top, width, rotate, float, depth, side]) => ({ slot, left, top, width, rotate, float, depth, side })) as Ingredient[];
