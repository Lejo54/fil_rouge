// Currency API key used by the currency converter.
// WARNING: this file is served to the browser, so the key is visible to anyone.
const CURRENCY_API_KEY="4b4bba5f311503d345a92f6e"

// Getter used by other scripts to read the key
function secretKey() {
  return CURRENCY_API_KEY;
}