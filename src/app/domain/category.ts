import { BaseEntity } from './-base-entity';
import { Resource } from './resource';

export class Category extends BaseEntity {
  urlAlias: string;
  title: string;
  beLeaf: boolean;
  nodeLevel: number;
  parentNodeUrlAlias: string;
  sequence: number;
  childrenCount: number;
  articleCount: number;
  customPage: string;
  customPageImages: Resource[];
}
