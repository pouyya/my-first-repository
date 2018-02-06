import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export class Brand extends DBBasedEntity {
  public name: string;
  public updatedAt: string;
}