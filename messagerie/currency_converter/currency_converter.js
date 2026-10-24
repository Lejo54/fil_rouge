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

const boutonOuvrir = document.getElementById('open-box');
const boutonFermer = document.getElementById('close-box');
const maBoite = document.getElementById('box-converter');

boutonOuvrir.addEventListener('click', async () => {
    //fill select box with currencies

    //fetch data
    var data = await getCurrencies();
    var currencies = data.supported_codes

    //collator is more efficient for sorting big data
    const collator = new Intl.Collator('en', { sensitivity: 'base' });
    const sortedCurrencies = [...currencies].sort((a, b) => collator.compare(a[1], b[1]));

    // clear out existing items
    selectBoxBase.options.length = 0; 
    selectBoxConvert.options.length = 0;

    //first option
    selectBoxBase.options.add(new Option("--Choose base currency--",""));
    selectBoxConvert.options.add(new Option("--Choose convert currency--",""))

    for (const [code, name] of Object.entries(sortedCurrencies)){
        if(!name || !code) continue;
        selectBoxBase.options.add(new Option(`${name[1]}(${name[0]})`, code));
        selectBoxConvert.options.add(new Option(`${name[1]}(${name[0]})`, code))
    }
    maBoite.show();
});

boutonFermer.addEventListener('click', () => {
    maBoite.close();
});

const btn = document.getElementById('convert');
const selectBoxBase = document.getElementById('base-currency');
const selectBoxConvert = document.getElementById('convert-currency');


btn.onclick = (event) => {
    event.preventDefault();
    alert(selectBoxConvert.value);
};
