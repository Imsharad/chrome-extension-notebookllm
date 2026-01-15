class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.shadowRoot.getElementById('toggle-btn').addEventListener('click', () => this.toggle());
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

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 250px;
          height: 100vh;
          background-color: #f0f0f0;
          transition: width 0.3s;
          border-right: 1px solid #ccc;
        }
        :host([collapsed]) {
          width: 50px;
        }
      </style>
      <div id="sidebar">
        <button id="toggle-btn">Toggle</button>
      </div>
    `;
  }
}

customElements.define('sidebar-component', Sidebar);
export default Sidebar;
