/**
 * This js file is made for solubility-inputdata.html
 */

// hard-coded column labels
const colLabels = [
    "Solvent 1", 
    "Solvent 2", 
    "Solvent 3", 
    "Solv Frac 1 (solute-free)", 
    "Solv Frac 2 (solute-free)", 
    "Solv Frac 3 (solute-free)", 
    "T", 
    "XRPD",
    "Solubility*",
    "",
    "",
    "", 
    "Solute Lot #", 
    "ELN/Sample # of Measurement", 
    "Measurement Method",
    "Comments", 
];
const colLabelsDropdown = [
    ["wt frac", "vol frac"], // for solv frac 1 (2-3 become the same as selection)
    ["mg/g soln.", "mg/g solv", "mg/mL solv."], // for :1 columns under solubility
    ["wt%", "mg/g soln.", "mg/g solv", "mg/mL solv."] // for 1:4 columns under solubility*
]

/**
 * void readFiles()
 * - Separates file uploads from solubility-inputdata.html into individual files
 * - Accounts for unique sheets in each file
 * - Calls filterSheet()
 */
function readFiles() {
    console.log("Upload data button clicked")
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = [...fileInput.files];
    // console.log(selectedFiles.length + " files: " + selectedFiles)
    for (index in selectedFiles) {
        // console.log(selectedFiles[index])
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            for (let i = 0; i < workbook.SheetNames.length; i++) {
                // console.log("Sheet " + i + " is: " + workbook.SheetNames[i])
                const sheetName = workbook.SheetNames[i];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                // console.log(jsonData);
                filterSheet(sheetName, jsonData);
            }
        };
        reader.readAsArrayBuffer(selectedFiles[index])
    }
}

/**
 * void filterSheet(sheetName, jsonDataIn)
 * - Takes the name of the sheet and sheet json data as inputs
 * - Calls grabData() if the sheet is named for data input
 * @param {name of sheet} sheetName 
 * @param {JSON of any sheet} jsonDataIn 
 */
function filterSheet(sheetName, jsonDataIn) {
    console.log("filterSheet() method called");
    // console.log(jsonDataIn);
    switch (sheetName) {
        case 'Indata':
            // console.log("indata");
            grabData(jsonDataIn);
            break;
        default:
            // console.log("not indata");
            break;
    }
}

/**
 * void grabData(jsonDataIn)
 * - Takes jsonData from correct (after filter) sheets
 * - Converts json data into jss objects, which act as dicts
 * - Uses hard-coded terms to look for, can be expanded manually
 * - Calls createTable()
 * @param {JSON of filtered sheet} jsonDataIn 
 */
function grabData(jsonDataIn) {
    console.log("grabData(jsonDataIn) method called");
    data = {}
    for (rowIndex in jsonDataIn) {
        // console.log(row + "-->" + jsonDataIn[row]);
        row = jsonDataIn[rowIndex];
        if (row == null || row == "") {
            continue;
        }
        if (row[0]) {
            switch (row[0]) {
                case "Compound Name":
                    let numbers = row[1].match(/(\d+)/); // gives a list [numbers, numbers]
                    data["name"] = numbers[0]; // we only need one copy of name
                    break;
                case "MW":
                    data["mw"] = [row[1], row[2]]; // value, unit
                    break;
                case "Solid Form":
                    data["solidForm"] = row[1];
                    break;
                default:
                    if (row[0].includes('Tmelt')) {
                        data["tmelt"] = [row[1], row[2]]; // value, unit
                    } else if (row[0].includes('Hfus')) {
                        data["nhfus"] = [row[1], row[2]]; // value, unit
                    } else if (row[3] || row[4] || row[5]) {
                        var rowData = {}
                        // console.log("adding-->" + row + "to rowData");
                        for (colIndex in row) {
                            if (row[colIndex]) {
                                switch (parseInt(colIndex)) {
                                    case 0:
                                        rowData["solvent1"] = row[colIndex];
                                        break;
                                    case 1:
                                        rowData["solvent2"] = row[colIndex];
                                        break;
                                    case 2:
                                        rowData["solvent3"] = row[colIndex];
                                        break;
                                    case 3:
                                        rowData["solvFrac1"] = row[colIndex];
                                        break;
                                    case 4:
                                        rowData["solvFrac2"] = row[colIndex];
                                        break;
                                    case 5:
                                        rowData["solvFrac3"] = row[colIndex];
                                        break;
                                    case 6:
                                        rowData["t"] = row[colIndex];
                                        break;
                                    case 7:
                                        rowData["xrpd"] = row[colIndex];
                                        break;
                                    case 8:
                                        rowData["solubility1"] = row[colIndex];
                                        break;
                                    case 9:
                                        rowData["solubility2"] = row[colIndex];
                                        break;
                                    case 10:
                                        rowData["solubility3"] = row[colIndex];
                                        break;
                                    case 11:
                                        rowData["solubility4"] = row[colIndex];
                                        break;
                                    case 12:
                                        rowData["lotNum"] = row[colIndex];
                                        break;
                                    case 13:
                                        rowData["eln"] = row[colIndex];
                                        break;
                                    case 14:
                                        rowData["measurementMethod"] = row[colIndex];
                                        break;
                                    case 15:
                                        rowData["comments"] = row[colIndex];
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        // console.log("complete rowData-->");
                        // console.log(rowData);
                        if ("data" in data) {
                            data["data"].push(rowData);
                        } else {
                            data["data"] = [rowData];
                        }
                    } else {
                        /* Uncomment the following line if more columns need to be identified.
                         * It outputs into the console the rows that aren't added,
                         * and what the first element is in that row. */
                        // console.log("unaccounted case: " + "-->" + row[0] + "<--" + row);
                        break;
                    }
            }
        }
    }
    console.log(data);
    createTable(data);
}

/**
 * createTable(data)
 * - Creates table for sheet data
 * - Provides visualization
 * @param {Sheet information object} data 
 */
function createTable(data) {
    const tableDiv = document.createElement('div');
    var table = document.createElement('table');
    createHead(table);
    tableDiv.appendChild(table);
    document.body.appendChild(tableDiv);
}

function createHead(table) {
    var thead = document.createElement('thead');
    // creates column labels
    var row1 = document.createElement('tr');
    for (let i = 0; i < colLabels.length; i++) {
        var th = document.createElement('th');
        th.innerText = colLabels[i];
        row1.appendChild(th);
    }
    thead.appendChild(row1);
    // creates secondary labels (allow for choosing options)
    var row2 = document.createElement('tr');
    for (i in colLabels) {
        var th = document.createElement('th');
        switch (colLabels[i]) {
            case "Solv Frac 1 (solute-free)":
                createSelection(row2, th, colLabelsDropdown[0]);
                row2.appendChild(th);
                break;
            case "T":
                th.innerText = "\u00B0C";
                row2.appendChild(th);
                break;
            case "Solubility*":
                createSelection(row2, th, colLabelsDropdown[1]);
                row2.appendChild(th);
                break;
            default:
                row2.appendChild(th);
                break;
        }
    }
    thead.appendChild(row2);
    // add head to table
    table.appendChild(thead);
}

function createSelection(parentparent, parent, options) {
    console.log("createSelection() called");
    var select = document.createElement('select');
    for (index in options) {
        var option = document.createElement('option');
        option.value = options[index];
        option.innerText = options[index];
        select.appendChild(option);
        select.onchange = function () {
            updateHead(parentparent);
        };
    }
    parent.appendChild(select);
}

function updateHead(parent) {
    console.log("updateHead() called");
    var thList = parent.children;
    var selection;
    // set index 4-5 same as index 3 (solv frac)
    selection = thList[3].children[0];
    selection = selection.options[selection.selectedIndex].text;
    thList[4].innerText = selection;
    thList[5].innerText = selection;
    // set index 9-11 correct (solubility*)
    selection = thList[8].children[0];
    selection = selection.options[selection.selectedIndex].text;
    options = structuredClone(colLabelsDropdown[2]);
    options.splice(options.indexOf(selection), 1);
    console.log("options:" + options);
    thList[9].innerText = options.pop();
    console.log("options:" + options);
    thList[10].innerText = options.pop();
    console.log("options:" + options);
    thList[11].innerText = options.pop();
    console.log("options:" + options);
}