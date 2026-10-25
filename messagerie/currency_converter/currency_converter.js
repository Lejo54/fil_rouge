const BASE_API="https://v6.exchangerate-api.com/v6/"+secretKey()+"/";

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

let selectsFilled = false;
const boutonOuvrir = document.getElementById('open-box');
const boutonFermer = document.getElementById('close-box');
const maBoite = document.getElementById('box-converter');

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

boutonOuvrir.addEventListener('click', async () => {
    //fill select box with currencies name and code

    if(!selectsFilled){
        //fetch data
        var data = await getCurrencies();
        var currencies = data.supported_codes

        fillSelects(currencies)
    }

    maBoite.show();
});

boutonFermer.addEventListener('click', () => {
    maBoite.close();
});

const btnConvert = document.getElementById('convert');
const selectBoxBase = document.getElementById('base-currency');
const selectBoxConvert = document.getElementById('convert-currency');
const txtBoxBaseAmont = document.getElementById('baseAmount');
const txtBoxConvertAmount= document.getElementById('convertAmount');

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

btnConvert.onclick = async (event) => {
    event.preventDefault();

    if(!selectBoxBase.value || !selectBoxConvert.value || !txtBoxBaseAmont.value){
        alert("Select 2 currencies and an amount to convert !");
        return;
    }
    const convert= await Convert(selectBoxBase.value,selectBoxConvert.value,txtBoxBaseAmont.value);
    const convertAmount= convert.conversion_result;
    txtBoxConvertAmount.value=convertAmount;

};
