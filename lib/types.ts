export interface Photo {
  id: string;
  url: string;
  caption: string;
  tags: string[];
  date: string;
  rotation: number;
  sticker_color: 'pink' | 'yellow' | 'green';
  created_at?: string;
}

export const TAG_HIERARCHY = [
  { name: '#Food',   subTags: ['#Ramen', '#Sushi', '#Breakfast', '#Dessert'] },
  { name: '#Travel', subTags: ['#Nature', '#Sunset', '#Adventure', '#Lighthouse'] },
  { name: '#Life',   subTags: ['#Study', '#Mood', '#Rain', '#Exploration'] },
] as const;

export type StickerColor = 'pink' | 'yellow' | 'green';
