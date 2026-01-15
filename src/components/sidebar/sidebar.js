class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  get collapsed() {
    return this.hasAttribute('collapsed');
  }

  toggle() {
    if (this.collapsed) {
      this.removeAttribute('collapsed');
    } else {
      this.setAttribute('collapsed', '');
    }
  }

  setupEventListeners() {
    const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 9999;
          font-family: 'Google Sans', Roboto, sans-serif;
          --sidebar-width: 280px;
          --sidebar-collapsed-width: 72px;
          --bg-color: #f8f9fa;
          --surface-variant: #e1e3e1;
          --text-color: #1f1f1f;
          --border-color: #c4c7c5;
        }

        /* Dark mode support (if host page has dark mode class, or media query) */
        @media (prefers-color-scheme: dark) {
          :host {
            --bg-color: #1e1f20;
            --surface-variant: #444746;
            --text-color: #e3e3e3;
            --border-color: #444746;
          }
        }

        .sidebar {
          width: var(--sidebar-width);
          height: 100%;
          background-color: var(--bg-color);
          border-right: 1px solid var(--border-color);
          transition: width 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 8px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        :host([collapsed]) .sidebar {
          width: var(--sidebar-collapsed-width);
        }

        .header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          box-sizing: border-box;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--text-color);
          white-space: nowrap;
          opacity: 1;
          transition: opacity 0.2s;
        }

        :host([collapsed]) .title {
          opacity: 0;
          width: 0;
          display: none;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          color: var(--text-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-btn:hover {
          background-color: var(--surface-variant);
        }

        .content {
          padding: 16px;
          flex: 1;
          opacity: 1;
          transition: opacity 0.2s;
          overflow-y: auto;
        }

        :host([collapsed]) .content {
          opacity: 0;
          pointer-events: none;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          margin-top: 24px;
        }
      </style>
      
      <div class="sidebar">
        <div class="header">
          <span class="title">NotebookNest</span>
          <button id="toggle-btn" class="toggle-btn" aria-label="Toggle Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
            </svg>
          </button>
        </div>
        
        <div class="content">
          <div class="section-title">Smart Folders</div>
          <!-- Smart Folders Placeholder -->
          <div style="color: var(--text-color); padding: 8px; background: var(--surface-variant); border-radius: 8px; font-size: 0.9rem;">
            Inbox
          </div>
        </div>
      </div>
    `;
  }
}

// Check if already defined to avoid errors in hot-reload or duplicate injections
if (!customElements.get('notebooklm-sidebar')) {
  customElements.define('notebooklm-sidebar', Sidebar);
}

export default Sidebar;
