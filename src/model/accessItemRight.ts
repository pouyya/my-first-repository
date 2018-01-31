export class AccessRightItem {

  public id: string;
  public name: string;
  public description?: string;

  constructor(id: string, name: string, description?: string) {
    this.id = id;
    this.name = name;
    description && (this.description = description);
  }

}