export class HeuristicScraper {
  extractNotebooks() {
    const notebookElements = document.querySelectorAll('a.notebook-card');
    const notebooks = Array.from(notebookElements).map(element => {
      const title = element.querySelector('.notebook-title')?.textContent;
      const href = element.getAttribute('href');
      const id = href.split('/').pop();
      const lastModified = element.querySelector('[aria-label="Last modified"]')?.textContent;
      const sourceCount = element.querySelector('[aria-label="Source count"]')?.textContent;

      return {
        id,
        title,
        lastModified,
        sourceCount
      };
    });

    return notebooks;
  }
}
