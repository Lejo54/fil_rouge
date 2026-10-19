const boutonOuvrir = document.getElementById('ouvrirBoite');
const boutonFermer = document.getElementById('fermerBoite');
const maBoite = document.getElementById('maBoite');

boutonOuvrir.addEventListener('click', () => {
    // text-insertion: on remplace .showModal() par .show()
    maBoite.show(); // Ouvre la boîte SANS bloquer le reste de la page
});

boutonFermer.addEventListener('click', () => {
    maBoite.close();
});

