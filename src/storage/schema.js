export class Notebook {
  constructor({ id, title, createdAt, updatedAt, tags, sourceCount }) {
    this.id = id;
    this.title = title;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.tags = tags;
    this.sourceCount = sourceCount;
  }
}

export class SmartFolder {
  constructor({ id, name, rule, createdAt }) {
    this.id = id;
    this.name = name;
    this.rule = rule;
    this.createdAt = createdAt;
  }
}
