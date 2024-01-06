const statisticsPage = document.getElementById('statistics-page');
const inputPage = document.getElementById('input-page');
const searchPage = document.getElementById('search-page');

function showStatisticsPage() {
    statisticsPage.style.visibility = 'visible';
    inputPage.style.visibility = 'hidden';
    searchPage.style.visibility = 'hidden';
}

function showInputPage() {
    statisticsPage.style.visibility = 'hidden';
    inputPage.style.visibility = 'visible';
    searchPage.style.visibility = 'hidden';
}

function showSearchPage() {
    statisticsPage.style.visibility = 'hidden';
    inputPage.style.visibility = 'hidden';
    searchPage.style.visibility = 'visible';
}