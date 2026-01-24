let isDragging = false;
let startX, startY;
let mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentObjectToPlace = null; // Per il Debug

const levelsData = {
    'egizio': {
        image: 'egizio_interno.png',
        targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"]
    },
    'smashy': {
        image: 'smashy_interno.png',
        targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"]
    },
    'mole': {
        image: 'mole_interno.png',
        targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"]
    }
};

// --- CUORI ANIMATI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        container.appendChild(heart);
    }
}
createHearts();

// --- LOGIN ---
function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        setTimeout(initCamera, 100);
    } else { alert("Data errata!"); }
}

// --- CAMERA & DRAG (FIXATO) ---
function initCamera() {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;
    scale = Math.max(screenW / contW, screenH / contH);
    mapX = (screenW - contW * scale) / 2;
    mapY = (screenH - contH * scale) / 2;
    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;

    scale = Math.max(scale, Math.max(screenW / contW, screenH / contH));
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// FIX: Usiamo window per il mouseup così se rilasci fuori dall'immagine si ferma
window.addEventListener('mouseup', () => { 
    isDragging = false; 
    document.body.style.cursor = 'default';
});

function handleMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

document.getElementById('map-screen').addEventListener('mousedown', handleMouseDown);
document.getElementById('level-screen').addEventListener('mousedown', handleMouseDown);

// --- LOGICA LIVELLI & DEBUG ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    setTimeout(() => {
        initCamera();
        setupObjects(data.targets);
        setupDebug(data.targets);
    }, 100);
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    tray.innerHTML = '';
    targets.forEach(name => {
        const id = name.toLowerCase().replace(/ /g, '_');
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${id}`;
        // Qui caricherà l'immagine con lo stesso nome dell'oggetto
        slot.innerHTML = `<img src="assets/${id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${name}</span>`;
        tray.appendChild(slot);
    });
}

// --- STRUMENTO DI DEBUG PER COLLIDER ---
function setupDebug(targets) {
    let panel = document.getElementById('debug-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'debug-panel';
        document.body.appendChild(panel);
    }
    panel.innerHTML = '<h3>Debug: Clicca un nome e poi sulla mappa</h3>';
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.className = 'debug-obj';
        dObj.innerText = name;
        dObj.onclick = () => {
            document.querySelectorAll('.debug-obj').forEach(el => el.classList.remove('active'));
            dObj.classList.add('active');
            currentObjectToPlace = name;
        };
        panel.appendChild(dObj);
    });
}

// Cliccando sulla mappa del livello mentre un oggetto è selezionato nel debug
document.getElementById('level-image').onclick = function(e) {
    if (!currentObjectToPlace) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    console.log(`Oggetto: ${currentObjectToPlace} -> top: ${topPct}%, left: ${leftPct}%`);
    alert(`Salvato ${currentObjectToPlace}!\nControlla la console (F12) per il codice.`);
    
    // Crea un collider visibile temporaneo
    const temp = document.createElement('div');
    temp.className = 'hotspot';
    temp.style.top = topPct + "%";
    temp.style.left = leftPct + "%";
    temp.style.width = "40px"; temp.style.height = "40px";
    document.getElementById('interactive-objects').appendChild(temp);
};

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera();
}
