let isDragging = false;
let startX, startY;
let mapX = 0;
let mapY = 0;
let scale = 1; // Valore iniziale dello zoom
let activeContainer = null;

const levelsData = {
    'mole': { image: 'mole_interno.png', targets: [{ id: 'chiave', name: 'Chiave', top: '45%', left: '30%' }] },
    'cappuccini': { image: 'cappuccini_interno.png', targets: [] },
    'egizio': { image: 'egizio_interno.png', targets: [] },
    'smashy': { image: 'smashy_interno.png', targets: [] }
};

// --- 1. LOGIN ---
function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        
        // Aspetta un attimo che l'immagine sia renderizzata per calcolare i limiti
        setTimeout(() => {
            initCamera();
        }, 100);
    } else { 
        alert("Data errata!"); 
    }
}

// --- 2. SISTEMA CAMERA (ZOOM + PAN + LIMITI) ---

function initCamera() {
    if (!activeContainer) return;
    
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth;
    const contH = activeContainer.offsetHeight;

    // Calcola lo zoom minimo per coprire tutto lo schermo senza bordi neri
    let minScale = Math.max(screenW / contW, screenH / contH);
    scale = minScale; 
    
    // Centra l'immagine all'inizio
    mapX = (screenW - contW * scale) / 2;
    mapY = (screenH - contH * scale) / 2;

    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth;
    const contH = activeContainer.offsetHeight;

    // 1. Applica limiti allo ZOOM (minimo per non vedere il nero)
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (scale < minScale) scale = minScale;
    if (scale > 4) scale = 4; // Zoom massimo 4x

    // 2. Applica limiti al MOVIMENTO (non uscire dai bordi dell'immagine)
    // Limite Destro/Sinistro
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;

    // Limite Alto/Basso
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// Gestione Zoom con Rotellina
window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    
    const zoomSpeed = 0.05;
    if (e.deltaY < 0) {
        scale += zoomSpeed;
    } else {
        scale -= zoomSpeed;
    }
    
    applyTransform();
}, { passive: false });

// Gestione Drag (Trascinamento)
function handleMouseDown(e) {
    if (!activeContainer) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
    activeContainer.parentElement.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isDragging || !activeContainer) return;
    
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;

    applyTransform();
}

function handleMouseUp() {
    isDragging = false;
    if(activeContainer) activeContainer.parentElement.style.cursor = 'grab';
}

// Event Listeners
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);
document.getElementById('map-screen').addEventListener('mousedown', handleMouseDown);
document.getElementById('level-screen').addEventListener('mousedown', handleMouseDown);
window.addEventListener('resize', applyTransform); // Ricalcola se ruoti il telefono o ridimensioni il PC

// --- 3. LOGICA LIVELLI ---

function openLevel(placeName) {
    const data = levelsData[placeName];
    if (!data) return alert("Livello non pronto!");

    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    
    // Cambia il contenitore attivo e resetta la camera per il nuovo livello
    activeContainer = document.getElementById('level-drag-container');
    
    setTimeout(() => {
        initCamera();
        setupObjects(data.targets);
    }, 100);
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    const area = document.getElementById('interactive-objects');
    tray.innerHTML = ''; 
    area.innerHTML = '';

    targets.forEach(obj => {
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${obj.id}`;
        slot.innerText = obj.name;
        tray.appendChild(slot);

        const target = document.createElement('div');
        target.className = 'hotspot';
        target.style.top = obj.top; 
        target.style.left = obj.left;
        target.style.width = '100px'; 
        target.style.height = '100px';
        target.onclick = (e) => {
            e.stopPropagation();
            document.getElementById(`tray-${obj.id}`).classList.add('found');
            alert("Trovato: " + obj.name);
        };
        area.appendChild(target);
    });
}

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(); // Ritorna alla visuale ottimale della mappa principale
}
