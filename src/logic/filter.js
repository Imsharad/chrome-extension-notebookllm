import { evaluate } from './boolean-engine.js';

/**
 * Filters a list of notebooks based on a SmartFolder rule.
 * @param {import('../storage/schema.js').Notebook[]} notebooks - The list of notebooks to filter.
 * @param {object | null} rule - The SmartFolder rule to apply.
 * @returns {import('../storage/schema.js').Notebook[]} - The filtered list of notebooks.
 */
export const filterNotebooks = (notebooks, rule) => {
  if (!rule || Object.keys(rule).length === 0) {
    return notebooks;
  }

  return notebooks.filter(notebook => evaluate(notebook, rule));
};
