function readFiles() {
    console.log("Upload data button clicked")
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = [...fileInput.files];
    console.log(selectedFiles.length + " files: " + selectedFiles)

/*
    for (file in selectedFiles) {
        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Assuming the sheet is a simple table with headers
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Now you can work with the jsonData array
                console.log(jsonData);
            };

            reader.readAsArrayBuffer(file);
        }
    }
*/
    for (index in selectedFiles) {
        console.log(selectedFiles[index])
        const reader = new FileReader();
        
    }
}