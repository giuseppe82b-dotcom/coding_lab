const gameGrid = document.getElementById('game-grid');
const gameBoardContainer = document.getElementById('game-board-container');
const studentSequenceArea = document.getElementById('student-sequence-area');
const victoryModal = document.getElementById('victory-modal');
const btnNextLevel = document.getElementById('btn-next-level');

let robotElement = null;
let cellSize = 100 / 16; 
let currentLevelNumber = 1;
let levelMapData = [];
let correctSequence = [];

let startX = 0;
let startY = 0;
let startRotation = 0;
let currentX = 0;
let currentY = 0;
let currentRotation = 0;
let robotInventory = null;
let isPlaying = false;
let stepsToExecute = [];
let currentStepIndex = 0;
let stepTimer = null;
let activeLoopBody = null;

// Avvia il caricamento del primo livello all'apertura della pagina
window.onload = () => {
    loadLevel(currentLevelNumber);
};

function loadLevel(levelNum) {
    const filePath = `LEVEL/livello${levelNum}.json`;
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error("Livello non trovato. Hai completato tutte le sfide!");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('display-mission-title').textContent = data.title || `Missione ${levelNum}`;
            document.getElementById('display-mission-text').textContent = data.instructions || "Raggiungi la bandierina!";
            
            const timerDisplay = document.getElementById('display-timer');
            if (data.timer && data.timer > 0) {
                timerDisplay.textContent = "Tempo a disposizione: " + data.timer + " secondi";
            } else {
                timerDisplay.textContent = "";
            }
            
            levelMapData = data.map || [];
            correctSequence = data.sequence || [];
            setupGameBoard();
            resetStudentCode();
            victoryModal.style.display = 'none';
        })
        .catch(error => {
            alert(error.message);
        });
}

function setupGameBoard() {
    gameGrid.innerHTML = '';
    if (robotElement) robotElement.remove();
    robotInventory = null;
    document.getElementById('student-inventory').textContent = '';
    
    for (let i = 0; i < 256; i++) {
        const cell = document.createElement('div');
        cell.classList.add('game-cell');
        gameGrid.appendChild(cell);
    }
    
    const gameCells = document.querySelectorAll('.game-cell');
    
    levelMapData.forEach(item => {
        const index = item.y * 16 + item.x;
        const targetCell = gameCells[index];
        
        if(targetCell) {
            targetCell.dataset.type = item.type;
            targetCell.dataset.sub = item.sub || '';
            
            if (item.type === 'wall') targetCell.textContent = '🧱';
            if (item.type === 'flag') targetCell.textContent = '🏁';
            
            if (item.type === 'ball') {
                if (item.sub === 'red') targetCell.textContent = '🔴';
                if (item.sub === 'green') targetCell.textContent = '🟢';
                if (item.sub === 'blue') targetCell.textContent = '🔵';
                if (item.sub === 'yellow') targetCell.textContent = '🟡';
            }
            
            if (item.type === 'deposit') {
                if (item.sub === 'red') targetCell.textContent = '🟥';
                if (item.sub === 'green') targetCell.textContent = '🟩';
                if (item.sub === 'blue') targetCell.textContent = '🟦';
                if (item.sub === 'yellow') targetCell.textContent = '🟨';
            }
	if (item.type === 'key') {
                targetCell.textContent = '🔑';
                if (item.sub === 'red') targetCell.style.backgroundColor = '#ff9999';
                if (item.sub === 'green') targetCell.style.backgroundColor = '#99ff99';
                if (item.sub === 'blue') targetCell.style.backgroundColor = '#99ccff';
                if (item.sub === 'yellow') targetCell.style.backgroundColor = '#ffff99';
            }
            if (item.type === 'lock') {
                targetCell.textContent = '🔒';
                if (item.sub === 'red') targetCell.style.backgroundColor = '#ff9999';
                if (item.sub === 'green') targetCell.style.backgroundColor = '#99ff99';
                if (item.sub === 'blue') targetCell.style.backgroundColor = '#99ccff';
                if (item.sub === 'yellow') targetCell.style.backgroundColor = '#ffff99';
            }
            if (item.type === 'gate') {
                targetCell.textContent = '🚪';
                if (item.sub === 'red') targetCell.style.backgroundColor = '#ff9999';
                if (item.sub === 'green') targetCell.style.backgroundColor = '#99ff99';
                if (item.sub === 'blue') targetCell.style.backgroundColor = '#99ccff';
                if (item.sub === 'yellow') targetCell.style.backgroundColor = '#ffff99';
            }
            
            if (item.type === 'robot') {
                startX = item.x;
                startY = item.y;
                let rotation = 0;
                if (item.sub === 'right') rotation = 90;
                if (item.sub === 'down') rotation = 180;
                if (item.sub === 'left') rotation = -90;
                startRotation = rotation;
            }
        }
    });
    
    robotElement = document.createElement('div');
    robotElement.classList.add('moving-robot');
    robotElement.textContent = '🤖';
    robotElement.style.width = cellSize + '%';
    robotElement.style.height = cellSize + '%';
    gameBoardContainer.appendChild(robotElement);
    
    currentX = startX;
    currentY = startY;
    currentRotation = startRotation;
    updateRobotPosition(currentX, currentY);
    robotElement.style.transform = `rotate(${currentRotation}deg)`;
}

function updateRobotPosition(x, y) {
    robotElement.style.left = (x * cellSize) + '%';
    robotElement.style.top = (y * cellSize) + '%';
}

function resetStudentCode() {
    studentSequenceArea.innerHTML = '<p class="placeholder-text" id="student-placeholder">Clicca sui comandi per iniziare a scrivere.</p>';
    activeLoopBody = null;
}

// Gestione dell'avanzamento livello
btnNextLevel.addEventListener('click', () => {
    currentLevelNumber++;
    loadLevel(currentLevelNumber);
});

// Gestione dei clic sulla pulsantiera per creare il codice
document.getElementById('student-palette').addEventListener('click', (evento) => {
    const btn = evento.target.closest('.student-cmd-btn');
    if (!btn) return;

    const placeholder = document.getElementById('student-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const cmdType = btn.dataset.cmd;
    const cmdText = btn.textContent;

    if (cmdType === 'ripeti') {
        const loopDiv = document.createElement('div');
        loopDiv.classList.add('loop-container');
        
        const header = document.createElement('div');
        header.classList.add('loop-header');
        
        const textSpan = document.createElement('span');
        textSpan.innerHTML = 'Ripeti <span class="loop-times">2</span> volte';
        
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('loop-controls');
        
        const btnMinus = document.createElement('button');
        btnMinus.classList.add('btn-loop-math');
        btnMinus.textContent = '-';
        
        const btnPlus = document.createElement('button');
        btnPlus.classList.add('btn-loop-math');
        btnPlus.textContent = '+';
        
        controlsDiv.appendChild(btnMinus);
        controlsDiv.appendChild(btnPlus);
        header.appendChild(textSpan);
        header.appendChild(controlsDiv);
        
        const timesDisplay = textSpan.querySelector('.loop-times');
        
        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation(); 
            let current = parseInt(timesDisplay.textContent);
            timesDisplay.textContent = current + 1;
        });
        
        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            let current = parseInt(timesDisplay.textContent);
            if (current > 1) {
                timesDisplay.textContent = current - 1;
            }
        });
        
        const body = document.createElement('div');
        body.classList.add('loop-body');
        
        loopDiv.appendChild(header);
        loopDiv.appendChild(body);
        
        if (activeLoopBody) {
            activeLoopBody.appendChild(loopDiv);
        } else {
            studentSequenceArea.appendChild(loopDiv);
        }
        
        activeLoopBody = body;

    } else {
        const line = document.createElement('div');
        line.classList.add('student-line');
        line.textContent = cmdText;
        line.dataset.cmd = cmdType;
        
        if (activeLoopBody) {
            activeLoopBody.appendChild(line);
        } else {
            studentSequenceArea.appendChild(line);
        }
    }
});

studentSequenceArea.addEventListener('click', (evento) => {
    if (evento.target === studentSequenceArea) {
        activeLoopBody = null;
    }
});

document.getElementById('btn-clear-student-code').addEventListener('click', () => {
    resetStudentCode();
});

// Funzioni di esecuzione
function parseCommands(container) {
    let steps = [];
    const children = container.children;
    for (let child of children) {
        if (child.classList.contains('student-line')) {
            steps.push({ cmd: child.dataset.cmd, element: child });
        } else if (child.classList.contains('loop-container')) {
            const timesDisplay = child.querySelector('.loop-times');
            const times = timesDisplay ? parseInt(timesDisplay.textContent) : 1;
            const body = child.querySelector('.loop-body');
            if (body) {
                const bodySteps = parseCommands(body);
                for (let i = 0; i < times; i++) {
                    steps = steps.concat(bodySteps);
                }
            }
        }
    }
    return steps;
}

function getStudentSequenceStrings(container) {
    let seq = [];
    const children = container.children;
    for (let child of children) {
        if (child.classList.contains('student-line')) {
            seq.push(child.dataset.cmd);
        } else if (child.classList.contains('loop-container')) {
            seq.push('ripeti');
            const body = child.querySelector('.loop-body');
            if (body) {
                seq = seq.concat(getStudentSequenceStrings(body));
            }
            seq.push('fine_ripeti');
        }
    }
    return seq;
}

document.getElementById('btn-play').addEventListener('click', () => {
    if (isPlaying) return;
    
    stepsToExecute = parseCommands(studentSequenceArea);
    currentStepIndex = 0;
    
    if (stepsToExecute.length === 0) {
        alert("Inserisci almeno un comando prima di avviare il robot!");
        return;
    }
    
    isPlaying = true;
    runNextStep();
});

document.getElementById('btn-stop').addEventListener('click', () => {
    stopSimulation();
});

document.getElementById('btn-reset').addEventListener('click', () => {
    stopSimulation();
    setupGameBoard();
});

function stopSimulation() {
    if (stepTimer) clearTimeout(stepTimer);
    if (stepsToExecute && stepsToExecute[currentStepIndex - 1]) {
        stepsToExecute[currentStepIndex - 1].element.classList.remove('executing');
    }
    isPlaying = false;
}

function runNextStep() {
    if (currentStepIndex > 0) {
        stepsToExecute[currentStepIndex - 1].element.classList.remove('executing');
    }
    
    if (currentStepIndex >= stepsToExecute.length) {
        isPlaying = false;
        checkWinCondition();
        return;
    }
    
    const currentStep = stepsToExecute[currentStepIndex];
    currentStep.element.classList.add('executing');
    
    let success = executeCommand(currentStep.cmd);
    
    if (!success) {
        currentStep.element.classList.remove('executing');
        isPlaying = false;
        return;
    }
    
    currentStepIndex++;
    stepTimer = setTimeout(runNextStep, 700);
}

function executeCommand(cmd) {
    let normalizedRot = ((currentRotation % 360) + 360) % 360;
    let dx = 0;
    let dy = 0;
    
    if (normalizedRot === 0) { dy = -1; }
    else if (normalizedRot === 90) { dx = 1; }
    else if (normalizedRot === 180) { dy = 1; }
    else if (normalizedRot === 270) { dx = -1; }
    
    if (cmd === 'avanti') {
        return moveRobot(dx, dy);
    } else if (cmd === 'indietro') {
        return moveRobot(-dx, -dy);
    } else if (cmd === 'sinistra') {
        currentRotation -= 90;
        robotElement.style.transform = `rotate(${currentRotation}deg)`;
        return true;
    } else if (cmd === 'raccogli') {
        return robotPickUp();
    } else if (cmd === 'lascia') {
        return robotDrop();
    }
    return true;
}

function moveRobot(dx, dy) {
    let nextX = currentX + dx;
    let nextY = currentY + dy;
    
    if (nextX < 0 || nextX >= 16 || nextY < 0 || nextY >= 16) {
        alert("⚠️ Il robottino è uscito dai confini del gioco!");
        return false;
    }
    
    const targetIndex = nextY * 16 + nextX;
    const gameCells = document.querySelectorAll('.game-cell');
    const targetCell = gameCells[targetIndex];
    
    if (targetCell && targetCell.dataset.type === 'wall') {
        alert("💥 Sbeng! Il robottino ha urtato un muro!");
        return false;
    }
    
    currentX = nextX;
    currentY = nextY;
    updateRobotPosition(currentX, currentY);
    return true;
}

function robotPickUp() {
    if (robotInventoryType) {
        alert("⚠️ Il robottino sta già trasportando un oggetto!");
        return false;
    }
    
    const currentIndex = currentY * 16 + currentX;
    const gameCells = document.querySelectorAll('.game-cell');
    const currentCell = gameCells[currentIndex];
    
    if (currentCell && (currentCell.dataset.type === 'ball' || currentCell.dataset.type === 'key')) {
        robotInventoryType = currentCell.dataset.type;
        robotInventoryColor = currentCell.dataset.sub;
        
        currentCell.dataset.type = '';
        currentCell.dataset.sub = '';
        currentCell.textContent = ''; 
        currentCell.style.backgroundColor = ''; // Rimuove il colore dalla cella
        
        let emoji = '';
        let invBg = '';
        if (robotInventoryType === 'ball') {
            if (robotInventoryColor === 'red') emoji = '🔴';
            if (robotInventoryColor === 'green') emoji = '🟢';
            if (robotInventoryColor === 'blue') emoji = '🔵';
            if (robotInventoryColor === 'yellow') emoji = '🟡';
        } else if (robotInventoryType === 'key') {
            emoji = '🔑';
            if (robotInventoryColor === 'red') invBg = '#ff9999';
            if (robotInventoryColor === 'green') invBg = '#99ff99';
            if (robotInventoryColor === 'blue') invBg = '#99ccff';
            if (robotInventoryColor === 'yellow') invBg = '#ffff99';
        }
        
        const invElement = document.getElementById('student-inventory');
        invElement.textContent = emoji;
        invElement.style.backgroundColor = invBg; // Colora lo sfondo dell'inventario
        
        return true;
    } else {
        alert("⚠️ Non c'è nessun oggetto da raccogliere in questa casella!");
        return false;
    }
}

function robotDrop() {
    if (!robotInventoryType) {
        alert("⚠️ Il robottino non ha nessun oggetto da lasciare!");
        return false;
    }
    
    const currentIndex = currentY * 16 + currentX;
    const gameCells = document.querySelectorAll('.game-cell');
    const currentCell = gameCells[currentIndex];
    
    if (currentCell.dataset.type === 'ball' || currentCell.dataset.type === 'key') {
        alert("⚠️ C'è già un oggetto in questa casella!");
        return false;
    }
    
    if (currentCell.dataset.type === 'deposit') {
        if (robotInventoryType === 'ball' && currentCell.dataset.sub === robotInventoryColor) {
            currentCell.dataset.filled = 'true';
            // Sostituiamo il contenuto mostrando SOLO la spunta verde
            currentCell.textContent = '✅'; 
        } else {
            alert("❌ Errore! Stai cercando di depositare l'oggetto sbagliato o nel deposito errato!");
            return false;
        }
    } else if (currentCell.dataset.type === 'lock') {
        if (robotInventoryType === 'key' && currentCell.dataset.sub === robotInventoryColor) {
            currentCell.dataset.filled = 'true';
            // Mostriamo solo il lucchetto aperto e togliamo il colore di sfondo
            currentCell.textContent = '🔓';
            currentCell.style.backgroundColor = ''; 
            
            // Trova e fai sparire tutti i cancelli di quel colore
            gameCells.forEach(cella => {
                if (cella.dataset.type === 'gate' && cella.dataset.sub === robotInventoryColor) {
                    cella.dataset.type = '';
                    cella.dataset.sub = '';
                    cella.textContent = '💨'; 
                    cella.style.backgroundColor = ''; // Togli il colore del cancello
                    setTimeout(() => { if (cella.textContent === '💨') cella.textContent = ''; }, 1000);
                }
            });
        } else {
            alert("❌ Errore! Chiave errata per questa serratura!");
            return false;
        }
    } else {
        currentCell.dataset.type = robotInventoryType;
        currentCell.dataset.sub = robotInventoryColor;
        
        if (robotInventoryType === 'ball') {
            if (robotInventoryColor === 'red') currentCell.textContent = '🔴';
            if (robotInventoryColor === 'green') currentCell.textContent = '🟢';
            if (robotInventoryColor === 'blue') currentCell.textContent = '🔵';
            if (robotInventoryColor === 'yellow') currentCell.textContent = '🟡';
        } else if (robotInventoryType === 'key') {
            currentCell.textContent = '🔑';
            if (robotInventoryColor === 'red') currentCell.style.backgroundColor = '#ff9999';
            if (robotInventoryColor === 'green') currentCell.style.backgroundColor = '#99ff99';
            if (robotInventoryColor === 'blue') currentCell.style.backgroundColor = '#99ccff';
            if (robotInventoryColor === 'yellow') currentCell.style.backgroundColor = '#ffff99';
        }
    }
    
    // Svuotiamo la memoria del robot
    robotInventoryType = null;
    robotInventoryColor = null;
    robotElement.textContent = '🤖';
    
    // Svuotiamo visivamente l'inventario laterale
    const invElement = document.getElementById('student-inventory');
    invElement.textContent = '';
    invElement.style.backgroundColor = ''; 
    
    return true;
}
function checkWinCondition() {
    const currentIndex = currentY * 16 + currentX;
    const gameCells = document.querySelectorAll('.game-cell');
    const currentCell = gameCells[currentIndex];
    
    if (!currentCell || currentCell.dataset.type !== 'flag') {
        alert("❌ Missione fallita: il robottino non è arrivato alla bandierina di traguardo.");
        return;
    }
    
    const studentSeq = getStudentSequenceStrings(studentSequenceArea);
    
    if (studentSeq.length !== correctSequence.length) {
        alert("❌ La sequenza di comandi non è quella ottimale prevista per questo livello!");
        return;
    }
    
    for (let i = 0; i < correctSequence.length; i++) {
        if (studentSeq[i] !== correctSequence[i]) {
            alert("❌ Accidenti! Il codice funziona ma non corrisponde esattamente alla sequenza logica richiesta.");
            return;
        }
    }
    
    // Invece del vecchio avviso testuale, mostriamo lo schermo di vittoria interattivo
    victoryModal.style.display = 'flex';
}