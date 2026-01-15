/**
 * Extracts notebook information from the NotebookLM dashboard.
 * @param {Document} document - The DOM document to scrape.
 * @returns {Array<{title: string}>} - An array of notebook objects.
 */
export function extractNotebooks(document) {
  const notebookCards = document.querySelectorAll('.notebook-card');
  const notebooks = [];
  notebookCards.forEach(card => {
    const titleElement = card.querySelector('.notebook-title');
    const metadataElement = card.querySelector('.notebook-metadata');
    const url = card.getAttribute('href');
    const id = url ? url.split('/').pop() : null;
    const creationDate = metadataElement ? metadataElement.textContent.replace('Created: ', '').trim() : null;

    if (titleElement && id) {
      notebooks.push({
        id: id,
        url: url,
        title: titleElement.textContent.trim(),
        creationDate: creationDate,
      });
    }
  });
  return notebooks;
}
