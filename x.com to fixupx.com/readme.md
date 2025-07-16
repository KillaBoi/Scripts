# X to FixupX URL Rewriter Chrome/Brave Extension

This Chrome/Brave extension automatically rewrites copied URLs from `x.com` to `fixupx.com`, making them suitable for embedding on Discord.

## Installation Instructions

Follow these steps to install the extension in Chrome or Brave:

1. **Download the Extension Files**
   - Create a new directory (e.g., `x-to-fixupx-extension`) on your computer.
   - Save the following files in this directory:
     - `manifest.json`
     - `background.js`
     - `content.js`
   - Ensure all files are placed in the same directory.

2. **Enable Developer Mode**
   - Open your Chrome or Brave browser.
   - Navigate to the Extensions page:
     - In Chrome: Go to `chrome://extensions/`.
     - In Brave: Go to `brave://extensions/`.
   - Enable **Developer mode** by toggling the switch in the top-right corner.

3. **Load the Extension**
   - Click the **Load unpacked** button.
   - Select the directory where you saved the extension files (e.g., `x-to-fixupx-extension`).
   - Click **Open** to load the extension.

4. **Verify Installation**
   - The extension, named "X to FixupX URL Rewriter," should now appear in your list of extensions.
   - No additional configuration is required.

## Usage
- Visit any page on `x.com`.
- Copy any URL (e.g., by selecting text or copying a link).
- The extension will automatically rewrite `x.com` to `fixupx.com` in the copied URL.
- Paste the modified URL into Discord, and it should embed correctly.

## Notes
- The extension only modifies URLs when copying text from `x.com` pages.
- Ensure the extension remains enabled in your browser for it to work.
- If you encounter issues, check the console for errors (right-click on a webpage, select "Inspect," and go to the "Console" tab).

## Troubleshooting
- If the extension doesn't load, verify that all files are correctly placed in the directory and that the file contents match the provided code.
- Ensure you have the necessary permissions (`clipboardWrite`, `clipboardRead`, `activeTab`) enabled, as specified in `manifest.json`.
