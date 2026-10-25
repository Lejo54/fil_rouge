
const BASE_API="https://v6.exchangerate-api.com/v6/"+secretKey()+"/";

// variables and fetch element
let selectsFilled = false;
const btnOpen = document.getElementById('open-box');
const btnClose = document.getElementById('close-box');
const convertBox = document.getElementById('box-converter');

const btnConvert = document.getElementById('convert');
const selectBoxBase = document.getElementById('base-currency');
const selectBoxConvert = document.getElementById('convert-currency');
const txtBoxBaseAmont = document.getElementById('base-amount');
const txtBoxConvertAmount= document.getElementById('convert-amount');

const isNumeric = (string) => string == Number.parseFloat(string)

// function
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

//reaction

btnOpen.addEventListener('click', async () => {
    //fill select box with currencies name and code

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
