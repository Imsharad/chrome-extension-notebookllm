# DOM Snapshot Fixtures

This directory contains HTML snapshots of the NotebookLM application, intended for use in Vitest unit tests.

## Manual Snapshot Collection Instructions

To ensure tests accurately reflect the production DOM, it's crucial to periodically update these snapshots.

1.  **Open NotebookLM**: Navigate to [notebooklm.google.com](https://notebooklm.google.com).
2.  **Open Chrome DevTools**: Right-click anywhere on the page and select "Inspect" (or press `Cmd+Opt+I` on Mac / `Ctrl+Shift+I` on Windows).
3.  **Select the Target Element**:
    *   In the "Elements" tab of DevTools, locate the primary container element that encapsulates the view you want to snapshot. This is often an element like `<main>`, a `<div id="app">`, or a similar high-level container.
    *   Right-click on the desired element.
4.  **Copy the HTML**:
    *   From the context menu, select "Copy" -> "Copy outerHTML".
5.  **Create/Update the Fixture File**:
    *   Paste the copied HTML into a new or existing `.html` file within the `dom-snapshots/` directory.
    *   Use a descriptive filename that clearly indicates the state it represents (e.g., `dashboard-with-notebooks.html`).
6.  **Format the HTML**:
    *   It is recommended to use an HTML formatter (like Prettier) to ensure the file is readable and consistently styled. This helps in identifying meaningful differences when the snapshots are updated.
