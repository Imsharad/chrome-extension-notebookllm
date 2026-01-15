class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const cssUrl = chrome.runtime.getURL('src/components/sidebar/sidebar.css');
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${cssUrl}">
      <div class="sidebar-container">
        <h2>NotebookLM Enhanced</h2>
        <p>Sidebar content goes here.</p>
        <button id="toggle-btn">Toggle</button>
      </div>
    `;

    this.shadowRoot.getElementById('toggle-btn').addEventListener('click', () => {
        const container = this.shadowRoot.querySelector('.sidebar-container');
        if (container.style.width === '50px') {
            container.style.width = '250px';
        } else {
            container.style.width = '50px';
        }
    });
  }
}

if (!customElements.get('notebooklm-sidebar')) {
  customElements.define('notebooklm-sidebar', Sidebar);
}
