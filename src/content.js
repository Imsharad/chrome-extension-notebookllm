import './components/sidebar/sidebar.js';

const SIDEBAR_ID = 'notebooklm-enhanced-sidebar';

function injectSidebar() {
  // Check if the sidebar already exists
  if (document.getElementById(SIDEBAR_ID)) {
    return;
  }

  const sidebar = document.createElement('notebooklm-sidebar');
  sidebar.id = SIDEBAR_ID;
  document.body.appendChild(sidebar);
}

// Initial injection
injectSidebar();

// Re-injection logic using MutationObserver
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.removedNodes) {
      for (const removedNode of mutation.removedNodes) {
        // Check if the removed node is our sidebar or contains it
        if (removedNode.id === SIDEBAR_ID) {
          console.log('Sidebar removed, re-injecting...');
          injectSidebar();
          break;
        }
      }
    }
  }
});

// Start observing the body for child list changes
observer.observe(document.body, { childList: true, subtree: true });
