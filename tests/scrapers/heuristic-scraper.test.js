import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractNotebooks } from '../../src/scrapers/heuristic-scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Heuristic Scraper', () => {
  describe('when scraping a basic dashboard', () => {
    let document;

    beforeAll(() => {
      const html = fs.readFileSync(path.resolve(__dirname, '../fixtures/dom-snapshots/dashboard-basic.html'), 'utf-8');
      const dom = new JSDOM(html);
      document = dom.window.document;
    });

    it('should extract notebook titles from the dashboard', () => {
      const notebooks = extractNotebooks(document);
      const titles = notebooks.map(nb => nb.title);
      const expectedTitles = ['First Notebook', 'Second Notebook', 'Third Notebook'];
      expect(titles).toEqual(expectedTitles);
    });

    it('should extract notebook IDs and URLs from the dashboard', () => {
      const notebooks = extractNotebooks(document);
      const ids = notebooks.map(nb => nb.id);
      const urls = notebooks.map(nb => nb.url);
      const expectedIds = ['nb-123', 'nb-456', 'nb-789'];
      const expectedUrls = ['./notebook/nb-123', './notebook/nb-456', './notebook/nb-789'];
      expect(ids).toEqual(expectedIds);
      expect(urls).toEqual(expectedUrls);
    });

    it('should extract notebook creation dates from the dashboard', () => {
      const notebooks = extractNotebooks(document);
      const creationDates = notebooks.map(nb => nb.creationDate);
      const expectedCreationDates = ['2023-10-26', '2023-10-25', '2023-10-24'];
      expect(creationDates).toEqual(expectedCreationDates);
    });
  });

  it('should handle an empty dashboard', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../fixtures/dom-snapshots/dashboard-empty.html'), 'utf-8');
    const dom = new JSDOM(html);
    const notebooks = extractNotebooks(dom.window.document);
    expect(notebooks).toEqual([]);
  });

  it('should handle malformed notebook entries', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../fixtures/dom-snapshots/dashboard-malformed.html'), 'utf-8');
    const dom = new JSDOM(html);
    const notebooks = extractNotebooks(dom.window.document);
    const titles = notebooks.map(nb => nb.title);
    expect(titles).toEqual(['Second Notebook']);
  });
});
