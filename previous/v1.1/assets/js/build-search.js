const normalFormDiv = document.getElementById('normal-search-form');
const advancedFormDiv = document.getElementById('advanced-search-form');
advancedFormDiv.style.display = 'none'; // keep default search as normal

createNormalSearch();
createAdvancedSearch();

function createNormalSearch(){
    const normalSearch = document.createElement('form');
    // create normal search toggle
    const toggle = document.createElement('input');
    toggle.type = "button";
    toggle.value = "Normal Search";
    toggle.addEventListener('click', function(){
        normalFormDiv.style.display = 'none';
        advancedFormDiv.style.display = 'block';
    });
    normalSearch.appendChild(toggle);
    // form line break
    normalSearch.appendChild(document.createElement('br'));
    // number input
    const numberInput = document.createElement('input');
    numberInput.type = "number";
    numberInput.pattern = "[0-9]+";
    numberInput.inputmode = "numeric";
    numberInput.placeholder = "Project Number";
    numberInput.classList.add("light-background");
    normalSearch.appendChild(numberInput);
    // submit button
    const searchButton = document.createElement('input');
    searchButton.type = "button";
    searchButton.value = "Search";
    normalSearch.appendChild(searchButton);
    // append form to document
    normalFormDiv.appendChild(normalSearch);
}

function createAdvancedSearch(){
    const advancedSearch = document.createElement('form');
    // create advanced search toggle
    const toggle = document.createElement('input');
    toggle.type = "button";
    toggle.value = "Advanced Search";
    toggle.addEventListener('click', function(){
        normalFormDiv.style.display = 'block';
        advancedFormDiv.style.display = 'none';
    });
    advancedSearch.appendChild(toggle);
    // form line break
    advancedSearch.appendChild(document.createElement('br'));
    // create add filter butotn
    const addFilter = document.createElement('input');
    addFilter.type = "button";
    addFilter.value = "Add Filter";
    addFilter.addEventListener('click', function(){
        appendSelect(advancedSearch);
    });
    advancedSearch.appendChild(addFilter);
    // form line break
    advancedSearch.appendChild(document.createElement('br'));
    // append initial select
    appendSelect(advancedSearch);
    advancedFormDiv.appendChild(advancedSearch);
}

function appendSelect(search){
    // create selector
    const selectOptions = [
        "Project Number",
        "Molecular Weight",
        "Solid Form",
        "Melting Temperature",
        "Fusion Enthalpy",
        "Solvent",
    ]
    const select = document.createElement('select');
    for (let i = 0; i < selectOptions.length; i++) {
        const tempOption = document.createElement('option');
        tempOption.innerText = selectOptions[i];
        select.appendChild(tempOption);
    }
    search.appendChild(select);
    search.appendChild(document.createElement('div'));
}