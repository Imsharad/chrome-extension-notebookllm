function evaluateSimpleRule(notebook, rule) {
  const { field, operator, value } = rule;
  const notebookValue = notebook[field];

  if (notebookValue === undefined) {
    return false;
  }

  switch (operator) {
    case 'contains':
      if (Array.isArray(notebookValue)) {
        return notebookValue.includes(value);
      }
      return notebookValue.toLowerCase().includes(value.toLowerCase());
    case 'startsWith':
      return notebookValue.toLowerCase().startsWith(value.toLowerCase());
    case 'is':
      return notebookValue === value;
    case 'greaterThan':
      return notebookValue > value;
    case 'lessThan':
      return notebookValue < value;
    default:
      return false;
  }
}

function evaluateGroup(notebook, group) {
  const { operator, children } = group;

  if (operator === 'AND') {
    return children.every(child => evaluateRule(notebook, child));
  }

  if (operator === 'OR') {
    return children.some(child => evaluateRule(notebook, child));
  }

  return false;
}

export function evaluateRule(notebook, rule) {
  if (rule.type === 'group') {
    return evaluateGroup(notebook, rule);
  }

  if (rule.type === 'rule') {
    return evaluateSimpleRule(notebook, rule);
  }

  return false;
}
