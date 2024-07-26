import { loadOptions, options } from './options.lib.js';

const reloadingSet = new Set();

// chrome.action.onClicked
// https://developer.chrome.com/docs/extensions/reference/api/action
// Use the chrome.action API to control the extension's icon in the Google
// Chrome toolbar.
//
// The action icons are displayed in the browser toolbar next to the omnibox.
// After installation, these appear in the extensions menu (the puzzle piece
// icon). Users can pin your extension icon to the toolbar.
chrome.action.onClicked.addListener(async (currentTab) => {
  // chrome.tabs.query
  // https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query
  // Gets all tabs that have the specified properties, or all tabs if no
  // properties are specified.
  reloadAllTabs(currentTab);
});

chrome.contextMenus.create(
  {
    contexts: ['action'],
    id: 'action--open-store-page-chrome',
    title: 'Open Chrome Web Store Page',
  },
  () => {
    chrome.runtime.lastError; // ignore the errors
  },
);
chrome.contextMenus.create(
  {
    contexts: ['action'],
    id: 'action--open-store-page-firefox',
    title: 'Open Firefox Browser Add-ons Page',
  },
  () => {
    chrome.runtime.lastError; // ignore the errors
  },
);

(async () => {
  await loadOptions();
  if (options.show_page_context_menu_item) {
    chrome.contextMenus.create(
      {
        contexts: ['page'],
        id: 'page--reload-all-tabs-in-window',
        title: 'Reload All Tabs (in Window)',
      },
      () => {
        chrome.runtime.lastError; // ignore the errors
      },
    );
  }
})();

chrome.contextMenus.onClicked.addListener((info, currentTab) => {
  switch (info.menuItemId) {
    case 'action--open-store-page-chrome':
      chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/reload-all-tabs-in-window/fobjljihdlfbamijbmadjkkehmlleaoa' });
      break;
    case 'action--open-store-page-firefox':
      chrome.tabs.create({ url: 'https://addons.mozilla.org/en-US/firefox/addon/reloadalltabs-inwindow/' });
      break;
    case 'page--reload-all-tabs-in-window':
      if (currentTab) reloadAllTabs(currentTab);
      break;
  }
});

/** @param {chrome.tabs.Tab} currentTab */
async function reloadAllTabs(currentTab) {
  try {
    await loadOptions();
    if (!reloadingSet.has(currentTab.windowId)) {
      reloadingSet.add(currentTab.windowId);
      for (const tab of await chrome.tabs.query({ windowId: currentTab.windowId })) {
        await reloadTab(tab);
        if (options.use_advanced_options === true) {
          await sleep(pickBetween(options.advanced_delay_range_start, options.advanced_delay_range_end));
        } else {
          await sleep(options.delay);
        }
      }
      reloadingSet.delete(currentTab.windowId);
    }
  } catch (err) {
    console.log('[reloadAllTabs] error:', err);
  }
}

/** @param {chrome.tabs.Tab} tab */
async function reloadTab(tab) {
  try {
    if (tab.id !== undefined) {
      chrome.tabs.reload(tab.id);
    }
  } catch (err) {
    console.log('[reloadTab] error:', err);
  }
}

/**
 * @param {number} delay - ms
 * @returns {Promise<void>}
 */
async function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

/**
 * @param {number} min
 * @param {number} max
 */
function pickBetween(min, max) {
  return min + Math.random() * max;
}
