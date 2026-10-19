const boutonOuvrir = document.getElementById('open-box');
const boutonFermer = document.getElementById('close-box');
const maBoite = document.getElementById('box-converter');

boutonOuvrir.addEventListener('click', () => {
    maBoite.show();
});

boutonFermer.addEventListener('click', () => {
    maBoite.close();
});
