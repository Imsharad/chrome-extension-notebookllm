class Notebook {
  constructor(title, uuid) {
    this.title = title;
    this.uuid = uuid;
    this.tags = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

class SmartFolder {
  constructor(name, rule) {
    this.name = name;
    this.rule = rule;
  }
}

class Tag {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
}

export {
  Notebook,
  SmartFolder,
  Tag,
};
