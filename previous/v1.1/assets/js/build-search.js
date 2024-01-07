const normalFormDiv = document.getElementById('normal-search-form');
const advancedFormDiv = document.getElementById('advanced-search-form');
advancedFormDiv.style.display = 'none'; // keep default search as normal

var advancedSearchFilterID = 0;

const equalityTerms = [
    "=",
    "<",
    "<=",
    ">",
    ">=",
]

const solidformTerms = [
    "Form I",
    "Form II",
    "Form III",
]

solventSelectTerms = [
    "has specific solvent combination",
    "has any data on solvent",
]

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
    const selectParent = document.createElement('div');
    const select = document.createElement('select');
    for (let i = 0; i < selectOptions.length; i++) {
        const tempOption = document.createElement('option');
        tempOption.innerText = selectOptions[i];
        select.appendChild(tempOption);
    }
    selectParent.appendChild(select);
    search.appendChild(selectParent)
    // set id for select
    selectParent.id = advancedSearchFilterID.toString();
    advancedSearchFilterID++;
    // make selects based on select value
    updateSelectOptions(select);
    select.addEventListener('change', function(){
        updateSelectOptions(select);
    });
}

function updateSelectOptions(select) {
    var selectedValue = select.value;
    var parentDiv = select.parentNode;
    // reset select div
    if (parentDiv.children.length > 1) {
        for (let i = parentDiv.children.length; i > 0; i--) {
            if (parentDiv.children[i]) {
                parentDiv.removeChild(parentDiv.children[i]);
            }
        }
    }
    // add more inputs depending on what selected value is
    switch (selectedValue) {
        case "Project Number":
            // numerical input
            var numberInput = document.createElement('input');
            numberInput.type = "number";
            numberInput.pattern = "[0-9]+";
            numberInput.placeholder = "Project Number";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
        case "Molecular Weight":
            // equality select
            var equalitySelect = document.createElement('select');
            for (let i = 0; i < equalityTerms.length; i++){
                const tempOption = document.createElement('option');
                tempOption.innerText = equalityTerms[i];
                equalitySelect.appendChild(tempOption);
            }
            parentDiv.appendChild(equalitySelect);
            // numerical input
            var numberInput = document.createElement('input');
            numberInput.type = "number";
            numberInput.placeholder = "Molecular Weight (g/mol)";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
        case "Solid Form":
            var solidformSelect = document.createElement('select');
            for (let i = 0; i < solidformTerms.length; i++){
                const tempOption = document.createElement('option');
                tempOption.innerText = solidformTerms[i];
                solidformSelect.appendChild(tempOption);
            }
            parentDiv.appendChild(solidformSelect);
            break;
        case "Melting Temperature":
            // equality select
            var equalitySelect = document.createElement('select');
            for (let i = 0; i < equalityTerms.length; i++){
                const tempOption = document.createElement('option');
                tempOption.innerText = equalityTerms[i];
                equalitySelect.appendChild(tempOption);
            }
            parentDiv.appendChild(equalitySelect);
            // numerical input
            var numberInput = document.createElement('input');
            numberInput.type = "number";
            numberInput.placeholder = "Melting Temperature (\u00B0C)";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
        case "Fusion Enthalpy":
            // equality select
            var equalitySelect = document.createElement('select');
            for (let i = 0; i < equalityTerms.length; i++){
                const tempOption = document.createElement('option');
                tempOption.innerText = equalityTerms[i];
                equalitySelect.appendChild(tempOption);
            }
            parentDiv.appendChild(equalitySelect);
            // numerical input
            var numberInput = document.createElement('input');
            numberInput.type = "number";
            numberInput.placeholder = "Fusion Enthalpy (J/g)";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
        case "Solvent":
            // solvent select
            var solventSelect = document.createElement('select');
            for (let i = 0; i < solventSelectTerms.length; i++){
                const tempOption = document.createElement('option');
                tempOption.innerText = solventSelectTerms[i];
                solventSelect.appendChild(tempOption);
            }
            parentDiv.appendChild(solventSelect);
            // solvent entries
            solventSelectAction(solventSelect);
            solventSelect.addEventListener("change", function() {
                solventSelectAction(solventSelect);
            })
            break;
    }
}

function solventSelectAction(select) {
    var selectedValue = select.value;
    var parentDiv = select.parentNode;
    // eliminate children
    if (parentDiv.children.length > 2) {
        for (let i = parentDiv.children.length; i > 1; i--) {
            if (parentDiv.children[i]) {
                parentDiv.removeChild(parentDiv.children[i]);
            }
        }
    }
    // add children
    switch (selectedValue) {
        case "has specific solvent combination":
            // text input for solvent 1
            var numberInput = document.createElement('input');
            numberInput.type = "text";
            numberInput.placeholder = "Solvent Name";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            // text input for solvent 2
            var numberInput = document.createElement('input');
            numberInput.type = "text";
            numberInput.placeholder = "Solvent Name (optional)";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            // text input for solvent 3
            var numberInput = document.createElement('input');
            numberInput.type = "text";
            numberInput.placeholder = "Solvent Name (optional)";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
        case "has any data on solvent":
            // text input for single solvent
            var numberInput = document.createElement('input');
            numberInput.type = "text";
            numberInput.placeholder = "Solvent Name";
            numberInput.classList.add("light-background");
            parentDiv.appendChild(numberInput);
            break;
    }
}