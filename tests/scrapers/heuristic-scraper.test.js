import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { HeuristicScraper } from '../../src/scrapers/heuristic-scraper.js';

describe('HeuristicScraper', () => {
  let dom;
  let scraper;

  beforeAll(async () => {
    const htmlPath = path.join(__dirname, '..', 'fixtures', 'dom-snapshots', 'notebook-list.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    dom = new JSDOM(htmlContent);
    global.document = dom.window.document;
    scraper = new HeuristicScraper();
  });

  it('should extract all notebook cards from the DOM', () => {
    const notebooks = scraper.extractNotebooks();
    expect(notebooks.length).toBe(3);
  });

  it('should extract the correct title for each notebook', () => {
    const notebooks = scraper.extractNotebooks();
    const titles = notebooks.map(n => n.title);
    expect(titles).toEqual([
      'Introduction to AI',
      'Project Paperwork',
      'Creative Writing Ideas'
    ]);
  });

  it('should extract the correct ID for each notebook', () => {
    const notebooks = scraper.extractNotebooks();
    const ids = notebooks.map(n => n.id);
    expect(ids).toEqual([
      'notebook-id-123',
      'notebook-id-456',
      'notebook-id-789'
    ]);
  });

  it('should extract the last modified date for each notebook', () => {
    const notebooks = scraper.extractNotebooks();
    const modifiedDates = notebooks.map(n => n.lastModified);
    expect(modifiedDates).toEqual([
      'Modified: 2 days ago',
      'Modified: 1 week ago',
      'Modified: 3 weeks ago'
    ]);
  });

  it('should extract the source count for each notebook', () => {
    const notebooks = scraper.extractNotebooks();
    const sourceCounts = notebooks.map(n => n.sourceCount);
    expect(sourceCounts).toEqual([
      '5 Sources',
      '12 Sources',
      '2 Sources'
    ]);
  });
});
