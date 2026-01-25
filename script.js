let isDragging = false;
let hasMoved = false; // Capisce se stai trascinando o cliccando
let startX, startY;
let mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentObjectToPlace = null;

const levelsData = {
    'egizio': { image: 'egizio_interno.png', targets: ["Ciondolo", "Sfinge", "Cofanetto", "Obelisco", "Piuma", "Stela di Antonino", "Moneta d'Argento", "Moneta d'Oro", "Bussola", "Chiave", "Scarabeo", "Cartolina", "Lente", "Papiro", "Pergamena", "Statua 1", "Statua 2", "Libro"] },
    'smashy': { image: 'smashy_interno.png', targets: ["Piuma", "Toro", "Cartolina", "Torta", "Asso", "Moneta d'oro", "Paperella", "Bicerin", "Mascotte Smashy", "Conchiglia", "Portachiavi", "Smashy"] },
    'mole': { image: 'mole_interno.png', targets: ["Take a bite", "Cartolina", "Piuma", "Bandiera", "Salvadanaio", "Aereoplanino", "Binocolo", "Pop corn", "Robot", "Cappello", "Lucchetto", "Treno", "Oscar"] }
};

// --- ANIMAZIONE CUORI ---
function createHearts() {
    const container = document.getElementById('login-screen');
    setInterval(() => {
        if (document.getElementById('login-screen').classList.contains('hidden')) return;
        const heart = document.createElement('div');
        heart.className = 'heart'; heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = Math.random() * 40 + 20 + 'px';
        heart.style.animationDuration = Math.random() * 3 + 4 + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 7000);
    }, 400);
}
createHearts();

function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        setTimeout(() => initCamera(true), 100);
    } else { alert("Data errata!"); }
}

// --- SISTEMA CAMERA ---
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
    
    // Limiti bordi
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;

    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

window.addEventListener('wheel', (e) => {
    if (!activeContainer) return;
    e.preventDefault();
    const zoomSpeed = 0.12;
    const oldScale = scale;
    let newScale = e.deltaY < 0 ? scale * (1 + zoomSpeed) : scale / (1 + zoomSpeed);
    
    const screenW = window.innerWidth, screenH = window.innerHeight;
    let minScale = Math.max(screenW / activeContainer.offsetWidth, screenH / activeContainer.offsetHeight);
    newScale = Math.min(Math.max(newScale, minScale), 5);

    if (newScale !== oldScale) {
        const mouseX = e.clientX, mouseY = e.clientY;
        const ratio = newScale / oldScale;
        mapX = mouseX - (mouseX - mapX) * ratio;
        mapY = mouseY - (mouseY - mapY) * ratio;
        scale = newScale;
        applyTransform();
    }
}, { passive: false });

// --- DRAG VS CLICK LOGIC ---
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    isDragging = true;
    hasMoved = false; // Reset movimento ad ogni click
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeContainer) return;
    
    // Se il mouse si muove più di 5 pixel, consideralo trascinamento
    if (Math.abs(e.clientX - (startX + mapX)) > 5 || Math.abs(e.clientY - (startY + mapY)) > 5) {
        hasMoved = true;
    }
    
    mapX = e.clientX - startX;
    mapY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    setTimeout(() => { isDragging = false; }, 20);
});

// --- GESTIONE LIVELLI ---
function openLevel(placeName) {
    const data = levelsData[placeName];
    const levelImg = document.getElementById('level-image');
    levelImg.src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    activeContainer = document.getElementById('level-drag-container');
    
    levelImg.onload = () => {
        initCamera(true);
        setupObjects(data.targets);
        setupDebug(data.targets);
    };
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    tray.innerHTML = '';
    targets.forEach(name => {
        const id = name.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.innerHTML = `<img src="assets/${id}.png" onerror="this.src='https://via.placeholder.com/50?text=?'"><span>${name}</span>`;
        tray.appendChild(slot);
    });
}

// --- DEBUG PANEL CON SELEZIONE SINGOLA ---
function setupDebug(targets) {
    let panel = document.getElementById('debug-panel') || document.createElement('div');
    panel.id = 'debug-panel';
    document.body.appendChild(panel);
    panel.innerHTML = '<b>MAP DEBUG</b><br><small>1. Seleziona oggetto<br>2. Clicca sulla mappa</small><hr>';
    
    targets.forEach(name => {
        const dObj = document.createElement('div');
        dObj.className = 'debug-item';
        dObj.innerText = "• " + name;
        dObj.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.debug-item').forEach(el => el.style.color = 'white');
            dObj.style.color = '#0f0';
            currentObjectToPlace = name; // Attiva il piazzamento
        };
        panel.appendChild(dObj);
    });
}

// SALVATAGGIO POSIZIONE SUL CLICK (SOLO SE NON TRASCINI)
document.getElementById('level-image').addEventListener('click', function(e) {
    // Se non hai selezionato nulla o se stavi trascinando la mappa, non salvare
    if (!currentObjectToPlace || hasMoved) return;

    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const topPct = ((y / this.offsetHeight) * 100).toFixed(2);
    const leftPct = ((x / this.offsetWidth) * 100).toFixed(2);

    console.log(`{ id: '${currentObjectToPlace.toLowerCase().replace(/ /g, '_')}', name: '${currentObjectToPlace}', top: '${topPct}%', left: '${leftPct}%' },`);
    
    // Mostra marker temporaneo
    const marker = document.createElement('div');
    marker.className = 'hotspot-debug';
    marker.style.top = topPct + "%"; marker.style.left = leftPct + "%";
    marker.style.width = "40px"; marker.style.height = "40px";
    marker.style.transform = "translate(-50%, -50%)";
    document.getElementById('interactive-objects').appendChild(marker);
    
    alert(`POSIZIONE SALVATA PER: ${currentObjectToPlace}\nControlla la console (F12)!`);

    // RESET: Disattiva il piazzamento finché non clicchi un altro oggetto dalla lista
    currentObjectToPlace = null;
    document.querySelectorAll('.debug-item').forEach(el => el.style.color = 'white');
});

function closeLevel() {
    document.getElementById('level-screen').classList.add('hidden');
    document.getElementById('map-screen').classList.remove('hidden');
    activeContainer = document.querySelector('#map-screen .map-container');
    initCamera(true);
}
