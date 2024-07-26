export const options = {
  delay: 0,
  show_page_context_menu_item: true,
  // advanced options
  use_advanced_options: false,
  advanced_delay_range_start: 0,
  advanced_delay_range_end: 0,
};

export const optionKeys = Object.freeze(Object.keys(options));

/** @return {Promise<void>} */
export function loadOptions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(optionKeys, (items) => {
      chrome.runtime.lastError; // ignore the errors

      const {
        delay,
        show_page_context_menu_item,
        // advanced options
        use_advanced_options,
        advanced_delay_range_end,
        advanced_delay_range_start,
      } = items;

      if (isNumber(delay)) options.delay = delay;
      if (isBoolean(show_page_context_menu_item)) options.show_page_context_menu_item = show_page_context_menu_item;
      if (isBoolean(use_advanced_options)) options.use_advanced_options = use_advanced_options;
      if (isNumber(advanced_delay_range_end)) options.advanced_delay_range_end = advanced_delay_range_end;
      if (isNumber(advanced_delay_range_start)) options.advanced_delay_range_start = advanced_delay_range_start;

      return resolve();
    });
  });
}

/**
 * @param {*} value
 * @return {value is boolean}
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}
/**
 * @param {*} value
 * @return {value is number}
 */
function isNumber(value) {
  return typeof value === 'number' && value === value;
}
/**
 * @param {*} value
 * @return {value is string}
 */
function isString(value) {
  return typeof value === 'string' && value !== '';
}
