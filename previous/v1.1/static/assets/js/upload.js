let selectedFiles = [];

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const fileInput = event.target;
    const files = fileInput.files;

    // Update the selected files array
    selectedFiles = Array.from(files);

    // Display the uploaded file names
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    uploadedFilesContainer.innerHTML = ""; // Clear previous entries

    for (let i = 0; i < selectedFiles.length; i++) {
        const fileName = selectedFiles[i].name;

        // Create list item with delete button
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.innerHTML = `
            ${fileName}
            <!--SVG from bootstrap of a trash can-->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-trash3-fill" viewBox="0 0 16 16" onclick="deleteFile(${i})">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
            </svg>
        `;

        // Append the list item to the container
        uploadedFilesContainer.appendChild(listItem);
    }
}

function deleteFile(index) {
    //Work around since file list is read only
    const dt = new DataTransfer();
    const fileInput = document.getElementById('fileInput');
    const { files } = fileInput;

    for (let i = 0; i < files.length; i++) {
        if (index !== i) {
            dt.items.add(files[i]);
        }
    }

    fileInput.files = dt.files;

    // Update the displayed file list
    handleFileSelect({ target: fileInput });
}