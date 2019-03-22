import { BaseEntity } from './-base-entity';
import { Category } from './category';
import { Resource } from './resource';

export class Article extends BaseEntity {
  id: number;
  title: string;
  authorId: string;
  abstracts: string;
  content: string;
  category: Category;
  tags: string[];
  images: Resource[];
  accessories: Resource[];
  status: string;
  beDelete: boolean;
}
