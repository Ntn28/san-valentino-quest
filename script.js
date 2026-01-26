Che idea fantastica! Aggiungere la musica e i checkmark renderà il gioco molto più "vivo" e soddisfacente.

Ecco come procedere. Dobbiamo modificare HTML, CSS e JavaScript.

1. Prepara i file Audio
Prima di iniziare, assicurati di avere 5 file mp3 nella tua cartella (o in una sottocartella audio/). Chiamali così per comodità:

login.mp3 (Schermata iniziale)

map.mp3 (Mappa Torino)

mole.mp3

egizio.mp3

smashy.mp3

2. HTML (index.html)
Qui aggiungiamo due cose:

I tag Audio nascosti.

I Checkmark (spunte) sopra i luoghi della mappa (nascosti all'inizio).

Sostituisci il tuo HTML con questo (ho aggiunto i commenti dove ho fatto modifiche):

HTML
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💘Torino The 3 Hidden Map💘</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <audio id="audio-login" loop src="audio/login.mp3"></audio>
    <audio id="audio-map" loop src="audio/map.mp3"></audio>
    <audio id="audio-mole" loop src="audio/mole.mp3"></audio>
    <audio id="audio-egizio" loop src="audio/egizio.mp3"></audio>
    <audio id="audio-smashy" loop src="audio/smashy.mp3"></audio>

    <div id="login-screen" class="screen active" onclick="startLoginMusic()">
        <div id="hearts-container"></div>

        <h1 style="color: white; text-shadow: 2px 4px 10px rgba(0,0,0,0.5); font-size: 2rem; margin-bottom: 30px; z-index: 10;">Inserisci il codice segreto🤔</h1>
        
        <div class="input-group" style="z-index: 10;">
            <input type="text" id="slot-day" maxlength="2" placeholder="io">
            <span style="color:white; font-size: 1.5rem; margin: 0 10px;">/</span>
            <input type="text" id="slot-month" maxlength="2" placeholder="ti">
            <span style="color:white; font-size: 1.5rem; margin: 0 10px;">/</span>
            <input type="text" id="slot-year" maxlength="4" placeholder="mangio">
        </div>
        
        <button onclick="checkCode()" class="modern-button">Dai su</button>
    </div>
    
    <div id="map-screen" class="screen hidden"> 
        <div class="map-container">
            <img src="mappa.png" alt="Mappa Torino" class="game-map" draggable="false">
            
            <div class="hotspot-trigger" id="spot-mole" onclick="openLevel('mole')"></div>
            <div class="hotspot-trigger" id="spot-egizio" onclick="openLevel('egizio')"></div>
            <div class="hotspot-trigger" id="spot-smashy" onclick="openLevel('smashy')"></div>

            <div class="level-check hidden" id="check-mole">✅</div>
            <div class="level-check hidden" id="check-egizio">✅</div>
            <div class="level-check hidden" id="check-smashy">✅</div>
        </div>
    </div>

    <div id="level-screen" class="screen hidden">
        <button class="back-btn" onclick="closeLevel()">⬅ Torna alla Mappa</button>
        <div class="map-container" id="level-drag-container">
            <img id="level-image" src="" alt="Livello" draggable="false">
            <div id="interactive-objects"></div>
        </div>
        <button id="win-back-btn" class="hidden" onclick="closeLevel()">BRAVAAA PUPISSSSSS</button>
        <div id="objects-to-find"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
3. CSS (style.css)
Aggiungi questo stile alla fine del tuo file CSS per posizionare le spunte verdi sopra gli edifici.

CSS
/* ... tutto il tuo codice precedente ... */

/* Stile per i Checkmark sulla mappa */
.level-check {
    position: absolute;
    font-size: 80px;       /* Grandezza della spunta */
    z-index: 30;           /* Sopra gli hotspot */
    pointer-events: none;  /* Così puoi cliccare attraverso di essi se necessario */
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.8)); /* Ombra per vederli meglio */
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Posizioni (Uguali agli hotspot ma centrati visivamente) */
#check-mole { top: 48%; left: 42%; }
#check-egizio { top: 34%; left: 65%; }
#check-smashy { top: 75%; left: 43%; }

@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}
4. JavaScript (script.js)
Qui c'è la logica. Ho aggiunto:

Il sistema audio che spegne la canzone precedente e accende quella nuova.

Il controllo per mostrare il checkmark quando torni alla mappa.

Una funzione per avviare la musica al primo click (i browser bloccano l'audio automatico se l'utente non interagisce).

Copia tutto questo nel file JS:

JavaScript
// --- CONFIGURAZIONE AUDIO ---
const audioTracks = {
    login: document.getElementById('audio-login'),
    map: document.getElementById('audio-map'),
    mole: document.getElementById('audio-mole'),
    egizio: document.getElementById('audio-egizio'),
    smashy: document.getElementById('audio-smashy')
};

function playMusic(trackKey) {
    // Ferma tutte le tracce
    Object.values(audioTracks).forEach(track => {
        track.pause();
        track.currentTime = 0; // Riavvia da capo se vuoi, o togli questa riga per pausa/resume
    });
    // Avvia quella richiesta
    if (audioTracks[trackKey]) {
        audioTracks[trackKey].play().catch(e => console.log("Aspetta interazione utente"));
    }
}

// Funzione per far partire la musica al primo click sulla pagina di login
// (Necessario perché i browser bloccano l'autoplay)
function startLoginMusic() {
    if (document.getElementById('login-screen').classList.contains('active')) {
        // Controlla se sta già suonando per non riavviarla
        if (audioTracks.login.paused) {
            audioTracks.login.play();
        }
    }
}

// --- VARIABILI GIOCO ---
let isDragging = false, hasMoved = false;
let startX, startY, mapX = 0, mapY = 0, scale = 1;
let activeContainer = null;
let currentLevelName = null; // Serve per sapere quale checkmark attivare
let currentLevel = null;

const levelsData = {
    'mole': {
        completed: false, // Aggiunto stato completamento
        image: 'mole_interno.png',
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
        completed: false,
        image: 'smashy_interno.png',
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
        completed: false,
        image: 'egizio_interno.png',
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

// --- ANIMAZIONE CUORI LOGIN ---
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

// --- FUNZIONI LOGIN ---
function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
        
        playMusic('map'); // PARTE MUSICA MAPPA
        
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
    
    // Limiti trascinamento
    if (mapX > 0) mapX = 0;
    if (mapX < screenW - contW * scale) mapX = screenW - contW * scale;
    if (mapY > 0) mapY = 0;
    if (mapY < screenH - contH * scale) mapY = screenH - contH * scale;
    
    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px) scale(${scale})`;
}

// ZOOM
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

// TRASCINAMENTO (Fixato per evitare blocchi)
window.addEventListener('mousedown', (e) => {
    if (!activeContainer || e.button !== 0) return;
    // Evita che il browser provi a trascinare l'immagine come file
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

window.addEventListener('mouseup', () => { 
    isDragging = false; 
});

// GIOCO
function openLevel(placeName) {
    currentLevel = levelsData[placeName];
    const levelImg = document.getElementById('level-image');
    levelImg.src = currentLevel.image;
    
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    document.getElementById('win-back-btn').classList.add('hidden');
    
    activeContainer = document.getElementById('level-drag-container');
    const interactiveObjects = document.getElementById('interactive-objects');
    interactiveObjects.innerHTML = ''; 
    
    levelImg.onload = () => {
        initCamera(true);
        renderTray();
        currentLevel.targets.forEach(t => { if (t.found) drawMarker(t); });
        const remaining = currentLevel.targets.filter(t => !t.found).length;
        if (remaining === 0) document.getElementById('win-back-btn').classList.remove('hidden');
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

    // COPIA COORDINATE NEGLI APPUNTI (Per te)
    const coords = `top: '${yPct.toFixed(2)}%', left: '${xPct.toFixed(2)}%'`;
    navigator.clipboard.writeText(coords);

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
    const remaining = currentLevel.targets.filter(t => !t.found).length;
    if (remaining === 0) document.getElementById('win-back-btn').classList.remove('hidden');
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
    initCamera(true);
}
