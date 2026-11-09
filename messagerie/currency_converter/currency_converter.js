// Base URL of ExchangeRate-API; the key is embedded in the URL path (see env.js)
const BASE_API="https://v6.exchangerate-api.com/v6/"+secretKey()+"/";

// State and DOM elements
let selectsFilled = false;
const btnOpen = document.getElementById('open-box');
const btnClose = document.getElementById('close-box');
const convertBox = document.getElementById('box-converter');

const btnConvert = document.getElementById('convert');
const selectBoxBase = document.getElementById('base-currency');
const selectBoxConvert = document.getElementById('convert-currency');
const txtBoxBaseAmont = document.getElementById('base-amount');
const txtBoxConvertAmount= document.getElementById('convert-amount');

// True if the string is a plain number (loose comparison with its parsed float)
const isNumeric = (string) => string == Number.parseFloat(string)

// API helpers and UI functions
// Fetch the list of supported currency codes; returns undefined on failure
async function getCurrencies() {
    try {
        const res = await fetch(BASE_API+"codes");
        const currencies= await res.json();
        return currencies;
    } catch (err) {
        console.error("Error :", err);
    } finally {
        console.log("Currencies fetched !");
    }
}

// Fill both <select> boxes with "Name(CODE)" options, sorted by currency name
function fillSelects(currencies) {

    //sort in name order
    //collator is more efficient for sorting big data
    const collator = new Intl.Collator('en', { sensitivity: 'base' });
    const sortedCurrencies = [...currencies].sort((a, b) => collator.compare(a[1], b[1]));

    // clear out existing items
    selectBoxBase.options.length = 0;
    selectBoxConvert.options.length = 0;

    //first option
    selectBoxBase.options.add(new Option("--Choose base currency--", ""));
    selectBoxConvert.options.add(new Option("--Choose convert currency--", ""));

    for (const [code, name] of sortedCurrencies) {
    if (!name || !code) continue;
    selectBoxBase.options.add(new Option(`${name}(${code})`, code));
    selectBoxConvert.options.add(new Option(`${name}(${code})`, code));
    }
    selectsFilled = true;
}

// Convert `amount` from baseCode to convertCode via the API's pair endpoint; returns undefined on failure
async function Convert(baseCode,convertCode,amount) {
    try {
        const res = await fetch(BASE_API+"pair/"+baseCode+"/"+convertCode+"/"+amount);
        const convertAmount= await res.json();
        return convertAmount;
    } catch (err) {
        console.error("Error :", err);
    } finally {
        console.log("Amount convert !");
    }
}

// Event handlers

btnOpen.addEventListener('click', async () => {
    // Lazily fill the select boxes the first time the panel is opened

    if(!selectsFilled){
        //fetch data
        var data = await getCurrencies();
        var currencies = data.supported_codes

        fillSelects(currencies)
    }

    convertBox.show();
});

btnClose.addEventListener('click', () => {
    convertBox.close();
});

btnConvert.onclick = async (event) => {
    event.preventDefault();

    if(!selectBoxBase.value || !selectBoxConvert.value || !txtBoxBaseAmont.value){
        alert("Select 2 currencies and an amount to convert !");
        return;
    }
    if(!isNumeric(txtBoxBaseAmont.value)){
        alert("Please enter a valid number !");
        return;
    }
    const convert= await Convert(selectBoxBase.value,selectBoxConvert.value,txtBoxBaseAmont.value);
    const convertAmount= convert.conversion_result;
    txtBoxConvertAmount.value=convertAmount;

};