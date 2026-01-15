const evaluateRule = (notebook, rule) => {
  const { field, operator, value } = rule;
  const notebookValue = notebook[field];

  switch (operator) {
    case 'is':
      return notebookValue === value;
    case 'contains':
      return notebookValue.includes(value);
    case 'startsWith':
      return notebookValue.startsWith(value);
    case 'gt':
      return notebookValue > value;
    case 'lt':
      return notebookValue < value;
    case 'hasTag':
      return notebookValue.includes(value);
    case 'doesNotHaveTag':
      return !notebookValue.includes(value);
    default:
      return false;
  }
};

export const evaluate = (notebook, rule) => {
  if (!rule || Object.keys(rule).length === 0) {
    return true;
  }

  if (rule.type === 'rule') {
    return evaluateRule(notebook, rule);
  }

  if (rule.type === 'group') {
    const results = rule.children.map(child => evaluate(notebook, child));

    switch (rule.operator) {
      case 'AND':
        return results.every(r => r === true);
      case 'OR':
        return results.some(r => r === true);
      case 'NOT':
        return !results[0];
      default:
        return false;
    }
  }

  return false;
};
