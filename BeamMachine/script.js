// ==UserScript==
// @name         Renew target on BeamMachine
// @namespace    killa
// @version      1.1
// @description  Renews attack on target after it expires very easily.
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let alreadyClicked = false;

    function clickFirstRowRenew() {
        if (alreadyClicked) return;

        const firstRow = document.querySelector('table.js-dataTable-full tbody tr');
        if (!firstRow) return;

        const expireCell = firstRow.cells[4]; // Expires column
        const actionCell = firstRow.cells[5]; // Action column

        if (expireCell && expireCell.textContent.trim() === 'Expired') {
            const button = actionCell.querySelector('button');
            if (button) {
                console.log('✅ Clicking Renew in first row...');
                button.click();
                alreadyClicked = true;

                // Reset after delay (adjust time as needed)
                setTimeout(() => {
                    console.log('🔁 Resetting click state...');
                    alreadyClicked = false;
                }, 5000); // 5 seconds delay
            }
        }
    }

    // MutationObserver watches for table changes
    const target = document.querySelector('table.js-dataTable-full tbody');
    if (target) {
        const observer = new MutationObserver(() => {
            clickFirstRowRenew();
        });

        observer.observe(target, { childList: true, subtree: true });
    }

    // Fallback interval
    setInterval(clickFirstRowRenew, 1000);
})();
