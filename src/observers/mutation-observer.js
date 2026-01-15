export class MutationObserverManager {
  constructor({ debounce = 0 } = {}) {
    this._observer = null;
    this._listeners = {};
    this.currentState = 'initial'; // 'initial' | 'appLoaded'
    this._debounce = debounce;
    this._debounceTimer = null;
    this._mutationBuffer = [];
  }

  on(eventName, callback) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(callback);
  }

  _emit(eventName, ...args) {
    const eventListeners = this._listeners[eventName];
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args));
    }
  }

  _handleMutations(mutations) {
    this._mutationBuffer.push(...mutations);

    if (this._debounce > 0) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this._processBufferedMutations();
      }, this._debounce);
    } else {
      this._processBufferedMutations();
    }
  }

  _processBufferedMutations() {
    if (this._mutationBuffer.length === 0) return;
    this._processMutations(this._mutationBuffer);
    this._mutationBuffer = [];
  }

  _processMutations(mutations) {
    const notebookGrid = document.querySelector('#notebook-grid');

    if (this.currentState === 'initial' && notebookGrid) {
        this.currentState = 'appLoaded';
        this._emit('appLoaded');
    } else if (this.currentState === 'appLoaded') {
        if (!notebookGrid) {
            this.currentState = 'navigatedAway';
        } else {
            const hasMutationsInGrid = mutations.some(mutation =>
                notebookGrid && (notebookGrid === mutation.target || notebookGrid.contains(mutation.target))
            );
            if (hasMutationsInGrid) {
                this._emit('notebookListChanged');
            }
        }
    } else if (this.currentState === 'navigatedAway' && notebookGrid) {
        this.currentState = 'appLoaded';
        this._emit('navigation');
    }
  }

  observe(target) {
    this._observer = new MutationObserver(this._handleMutations.bind(this));
    this._observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  disconnect() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
}
