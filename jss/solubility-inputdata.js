/**
 * This js file is made for solubility-inputdata.html
 */

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

}