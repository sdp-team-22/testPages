/**
 * formData, solubilityData, and data are already global variables
 */

function displayData(data) {
    //console.log("displayData() called");
    createTable(data);
}

function createTable(data) {
    //console.log("createTable() called");
    const tableDiv = document.createElement('div');
    tableDiv.style.backgroundColor = "beige";
    tableDiv.style.marginBottom = "1rem";
    createTitleTable(data, tableDiv);
    createDataTable(data, tableDiv);
    document.body.appendChild(tableDiv);
}

function createTitleTable(data, tableDiv) {
    //console.log("createTitle() called");
    // instantiate containers
    const titleDiv = document.createElement('div');
    const titleTable = document.createElement('table');
    const titleHead = document.createElement('thead');
    const titleRow = document.createElement('tr');
    // connect elements
    tableDiv.appendChild(titleDiv);
    titleDiv.appendChild(titleTable);
    titleTable.appendChild(titleHead);
    titleTable.appendChild(titleRow);
    // add th and td
    for (let i = 0; i < Object.keys(formData).length; i++) {
        // instantiate containers
        const titleHeadData = document.createElement('th');
        const titleRowData = document.createElement('td');
        const titleRowDataDiv = document.createElement('div');
        // connect elements
        titleHead.appendChild(titleHeadData);
        titleRow.appendChild(titleRowData);
        titleRowData.appendChild(titleRowDataDiv);
        // style elements
        titleHeadData.style.borderStyle = "solid";
        titleHeadData.style.padding = "5px";
        titleRowData.style.borderStyle = "solid";
        titleRowData.style.padding = "5px";
        titleRowDataDiv.contentEditable = "true";
        if (data[formData[i][1]]) {
            titleHeadData.innerText = formData[i][2];
            titleRowDataDiv.innerText = data[formData[i][1]];
        }
    }
    // style elements
    titleDiv.style.marginBottom = "1rem";
    titleTable.style.width = "100%";
    titleTable.style.tableLayout = "fixed";
    titleTable.style.borderCollapse = "collapse";
}

function createDataTable(data, tableDiv) {
    //console.log("createTitle() called");
    // instantiate containers
    const bodyDiv = document.createElement('div');
    const bodyTable = document.createElement('table');
    const bodyHead = document.createElement('thead');
    // connect elements
    tableDiv.appendChild(bodyDiv);
    bodyDiv.appendChild(bodyTable);
    bodyTable.appendChild(bodyHead);
    // add column labels
    // this adds 2 columns, need to make this adaptive
    // NEED TO IMPROVE
    const bodyHeadPrimary = document.createElement('tr');
    const bodyHeadSecondary = document.createElement('tr');
    bodyHead.appendChild(bodyHeadPrimary);
    bodyHead.appendChild(bodyHeadSecondary);
    for (let i = 0; i < Object.keys(solubilityData).length; i++) {
        // create elements
        const primaryCol = document.createElement('th');
        const secondaryCol = document.createElement('th');
        // combine elements
        bodyHeadPrimary.appendChild(primaryCol);
        bodyHeadSecondary.appendChild(secondaryCol);
        // style
        primaryCol.innerText = solubilityData[i][1];
        primaryCol.style.borderStyle = "solid";
        primaryCol.style.whiteSpace = "nowrap";
        primaryCol.style.overflow = "hidden";
        primaryCol.style.padding = "5px";
        secondaryCol.innerText = "";
        secondaryCol.style.borderStyle = "solid";
        secondaryCol.style.whiteSpace = "nowrap";
        secondaryCol.style.overflow = "hidden";
        secondaryCol.style.padding = "5px";
    }
    // add data
    for (let i = 0; i < data["data"].length; i++) {
        const dataRow = document.createElement('tr');
        for (let j = 0; j < Object.keys(solubilityData).length; j++) {
            // create elements
            const dataBox = document.createElement('td');
            const dataBoxDiv = document.createElement('div');
            // combine elements
            dataRow.appendChild(dataBox);
            dataBox.appendChild(dataBoxDiv);
            // style
            dataBox.style.borderStyle = "solid";
            dataBox.style.padding = "5px";
            dataBox.style.whiteSpace = "nowrap";
            dataBox.style.overflow = "hidden";
            dataBoxDiv.contentEditable = "true";
            if (data["data"][i][solubilityData[j][0]]) {
                dataBoxDiv.innerText = data["data"][i][solubilityData[j][0]];
            }
        }
        bodyTable.appendChild(dataRow);
    }
    // style
    bodyDiv.style.overflow = "scroll";
    bodyTable.style.borderCollapse = "collapse";
    bodyTable.style.tableLayout = "fixed";
}