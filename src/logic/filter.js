import { evaluateRule } from './boolean-engine.js';

export function filterNotebooks(notebooks, rule) {
  if (!notebooks || notebooks.length === 0) {
    return [];
  }

  return notebooks.filter(notebook => evaluateRule(notebook, rule));
}
