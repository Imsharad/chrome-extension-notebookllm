export default class StateObserver {
  constructor(targetNode, callback) {
    this.targetNode = targetNode;
    this.callback = callback;
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.previousNotebookCount = 0;
    this.currentState = this.getCurrentState();
  }

  connect() {
    this.observer.observe(this.targetNode, {
      childList: true,
      subtree: true,
    });
    this.previousNotebookCount = this.getNotebookCount();
    // After connecting, check the initial state.
    this.checkForStateChanges();
  }

  disconnect() {
    this.observer.disconnect();
  }

  handleMutations(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        this.checkForStateChanges();
      }
    }
  }

  checkForStateChanges() {
    const newState = this.getCurrentState();
    const currentNotebookCount = this.getNotebookCount();

    if (newState !== this.currentState) {
      this.currentState = newState;
      this.callback({ 'app-state': newState });
    } else if (this.currentState === 'loaded' && currentNotebookCount > this.previousNotebookCount) {
      this.callback({ 'notebook-list-state': 'updated' });
    }

    this.previousNotebookCount = currentNotebookCount;
  }

  getCurrentState() {
    if (this.isAppLoaded()) {
      return 'loaded';
    }
    if (this.isAppLoading()) {
      return 'loading';
    }
    return 'unknown';
  }

  isAppLoaded() {
    return this.targetNode.querySelector('main-content') !== null;
  }

  isAppLoading() {
    return this.targetNode.querySelector('.loading-spinner') !== null;
  }

  getNotebookCount() {
    return this.targetNode.querySelectorAll('notebook-card').length;
  }
}
