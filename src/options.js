import { loadOptions, options } from './options.lib.js';

/** @type {Timer|undefined} */
let save_blinking_interval = undefined;

async function init() {
  await loadOptions();
  initContextMenus();

  // Delete Children
  document.body.replaceChildren();

  // Delay Option
  const delay_input = newNumberOptionInput(options.delay, 0);
  document.body.append(
    newOptionDiv([
      newOptionLabel([
        document.createTextNode('Delay between each tab reload: '), //
        delay_input,
        document.createTextNode('ms'),
      ]),
    ]),
  );

  // Show Page Context Menu Option
  const show_page_context_menu_item_input = newCheckboxOptionInput(options.show_page_context_menu_item);
  document.body.append(
    newLineBreak(),
    newOptionDiv([
      newOptionLabel([
        show_page_context_menu_item_input, //
        document.createTextNode(' Show "Reload All Tabs (in Window)" in page right-click context menu.'),
      ]),
    ]),
  );

  // Use Advanced Options Option
  const use_advanced_options_input = newCheckboxOptionInput(options.use_advanced_options);
  document.body.append(
    newLineBreak(),
    newOptionDiv([
      newOptionLabel([
        use_advanced_options_input, //
        document.createTextNode(' Use advanced options.'),
      ]),
    ]),
  );

  const advanced_options_div = document.createElement('div');
  /** @param {boolean} show */
  function updateAdvancedOptionsContainer(show = options.use_advanced_options) {
    if (show === true) {
      advanced_options_div.style.removeProperty('display');
    } else {
      advanced_options_div.style.setProperty('display', 'none');
    }
  }
  updateAdvancedOptionsContainer();
  document.body.append(advanced_options_div);
  use_advanced_options_input.addEventListener('input', () => {
    updateAdvancedOptionsContainer(use_advanced_options_input.checked);
  });

  // Advanced Options //
  //                                                                        //
  advanced_options_div.append(
    newSectionBreak(),
    document.createTextNode('Advanced Options'), //
  );

  // Delay Range Option
  const advanced_delay_range_start_input = newNumberOptionInput(options.advanced_delay_range_start, 0);
  const advanced_delay_range_end_input = newNumberOptionInput(options.advanced_delay_range_end, 0);
  advanced_options_div.append(
    newLineBreak(),
    newOptionDiv([
      newOptionLabel([
        document.createTextNode('Delay between each tab reload, chosen randomly from range: '), //
        document.createTextNode('['),
        advanced_delay_range_start_input,
        document.createTextNode(','),
        advanced_delay_range_end_input,
        document.createTextNode('] ms'),
      ]),
    ]),
  );
  //                                                                        //

  // Save Button and Status Indicator
  const saveButton = document.createElement('button');
  saveButton.toggleAttribute('disabled', true);
  saveButton.textContent = 'Save Changes';
  const statusSpan = document.createElement('span');
  statusSpan.id = 'save-status';

  document.body.append(
    newLineBreak(),
    saveButton, //
    document.createTextNode(' '),
    statusSpan,
  );

  // Save Options
  const saveOptions = () => {
    options.delay = toInt(delay_input);
    options.show_page_context_menu_item = show_page_context_menu_item_input.checked;
    // advanced options
    options.use_advanced_options = use_advanced_options_input.checked;
    options.advanced_delay_range_start = toInt(advanced_delay_range_start_input);
    options.advanced_delay_range_end = toInt(advanced_delay_range_end_input);

    chrome.storage.local.set(options, async () => {
      updateAdvancedOptionsContainer();
      if (chrome.runtime.lastError) {
        statusSpan.textContent = 'Error! ' + chrome.runtime.lastError;
      } else {
        statusSpan.textContent = 'Options saved successfully.';
        initContextMenus();
        setTimeout(() => {
          statusSpan.textContent = '';
        }, 1500);
      }
    });
  };

  saveButton.addEventListener('click', saveOptions);

  function checkForChanges() {
    clearInterval(save_blinking_interval);
    if (
      options.delay !== toInt(delay_input) || //
      options.show_page_context_menu_item !== show_page_context_menu_item_input.checked ||
      // advanced options
      options.use_advanced_options !== use_advanced_options_input.checked ||
      options.advanced_delay_range_start !== toInt(advanced_delay_range_start_input) ||
      options.advanced_delay_range_end !== toInt(advanced_delay_range_end_input)
    ) {
      saveButton.toggleAttribute('disabled', false);
      saveButton.classList.toggle('alt-color');
      save_blinking_interval = setInterval(() => {
        saveButton.classList.toggle('alt-color');
      }, 500);
    } else {
      saveButton.toggleAttribute('disabled', true);
      saveButton.classList.remove('alt-color');
    }
  }

  saveButton.addEventListener('click', checkForChanges);
  for (const input of document.querySelectorAll('input')) {
    input.addEventListener('input', checkForChanges);
  }
}

function initContextMenus() {
  if (options.show_page_context_menu_item === true) {
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
  } else {
    chrome.contextMenus.remove('page--reload-all-tabs-in-window', () => {
      chrome.runtime.lastError; // ignore the errors
    });
  }
}

init();

/** @param {Node[]} children */
function newOptionDiv(children) {
  const div = document.createElement('div');
  div.classList.add('option');
  div.append(...children);
  return div;
}
/** @param {Node[]} children */
function newOptionLabel(children) {
  const label = document.createElement('label');
  label.append(...children);
  return label;
}
/**
 * @param {number} value
 * @param {number} default_value
 */
function newNumberOptionInput(value, default_value) {
  const input = document.createElement('input');
  input.classList.add('option-number');
  input.type = 'text';
  input.placeholder = default_value.toString(10);
  if (value !== default_value) {
    input.value = value.toString(10);
  }
  return input;
}
/** @param {boolean} value */
function newCheckboxOptionInput(value) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = value;
  return input;
}

function newLineBreak() {
  const div = document.createElement('div');
  div.classList.add('line-break');
  return div;
}
function newSectionBreak() {
  const div = document.createElement('div');
  div.classList.add('section-break');
  return div;
}

/** @param {HTMLInputElement} input */
function toInt(input) {
  return Number.parseInt(input.value) || 0;
}
