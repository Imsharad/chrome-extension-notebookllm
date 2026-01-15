const VALID_OPERATORS = ['contains', 'equals', 'greater_than'];

/**
 * Evaluates a rule against a notebook's metadata.
 * @param {object} rule - The rule to evaluate.
 * @param {object} notebook - The notebook object.
 * @returns {boolean} - True if the notebook matches the rule, false otherwise.
 * @throws {Error} - If the rule has an invalid structure during evaluation.
 */
function evaluateRule(rule, notebook) {
  if (!rule || Object.keys(rule).length === 0) {
    throw new Error('Invalid rule structure');
  }

  const { type } = rule;

  switch (type) {
    case 'AND':
      if (!Array.isArray(rule.rules)) throw new Error('Invalid AND rule: "rules" array is missing.');
      return rule.rules.every(subRule => evaluateRule(subRule, notebook));
    case 'OR':
      if (!Array.isArray(rule.rules)) throw new Error('Invalid OR rule: "rules" array is missing.');
      return rule.rules.some(subRule => evaluateRule(subRule, notebook));
    case 'NOT':
      if (!rule.rule) throw new Error('Invalid NOT rule: "rule" object is missing.');
      return !evaluateRule(rule.rule, notebook);
    case undefined: { // This is a simple rule
      const { field, operator, value } = rule;
      if (!field || !operator || value === undefined) {
          throw new Error('Invalid simple rule: Must contain "field", "operator", and "value".');
      }
      const notebookValue = notebook.metadata[field];

      if (notebookValue === undefined) {
        return false;
      }

      switch (operator) {
        case 'contains':
          return Array.isArray(notebookValue) && notebookValue.includes(value);
        case 'equals':
          return notebookValue === value;
        case 'greater_than':
          return new Date(notebookValue) > new Date(value);
        default:
          throw new Error(`Unknown operator: ${operator}`);
      }
    }
    default:
      throw new Error(`Unknown rule type: ${type}`);
  }
}

/**
 * Validates the structure of a rule.
 * @param {object} rule - The rule to validate.
 * @returns {boolean} - True if the rule is valid.
 * @throws {Error} - If the rule is invalid.
 */
function validateRule(rule) {
  if (!rule) throw new Error('Rule cannot be null or undefined.');

  const { type } = rule;

  switch (type) {
    case 'AND':
    case 'OR':
      if (!Array.isArray(rule.rules)) {
        throw new Error(`Invalid rule structure: Missing "rules" array for ${type} type.`);
      }
      rule.rules.forEach(validateRule);
      break;
    case 'NOT':
      if (!rule.rule) {
        throw new Error('Invalid rule structure: Missing "rule" object for NOT type.');
      }
      validateRule(rule.rule);
      break;
    case undefined: { // Simple rule
      const { field, operator, value } = rule;
      if (!field || !operator || value === undefined) {
        throw new Error('Invalid simple rule: Must contain "field", "operator", and "value".');
      }
      if (!VALID_OPERATORS.includes(operator)) {
        throw new Error(`Invalid simple rule: Unknown operator "${operator}".`);
      }
      break;
    }
    default:
      throw new Error(`Invalid rule structure: Unknown type "${type}".`);
  }
  return true;
}

export { evaluateRule, validateRule };
