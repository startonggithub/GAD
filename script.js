// Open or create IndexedDB
let db;
const request = indexedDB.open("FileDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
    }
};

(async function() {
    const estimate = await navigator.storage.estimate();
    console.log(estimate)
})()

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully");
};

request.onerror = (event) => {
    console.error("Database error:", event.target.error);
};

// Login User
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    //document.getElementById("status").innerText = `Logged in as ${userCredential.user.email}`;
    document.getElementById("status").innerText = `Logged in as ${email}`;
    sessionStorage.setItem("currentUser", email);  // Store session
    //loadUserData(userCredential.user.uid);
/*
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            document.getElementById("status").innerText = `Logged in as ${userCredential.user.email}`;
            loadUserData(userCredential.user.uid);
        })
        .catch(error => alert(error.message));
*/
}

// Logout User
function logout() {
    /*
    auth.signOut().then(() => {
        document.getElementById("status").innerText = "Logged out!";
        clearUsersTable();  // Only clear "users" table
    });
    */
    document.getElementById("status").innerText = "Logged out!";
    sessionStorage.removeItem("currentUser");
}

// Save file to IndexedDB
function saveFile() {
    if (!sessionStorage.getItem("currentUser"))
    {
        alert("Please login!");
        return;        
    }
    /*const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const fileData = {
            name: file.name,
            type: file.type,
            data: event.target.result
        };

        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");
        const request = store.add(fileData);

        request.onsuccess = () => {
            alert("File saved successfully!");
        };

        request.onerror = (error) => {
            console.error("Error saving file:", error);
        };
    };

    reader.readAsArrayBuffer(file);
    */
    const dataURL = signaturePad.toDataURL();
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    const request = store.add({ data: dataURL });

    request.onsuccess = () => {
        alert("Signature saved!");
        signaturePad.clear();
        loadFiles();
    };

    request.onerror = (error) => {
        console.error("Error saving signature:", error);
    };
}

// Load files from IndexedDB
function loadFiles() {
    if (!sessionStorage.getItem("currentUser"))
        {
        alert("Please login!");
        return;        
    }

    const transaction = db.transaction(["files"], "readonly");
    const store = transaction.objectStore("files");
    const request = store.getAll();

    request.onsuccess = (event) => {
        const files = event.target.result;
        const fileList = document.getElementById("fileList");
        fileList.innerHTML = "";

        files.forEach(file => {
            const li = document.createElement("li");
            const img = document.createElement("img");
            img.src = file.data;
            img.width = 100;
            img.height = 75;
            
            const downloadBtn = document.createElement("button");
            downloadBtn.textContent = "Download";
            downloadBtn.onclick = () => downloadFile(file.data);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteFile(file.id);

            li.appendChild(img);
            li.appendChild(downloadBtn);
            li.appendChild(deleteBtn);
            fileList.appendChild(li);
        });
    };
}

// Download file from IndexedDB
function downloadFile(file) {
    /*
    const blob = new Blob([file.data], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    */
    const a = document.createElement("a");
    a.href = file;
    a.download = "canvas-drawing.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Delete file from IndexedDB
function deleteFile(id) {
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");
    const request = store.delete(id);

    request.onsuccess = () => {
        alert("File deleted successfully!");
        loadFiles(); // Refresh file list
    };

    request.onerror = (error) => {
        console.error("Error deleting file:", error);
    };
}