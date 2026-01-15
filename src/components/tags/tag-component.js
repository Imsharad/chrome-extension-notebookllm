export function renderTags(tags, container, handlers = {}) {
  container.innerHTML = '';
  tags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-chip';
    tagElement.style.backgroundColor = tag.color;
    tagElement.textContent = tag.name;
    tagElement.dataset.tagId = tag.id;

    if (handlers.onClick) {
      tagElement.addEventListener('click', () => handlers.onClick(tag.id));
    }

    if (handlers.onRemove) {
      const removeButton = document.createElement('span');
      removeButton.className = 'tag-remove';
      removeButton.textContent = 'x';
      removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onRemove(tag.id);
      });
      tagElement.appendChild(removeButton);
    }

    container.appendChild(tagElement);
  });
}
