export type Note = {
  id: string;
  content: string;
  tags: string[];
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
};
