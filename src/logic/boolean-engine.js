export function evaluate(notebook, rule) {
  if (rule.type === 'AND') {
    return rule.conditions.every(condition => evaluate(notebook, condition));
  }

  if (rule.type === 'OR') {
    return rule.conditions.some(condition => evaluate(notebook, condition));
  }

  if (rule.type === 'NOT') {
    return !evaluate(notebook, rule.condition);
  }

  const { field, operator, value } = rule;
  const notebookValue = notebook[field];

  if (notebookValue === undefined) {
    return false;
  }

  switch (operator) {
    case 'contains':
      if (Array.isArray(notebookValue)) {
        return notebookValue.some(item => item.toLowerCase().includes(value.toLowerCase()));
      }
      if (typeof notebookValue === 'string') {
        return notebookValue.toLowerCase().includes(value.toLowerCase());
      }
      return false;

    case 'equals':
      return notebookValue === value;

    case 'startsWith':
      if (typeof notebookValue === 'string') {
        return notebookValue.startsWith(value);
      }
      return false;

    case 'greaterThan':
      if (typeof notebookValue === 'number') {
        return notebookValue > value;
      }
      return false;

    case 'lessThan':
      if (typeof notebookValue === 'number') {
        return notebookValue < value;
      }
      return false;

    default:
      return false;
  }
}
