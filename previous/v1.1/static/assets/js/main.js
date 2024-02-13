function showStatisticsPage() {
    window.location.href = '/statistics';
}

function showInputPage() {
    window.location.href = '/input_data';
}

function showSearchPage() {
    window.location.href = '/search';
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


