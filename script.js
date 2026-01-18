// --- CONFIGURAZIONE E STATO ---
let isDragging = false;
let startX, startY;
let mapX = 0;
let mapY = 0;
let activeContainer = null; // Memorizza se stiamo muovendo la mappa o un livello

// Database dei livelli e degli oggetti da trovare
const levelsData = {
    'mole': {
        image: 'mole_interno.png', 
        targets: [
            { id: 'chiave', name: 'Chiave', top: '45%', left: '30%' },
            { id: 'gatto', name: 'Gatto Nero', top: '70%', left: '80%' }
        ]
    },
    'cappuccini': {
        image: 'cappuccini_interno.png',
        targets: [
            { id: 'binocolo', name: 'Binocolo', top: '20%', left: '50%' }
        ]
    },
    'egizio': {
        image: 'egizio_interno.png',
        targets: [
            { id: 'scarabeo', name: 'Scarabeo', top: '60%', left: '40%' }
        ]
    },
    'smashy': {
        image: 'smashy_interno.png',
        targets: [
            { id: 'panino', name: 'Smashy Burger', top: '75%', left: '45%' }
        ]
    }
};

// --- 1. LOGICA DI LOGIN ---

function checkCode() {
    const day = document.getElementById('slot-day').value;
    const month = document.getElementById('slot-month').value;
    const year = document.getElementById('slot-year').value;

    // Codice corretto: 12 / 08 / 2024
    if (day === "12" && month === "08" && year === "2024") {
        startGame();
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
        shakeScreen();
    }
}

function shakeScreen() {
    const login = document.getElementById('login-screen');
    login.style.transform = "translateX(10px)";
    setTimeout(() => login.style.transform = "translateX(-10px)", 100);
    setTimeout(() => login.style.transform = "translateX(0)", 200);
}

function startGame() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    // Imposta il contenitore attivo per il drag
    activeContainer = document.querySelector('#map-screen .map-container');
    resetMapPosition();
}

// --- 2. SISTEMA DI MOVIMENTO (DRAG & BOUNDS) ---

function handleMouseDown(e) {
    if (!activeContainer) return;
    isDragging = true;
    // Calcoliamo la posizione iniziale del mouse rispetto alla posizione attuale della mappa
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
    activeContainer.parentElement.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isDragging || !activeContainer) return;

    let newX = e.clientX - startX;
    let newY = e.clientY - startY;

    // Calcolo dei limiti (Bounds) per non uscire dall'immagine
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const containerW = activeContainer.offsetWidth;
    const containerH = activeContainer.offsetHeight;

    // Limiti orizzontali
    if (newX > 0) newX = 0;
    if (newX < screenW - containerW) newX = screenW - containerW;

    // Limiti verticali
    if (newY > 0) newY = 0;
    if (newY < screenH - containerH) newY = screenH - containerH;

    mapX = newX;
    mapY = newY;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px)`;
}

function handleMouseUp() {
    isDragging = false;
    if (activeContainer) {
        activeContainer.parentElement.style.cursor = 'grab';
    }
}

// Event Listeners per il drag (Mappa principale)
const mapScreen = document.getElementById('map-screen');
mapScreen.addEventListener('mousedown', handleMouseDown);

// Event Listeners per il drag (Livello specifico)
const levelScreen = document.getElementById('level-screen');
levelScreen.addEventListener('mousedown', handleMouseDown);

// Eventi globali per fluidità
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

function resetMapPosition() {
    mapX = 0;
    mapY = 0;
    if (activeContainer) {
        activeContainer.style.transform = `translate(0px, 0px)`;
    }
}

// --- 3. LOGICA DEI LIVELLI E OGGETTI ---

function openLevel(placeName) {
    const data = levelsData[placeName];
    if (!data) return alert("Livello in costruzione!");

    // Cambia immagine del livello
    const levelImg = document.getElementById('level-image');
    levelImg.src = data.image;

    // Mostra schermata livello e cambia contenitore attivo per il drag
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    
    activeContainer = document.getElementById('level-drag-container');
    resetMapPosition();

    // Genera oggetti da trovare
    setupObjects(data.targets);
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    const interactiveArea = document.getElementById('interactive-objects');
    
    tray.innerHTML = ''; // Pulisce la barra in basso
    interactiveArea.innerHTML = ''; // Pulisce la mappa

    targets.forEach(obj => {
        // Crea icona nella barra degli obiettivi
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${obj.id}`;
        slot.innerHTML = `<span>${obj.name}</span>`;
        tray.appendChild(slot);

        // Crea zona cliccabile sulla mappa del livello
        const hiddenObj = document.createElement('div');
        hiddenObj.className = 'hotspot'; 
        hiddenObj.style.top = obj.top;
        hiddenObj.style.left = obj.left;
        hiddenObj.style.width = '60px'; // Dimensione area cliccabile oggetto
        hiddenObj.style.height = '60px';
        
        hiddenObj.onclick = (e) => {
            e.stopPropagation(); // Evita che il click attivi il drag
            findObject(obj.id);
        };
        interactiveArea.appendChild(hiddenObj);
    });
}

function findObject(id) {
    const trayItem = document.getElementById(`tray-${id}`);
    if (trayItem && !trayItem.classList.contains('found')) {
        trayItem.classList.add('found');
        alert("Trovato!");
    }
}

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    
    // Torna a gestire il drag della mappa principale
    activeContainer = document.querySelector('#map-screen .map-container');
    resetMapPosition();
}
