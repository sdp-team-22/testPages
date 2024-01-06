/**
 * Choosing Pages
 */

const statisticsPage = document.getElementById('statistics-page');
const inputPage = document.getElementById('input-page');
const searchPage = document.getElementById('search-page');

function showStatisticsPage() {
    statisticsPage.style.display = 'block';
    inputPage.style.display = 'none';
    searchPage.style.display = 'none';
}

function showInputPage() {
    statisticsPage.style.display = 'none';
    inputPage.style.display = 'block';
    searchPage.style.display = 'none';
}

function showSearchPage() {
    statisticsPage.style.display = 'none';
    inputPage.style.display = 'none';
    searchPage.style.display = 'block';
}

/**
 * Toggle Searching
 */
const normalSearch = document.getElementById('normal-search');
const advancedSearch = document.getElementById('advanced-search');

function toggleAdvancedSearch(){
    advancedSearch.style.display = (advancedSearch.style.display === 'none' || advancedSearch.style.display === '') ? 'block' : 'none';
    normalSearch.style.display = (advancedSearch.style.display === 'none' || advancedSearch.style.display === '') ? 'block' : 'none';
}