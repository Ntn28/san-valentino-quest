let isDragging = false;
let startX, startY;
let mapX = 0;
let mapY = 0;
let activeContainer = null;

const levelsData = {
    'mole': {
        image: 'mole_interno.png', 
        targets: [{ id: 'chiave', name: 'Chiave', top: '45%', left: '30%' }]
    },
    'cappuccini': {
        image: 'cappuccini_interno.png',
        targets: [{ id: 'binocolo', name: 'Binocolo', top: '20%', left: '50%' }]
    },
    'egizio': {
        image: 'egizio_interno.png',
        targets: [{ id: 'scarabeo', name: 'Scarabeo', top: '60%', left: '40%' }]
    },
    'smashy': {
        image: 'smashy_interno.png',
        targets: [{ id: 'burger', name: 'Burger', top: '75%', left: '45%' }]
    }
};

// LOGIN
function checkCode() {
    const d = document.getElementById('slot-day').value;
    const m = document.getElementById('slot-month').value;
    const y = document.getElementById('slot-year').value;
    if (d === "12" && m === "08" && y === "2024") {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('map-screen').classList.remove('hidden');
        activeContainer = document.querySelector('#map-screen .map-container');
    } else {
        alert("Data errata!");
    }
}

// DRAG SYSTEM
function handleMouseDown(e) {
    if (!activeContainer) return;
    isDragging = true;
    startX = e.clientX - mapX;
    startY = e.clientY - mapY;
}

function handleMouseMove(e) {
    if (!isDragging || !activeContainer) return;
    let newX = e.clientX - startX;
    let newY = e.clientY - startY;

    // Blocca ai bordi
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const contW = activeContainer.offsetWidth;
    const contH = activeContainer.offsetHeight;

    if (newX > 0) newX = 0;
    if (newX < screenW - contW) newX = screenW - contW;
    if (newY > 0) newY = 0;
    if (newY < screenH - contH) newY = screenH - contH;

    mapX = newX;
    mapY = newY;
    activeContainer.style.transform = `translate(${mapX}px, ${mapY}px)`;
}

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', () => isDragging = false);
document.getElementById('map-screen').addEventListener('mousedown', handleMouseDown);
document.getElementById('level-screen').addEventListener('mousedown', handleMouseDown);

// LIVELLI
function openLevel(placeName) {
    const data = levelsData[placeName];
    if (!data) return alert("Livello non pronto!");

    document.getElementById('level-image').src = data.image;
    document.getElementById('map-screen').classList.add('hidden');
    document.getElementById('level-screen').classList.remove('hidden');
    
    activeContainer = document.getElementById('level-drag-container');
    mapX = 0; mapY = 0;
    activeContainer.style.transform = `translate(0px, 0px)`;

    setupObjects(data.targets);
}

function setupObjects(targets) {
    const tray = document.getElementById('objects-to-find');
    const area = document.getElementById('interactive-objects');
    tray.innerHTML = ''; area.innerHTML = '';

    targets.forEach(obj => {
        const slot = document.createElement('div');
        slot.className = 'target-item';
        slot.id = `tray-${obj.id}`;
        slot.innerText = obj.name;
        tray.appendChild(slot);

        const target = document.createElement('div');
        target.className = 'hotspot';
        target.style.top = obj.top; target.style.left = obj.left;
        target.style.width = '60px'; target.style.height = '60px';
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
    mapX = 0; mapY = 0;
    activeContainer.style.transform = `translate(0px, 0px)`;
}
