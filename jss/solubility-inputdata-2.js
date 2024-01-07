/**
 * This file contains scripts for:
 * - Reading .xlsx files, filtering for data sheets, convert to JSON
 * - Separating json data into categories
 * - Display data on website
 */

/**
 * The following variables can be adjusted to allow for more flexibility:
 * inputSheetNames --> 
 *      - sheet name within workbook that contains data we will read
 *      - dict[name in file:[category id, preferred visual id]]
 * formData -->
 *      - column id, form id, and output label of form data we will read
 *      - array of [string id, string tableLabel, string visualLabel]
 * solubilityData --> 
 *      - column id and strings of tables that we will read (ordered for visualization step)
 *      - dict of name in file: [category id]
 */
const inputSheetNames = new Set(["Indata", ]);
// formData are categories of form data dict[order #:[form name, category id, preferred name]]
const formData = {
    0: ["Compound Name", "name", "Compound Name"],
    1: ["MW", "mw", "MW"],
    2: ["Solid Form", "solidform", "Solid Form"],
    3: ["Tmelt", "tmelt", "Tmelt"],
    4: [String.fromCharCode(925) + "Hfus", "nhfus", "Enthalpy of Fusion"],
}
// dataData are categories of data dict[column#: [category id, preferred name]]
const solubilityData = {
    0: ["solvent1", "Solvent 1", ],
    1: ["solvent2", "Solvent 2", ],
    2: ["Solvent 3", "Solvent3"],
    3: ["solvFrac1", "Solv Frac 1 (solute-free)", ],
    4: ["solvFrac2", "Solv Frac 2 (solute-free)", ],
    5: ["solvFrac3", "Solv Frac 3 (solute-free)", ],
    6: ["t", "T", ],
    7: ["xrpd", "XRPD", ],
    8: ["solubility1", "Solubility*", ],
    9: ["solubility2", "", ],
    10: ["solubility3", "", ],
    11: ["solubility4", "", ],
    12: ["lotNum", "Solute Lot #", ],
    13: ["eln", "ELN/Sample # of Measurement", ],
    14: ["measurementMethod", "Measurement Method", ],
    15: ["comments", "Comments", ],
}
/*
 * colRules requires adjusting if form is changed
 * This defines the rules for including a row as data or not
 * 
 * List of rules:
 * - 'rq' for required column
 *      - e.g. ['rq', 5, 8, 9] means columns 5, 8, and 9 cannot be undefined
 * - 's' for string
 *      - e.g. ['s', 1, 2, 3] means columns 1, 2, and 3 must be a string
 * - 'n' for number
 *      - e.g. ['s', 2] means column 2 must be a number
 * - 'g' for greater than
 *      - e.g. ['g', 2, 10] means value in column 2 must be greater than 10
 * 
 * ADD MORE RULES AS NEEDED, ALSO ADJUST categorizeData() METHOD
 *      - AREA WITH RULES IS COMMENTED
 */
const colRules = [
    ['rq', 0, 1, 2], // either 0, 1, or 2 are required
    ['s', 0, 1, 2], // 0, 1, or 2 must be a string
    ['n', 3, 4, 5], // 3, 4, or 5 must be numbers
]
const fileInput = document.getElementById('fileInput');

/*
function filterFiles() {
    //console.log("[Upload data] clicked")
    var selectedFiles = [...fileInput.files];
    for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {type: 'binary'});
            for (let j = 0; j < workbook.SheetNames.length; j++) {
                if (inputSheetNames.has(workbook.SheetNames[j])) {
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[j]], {header: 1});
                    parseData(jsonData);
                }
            }
        };
        reader.readAsArrayBuffer(selectedFiles[i]);
    }
}
*/

// from chatgpt
function filterFiles() {
    var selectedFiles = [...fileInput.files];
    
    // Create an array of promises for each file read operation
    var fileReadPromises = selectedFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                var fileData = e.target.result;
                var workbook = XLSX.read(fileData, { type: 'binary' });
                for (let j = 0; j < workbook.SheetNames.length; j++) {
                    if (inputSheetNames.has(workbook.SheetNames[j])) {
                        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[j]], { header: 1 });
                        parseData(jsonData);
                    }
                }
                resolve(); // Resolve the promise once the file has been processed
            };
            reader.readAsArrayBuffer(file);
        });
    });

    // Use Promise.all to wait for all file read promises to resolve
    Promise.all(fileReadPromises)
        .then(() => {
            console.log("All files processed");
        })
        .catch(error => {
            console.error("Error processing files:", error);
        });
}

function parseData(jsonData) {
    //console.log("parseData()");
    var data = {}
    categorizeData(data, jsonData);
    displayData(data);
}

function categorizeData(data, jsonData) {
    //console.log("categorizeData()");
    // iterates through json rows
    var formDataFound = 0;
    for (let i = 0; i < jsonData.length; i++) {
        // look for form data, stops once all form fields are found
        if (jsonData[i][0]) {
            if (formDataFound < Object.keys(formData).length) {
                const JSON0String = JSON.stringify(jsonData[i][0]).slice(1, -1);
                const splitStrings = JSON0String.split(" ");
                // iterate through label options
                for (let j = 0; j < Object.keys(formData).length; j++) {
                    // iterate through substring options
                    for (let k = 0; k < splitStrings.length; k++) {
                        // if substring is a label, and data[label] is undefined
                        if ((formData[j][0] == splitStrings[k] || formData[j][0] == JSON0String) && !data[formData[j][1]]) {
                            data[formData[j][1]] = jsonData[i][1];
                            formDataFound++;
                            break;
                        }
                    }
                }
            } else {
                // look for solubility data, will start after form data is complete
                const rowJSONData = jsonData[i]
                var hasEssentialColumns = true;
                for (let j = 0; j < colRules.length; j++) {
                    const rule = colRules[j];
                    /*
                     * THIS IS WHERE REACTIONS TO COLUMN RULES ARE DEFINED
                     * CAN ADD [REQUIRED COLUMNS] ALSO
                     */
                    switch (rule[0]) {
                        case 'rq':
                            // columns must be required
                            var localBool = true;
                            for (let k = 1; k < rule.length; k++) {
                                if (rowJSONData[rule[k]]) {
                                    localBool = false;
                                }
                            }
                            // if localBool is true, then none of the columns are defined
                            if (localBool) {
                                hasEssentialColumns = false;
                            }
                            break;
                        case 's':
                            // must be a string
                            var localBool = true;
                            for (let k = 1; k < rule.length; k++) {
                                if (typeof(rowJSONData[rule[1]]) == "string") {
                                    localBool = false;
                                }
                            }
                            // if localBool is true, then all the columns aren't strings
                            if (localBool) {
                                hasEssentialColumns = false;
                            }
                            break;
                        case 'n':
                            // must be a number
                            var localBool = true;
                            for (let k = 1; k < rule.length; k++) {
                                if (typeof(rowJSONData[rule[1]]) == "number") {
                                    localBool = false;
                                }
                            }
                            // if localBool is true, then all the columns aren't numbers
                            if (localBool) {
                                hasEssentialColumns = false;
                            }
                            break;
                        case 'g':
                            // must be greater than
                            if (rowJSONData[rule[1]] <= rule[2]) {
                                hasEssentialColumns = false;
                            }
                            break;
                    }
                }
                if (hasEssentialColumns) {
                    // console.log(rowJSONData);
                    if (!("data" in data)) {
                        data["data"] = []
                    }
                    var newDataEntry = {}
                    for (let j = 0; j < Object.keys(solubilityData).length; j++) {
                        if (rowJSONData[j]) {
                            newDataEntry[solubilityData[j][0]] = rowJSONData[j];
                        }
                    }
                    data["data"].push(newDataEntry);
                }
            }
        }
    }
    // console.log(data);
}