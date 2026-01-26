let isDragging = false, hasMoved = false;
let startX, startY, mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentLevel = null;
let currentLevelName = ""; // NUOVO: Serve per sapere in che livello siamo per la musica/checkmark

// --- SISTEMA AUDIO (NUOVO) ---
let currentAudio = null;

function playMusic(trackId) {
    // 1. Ferma la musica corrente se c'è
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    // 2. Trova e fai partire la nuova musica
    const newTrack = document.getElementById(trackId);
    if (newTrack) {
        currentAudio = newTrack;
        // Il play deve essere gestito con catch per evitare errori dei browser
        currentAudio.play().catch(e => console.log("Audio play bloccato finché l'utente non interagisce"));
  } else {
        console.error("Audio non trovato: " + trackId);
    }
}

// Questa funzione serve per sbloccare l'audio sui browser (Chrome/Safari) al primo click
function startLoginMusic() {
    if (!currentAudio || currentAudio.id !== 'bgm-login') {
        playMusic('bgm-login');
    }
}

// Avvia musica Login al primo click sulla pagina (per policy browser)
//window.addEventListener('click', () => {
//    if (!currentAudio) playMusic('bgm-login');
//}, { once: true });


const levelsData = {
    'mole': {
        image: 'mole_interno.png',
        musicId: 'bgm-mole', // NUOVO: ID audio associato
        targets: [
            { id: 'take_bite', name: 'Take a bite', top: 51.42, left: 42.42 },
            { id: 'cartolina', name: 'Cartolina', top: 68.94, left: 92.71 },
            { id: 'piuma', name: 'Piuma', top: 57.23, left: 26.70 },
            { id: 'bandiera', name: 'Bandiera', top: 23.70, left: 98.48 },
            { id: 'salvadanaio', name: 'Salvadanaio', top: 63.70, left: 50.44 },
            { id: 'aereoplanino', name: 'Aereoplanino', top: 17.03, left: 5.41 },
            { id: 'pop_corn', name: 'Pop corn', top: 41.10, left: 73.23 },
            { id: 'robot', name: 'Robot', top: 80.49, left: 68.66 },
            { id: 'cappello', name: 'Cappello', top: 7.23, left: 36.95 },
            { id: 'lucchetto', name: 'Lucchetto', top: 21.63, left: 69.77 },
            { id: 'treno', name: 'Treno', top: 12.47, left: 62.16 },
            { id: 'oscar', name: 'Oscar', top: 50.62, left: 2.50 },
            { id: 'binocolo', name: 'Binocolo', top: 25.84, left: 79.81 },
            { id: 'film', name: 'Film', top: 87.17, left: 92.77 }
        ]
    },
    'smashy': {
        image: 'smashy_interno.png',
        musicId: 'bgm-smashy', // NUOVO
        targets: [
            { id: 'toro', name: 'Toro', top: 27.04, left: 1.46 },
            { id: 'cartolina', name: 'Cartolina', top: 87.96, left: 96.56 },
            { id: 'torta', name: 'Torta', top: 27.00, left: 59.79 },
            { id: 'asso', name: 'Asso', top: 65.07, left: 1.15 },
            { id: 'moneta_oro', name: "Moneta d'oro", top: 76.87, left: 17.24 },
            { id: 'paperella', name: 'Paperella', top: 88.12, left: 14.38 },
            { id: 'bicerin', name: 'Bicerin', top: 59.36, left: 90.78 },
            { id: 'mascotte_smashy', name: 'Mascotte Smashy', top: 7.74, left: 78.07 },
            { id: 'conchiglia', name: 'Conchiglia', top: 8.85, left: 60.95 },
            { id: 'portachiavi', name: 'Portachiavi', top: 18.36, left: 36.72 },
            { id: 'smashy', name: 'Smashy', top: 45.29, left: 53.85 },
            { id: 'piuma', name: 'Piuma', top: 43.32, left: 80.52 }
        ]
    },
    'egizio': {
        image: 'egizio_interno.png',
        musicId: 'bgm-egizio', // NUOVO
        targets: [
            { id: 'ciondolo', name: 'Ciondolo', top: 87.96, left: 1.33 },
            { id: 'sfinge', name: 'Sfinge', top: 84.85, left: 9.35 },
            { id: 'cofanetto', name: 'Cofanetto', top: 24.68, left: 6.78 },
            { id: 'obelisco', name: 'Obelisco', top: 47.65, left: 18.73 },
            { id: 'piuma', name: 'Piuma', top: 66.65, left: 34.37 },
            { id: 'stela_d_antonino', name: 'Stela di Antonino', top: 76.63, left: 46.33 },
            { id: 'moneta_argento', name: "Moneta d'Argento", top: 58.90, left: 77.87 },
            { id: 'moneta_oro', name: "Moneta d'Oro", top: 88.91, left: 46.80 },
            { id: 'bussola', name: 'Bussola', top: 40.43, left: 62.02 },
            { id: 'chiave', name: 'Chiave', top: 71.19, left: 99.44 },
            { id: 'scarabeo', name: 'Scarabeo', top: 97.65, left: 60.74 },
            { id: 'cartolina', name: 'Cartolina', top: 29.84, left: 99.64 },
            { id: 'lente', name: 'Lente', top: 36.26, left: 92.40 },
            { id: 'papiro', name: 'Papiro', top: 30.78, left: 31.39 },
            { id: 'pergamena', name: 'Pergamena', top: 18.75, left: 94.83 },
            { id: 'statua_1', name: 'Statua 1', top: 16.57, left: 15.69 },
            { id: 'statua_2', name: 'Statua 2', top: 4.10, left: 63.03 },
            { id: 'libro', name: 'Libro', top: 5.08, left: 49.06 }
        ]
    }
};

// CUORI ANIMATI
setInterval(createHeart, 300);
function createHeart() {
    const container = document.getElementById('hearts-container');
    if (!container || document.getElementById('login-screen').classList.contains('hidden')) return;
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
    heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
    container.appendChild(heart);
    setTimeout(() => { heart.remove(); }, 5000);
}

function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        
        playMusic('bgm-map'); // NUOVO: Parte musica mappa
        
        setTimeout(() => initCamera(true), 100);
    } else { 
        alert("DAVVERO?? 😡😡😡"); 
    }
}

function initCamera(resetZoom = false) {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;
    let minScale = Math.max(screenW / contW, screenH / contH);
    if (resetZoom) {
        scale = minScale;
        mapX = (screenW - contW * scale) / 2;
        mapY = (screenH - contH * scale) / 2;
    }
    applyTransform();
}

function applyTransform() {
    if (!activeContainer) return;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth, contH = activeContainer.offsetHeight;
    let minScale = Math.max(screenW / contW, screenH / contH);
    scale = Math.min(Math.max(scale, minScale), 5);
    
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;
    
    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// ZOOM & DRAG
window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();
    const oldScale = scale;
    let newScale = e.deltaY < 0 ? scale * 1.15 : scale / 1.15;
    const screenW = window.innerWidth, screenH = window.innerHeight;
    let minScale = Math.max(screenW / activeContainer.offsetWidth, screenH / activeContainer.offsetHeight);
    newScale = Math.min(Math.max(newScale, minScale), 5);
    const mouseX = e.clientX, mouseY = e.clientY;
    const ratio = newScale / oldScale;
    mapX = mouseX - (mouseX - mapX) * ratio;
    mapY = mouseY - (mouseY - mapY) * ratio;
    scale = newScale;
    applyTransform();
}, { passive: false });

window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    if(e.target.tagName === 'IMG') e.preventDefault(); 
    isDragging = true; 
    hasMoved = false;
    startX = e.clientX - mapX; 
    startY = e.clientY - mapY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    if (Math.abs(e.clientX - (startX + mapX)) > 5 || Math.abs(e.clientY - (startY + mapY)) > 5) {
        hasMoved = true;
    }
    mapX = e.clientX - startX; 
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => { isDragging = false; });

// GIOCO
function openLevel(placeName) {
    currentLevelName = placeName; // Memorizza il nome per la checkmark
    currentLevel = levelsData[placeName];
    const levelImg = document.getElementById('level-image');
    levelImg.src = currentLevel.image;
    
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    document.getElementById('win-back-btn').classList.add('hidden');
    
    playMusic(currentLevel.musicId); // NUOVO: Parte musica livello
    
    activeContainer = document.getElementById('level-drag-container');
    const interactiveObjects = document.getElementById('interactive-objects');
    interactiveObjects.innerHTML = ''; 
    
    levelImg.onload = () => {
        initCamera(true);
        renderTray();
        currentLevel.targets.forEach(t => { if (t.found) drawMarker(t); });
        
        // Controllo vittoria immediato se rientri
        checkVictory(); 
    };
}

function renderTray() {
    const tray = document.getElementById('objects-to-find');
    tray.innerHTML = '';
    currentLevel.targets.forEach(t => {
        const div = document.createElement('div');
        div.className = `target-item ${t.found ? 'found' : ''}`;
        div.id = `tray-${t.id}`;
        div.innerHTML = `<img src="assets/${t.id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${t.name}</span>`;
        tray.appendChild(div);
    });
}

document.getElementById('level-image').addEventListener('click', function(e) {
    if (hasMoved) return;

    const rect = this.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;
    const xPct = (clickX / this.offsetWidth) * 100;
    const yPct = (clickY / this.offsetHeight) * 100;

    // COPIA COORDINATE NEGLI APPUNTI
    // const coords = `top: '${yPct.toFixed(2)}%', left: '${xPct.toFixed(2)}%'`;
    // navigator.clipboard.writeText(coords);

    currentLevel.targets.forEach(t => {
        if (!t.found) {
            const dist = Math.sqrt(Math.pow(xPct - t.left, 2) + Math.pow(yPct - t.top, 2));
            if (dist < 3.5) { 
                t.found = true;
                markAsFound(t);
            }
        }
    });
});

function markAsFound(target) {
    drawMarker(target);
    const trayItem = document.getElementById(`tray-${target.id}`);
    if (trayItem) trayItem.classList.add('found');
    
    checkVictory(); // Controlla se hai vinto
}

function checkVictory() {
    const remaining = currentLevel.targets.filter(t => !t.found).length;
    if (remaining === 0) {
        document.getElementById('win-back-btn').classList.remove('hidden');
        
        // NUOVO: Mostra la checkmark sulla mappa principale
        const checkId = 'check-' + currentLevelName;
        const checkElement = document.getElementById(checkId);
        if(checkElement) checkElement.classList.remove('hidden');
    }
}

function drawMarker(target) {
    const marker = document.createElement('div');
    marker.className = 'found-marker';
    marker.style.left = target.left + "%";
    marker.style.top = target.top + "%";
    document.getElementById('interactive-objects').appendChild(marker);
}

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    
    playMusic('bgm-map'); // NUOVO: Ritorna musica mappa
    
    initCamera(true);
}
