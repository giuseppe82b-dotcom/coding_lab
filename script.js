// Selezioniamo il contenitore della griglia dal nostro HTML
const gridContainer = document.getElementById('grid-container');

// Costanti per le dimensioni della mappa
const COLUMNS = 16;
const ROWS = 16;

// Funzione per generare la scacchiera
function generateGrid() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
            // Creiamo un elemento <div> per ogni quadrato
            const cell = document.createElement('div');
            
            // Aggiungiamo la classe CSS per lo stile visivo
            cell.classList.add('cell');
            
            // Salviamo le coordinate direttamente nell'elemento HTML
            // Questo sarà fondamentale per il motore di gioco
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Inseriamo il quadrato nel contenitore principale
            gridContainer.appendChild(cell);
        }
    }
}

// Avviamo la generazione della griglia appena il file viene letto
generateGrid();

// Selezioniamo tutti i pulsanti degli strumenti e l'area del sottomenu
const toolButtons = document.querySelectorAll('.tool-btn');
const submenu = document.getElementById('submenu');

// Variabili per ricordare le scelte attuali
let currentTool = null;
let currentSubOption = null;

// Funzione per gestire il clic sugli strumenti principali
toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Rimuoviamo l'evidenziazione da tutti i pulsanti
        toolButtons.forEach(btn => btn.classList.remove('active'));
        
        // Aggiungiamo l'evidenziazione al pulsante appena cliccato
        button.classList.add('active');
        
        // Memorizziamo lo strumento selezionato (es: 'wall', 'robot', 'ball')
        currentTool = button.dataset.tool;
        
        // Azzeriamo la sotto-opzione precedente
        currentSubOption = null;
        
        // Aggiorniamo il sottomenu in base allo strumento scelto
        updateSubmenu();
    });
});

// Funzione per mostrare le opzioni corrette nel sottomenu
function updateSubmenu() {
    submenu.innerHTML = '';
    submenu.classList.remove('hidden');

    if (currentTool === 'robot') {
        createSubOption('up', '⬆️');
        createSubOption('down', '⬇️');
        createSubOption('left', '⬅️');
        createSubOption('right', '➡️');
    } else if (currentTool === 'ball' || currentTool === 'deposit' || currentTool === 'key' || currentTool === 'lock' || currentTool === 'gate') {
        createSubOption('red', '🔴');
        createSubOption('green', '🟢');
        createSubOption('blue', '🔵');
        createSubOption('yellow', '🟡');
    } else {
        submenu.classList.add('hidden');
    }
}
// Funzione di supporto per creare i piccoli pulsanti nel sottomenu
function createSubOption(value, icon) {
    const subBtn = document.createElement('button');
    subBtn.classList.add('sub-btn');
    subBtn.textContent = icon;
    
    subBtn.addEventListener('click', () => {
        // Rimuoviamo l'evidenziazione dagli altri pulsanti del sottomenu
        document.querySelectorAll('.sub-btn').forEach(btn => btn.style.borderColor = '#ccc');
        
        // Evidenziamo l'opzione scelta
        subBtn.style.borderColor = '#e74c3c';
        currentSubOption = value;
    });
    
    submenu.appendChild(subBtn);
}

// Ascoltiamo i clic sull'intero contenitore della griglia
gridContainer.addEventListener('click', (evento) => {
    // Individuiamo l'elemento esatto su cui abbiamo cliccato
    const cella = evento.target;
    
    // Ci assicuriamo di aver cliccato proprio su una casella e di avere uno strumento in mano
    if (!cella.classList.contains('cell')) return;
    if (!currentTool) return;

    // Se stiamo usando strumenti complessi, ci assicuriamo che sia stata scelta l'opzione secondaria
    if ((currentTool === 'robot' || currentTool === 'ball' || currentTool === 'deposit') && !currentSubOption) {
        alert("Ricordati di selezionare prima un'opzione dal sottomenu (come la direzione o il colore).");
        return;
    }

    // Se abbiamo selezionato la gomma, svuotiamo la casella da dati e grafica
    if (currentTool === 'eraser') {
        cella.dataset.type = '';
        cella.dataset.sub = '';
        cella.textContent = '';
        cella.style.backgroundColor = '';
        cella.style.transform = '';
        return;
    }

    // Gestione degli elementi unici: rimuoviamo il vecchio robot o la vecchia bandierina
    if (currentTool === 'robot') {
        const vecchioRobot = document.querySelector('.cell[data-type="robot"]');
        if (vecchioRobot) {
            vecchioRobot.dataset.type = '';
            vecchioRobot.dataset.sub = '';
            vecchioRobot.textContent = '';
            vecchioRobot.style.transform = '';
        }
    }
    if (currentTool === 'flag') {
        const vecchiaBandierina = document.querySelector('.cell[data-type="flag"]');
        if (vecchiaBandierina) {
            vecchiaBandierina.dataset.type = '';
            vecchiaBandierina.textContent = '';
        }
    }

    // Prepariamo la casella cliccata azzerando stili precedenti
    cella.dataset.type = currentTool;
    cella.textContent = '';
    cella.style.backgroundColor = '';
    cella.style.transform = '';

    // Inseriamo la grafica e i dati specifici in base allo strumento
    if (currentTool === 'wall') {
        cella.textContent = '🧱';
    } else if (currentTool === 'flag') {
        cella.textContent = '🏁';
    } else if (currentTool === 'robot') {
        cella.textContent = '🤖';
        cella.dataset.sub = currentSubOption; 
        if (currentSubOption === 'right') cella.style.transform = 'rotate(90deg)';
        if (currentSubOption === 'down') cella.style.transform = 'rotate(180deg)';
        if (currentSubOption === 'left') cella.style.transform = 'rotate(-90deg)';
    } else if (currentTool === 'ball') {
        cella.dataset.sub = currentSubOption; 
        if (currentSubOption === 'red') cella.textContent = '🔴';
        if (currentSubOption === 'green') cella.textContent = '🟢';
        if (currentSubOption === 'blue') cella.textContent = '🔵';
        if (currentSubOption === 'yellow') cella.textContent = '🟡';
    } else if (currentTool === 'deposit') {
        cella.dataset.sub = currentSubOption;
        if (currentSubOption === 'red') cella.textContent = '🟥';
        if (currentSubOption === 'green') cella.textContent = '🟩';
        if (currentSubOption === 'blue') cella.textContent = '🟦';
        if (currentSubOption === 'yellow') cella.textContent = '🟨';
        cella.style.backgroundColor = '';
    } else if (currentTool === 'key') {
        cella.dataset.sub = currentSubOption;
        if (currentSubOption === 'red') cella.textContent = '🔴🔑';
        if (currentSubOption === 'green') cella.textContent = '🟢🔑';
        if (currentSubOption === 'blue') cella.textContent = '🔵🔑';
        if (currentSubOption === 'yellow') cella.textContent = '🟡🔑';
    } else if (currentTool === 'lock') {
        cella.dataset.sub = currentSubOption;
        if (currentSubOption === 'red') cella.textContent = '🟥🔒';
        if (currentSubOption === 'green') cella.textContent = '🟩🔒';
        if (currentSubOption === 'blue') cella.textContent = '🟦🔒';
        if (currentSubOption === 'yellow') cella.textContent = '🟨🔒';
        cella.style.backgroundColor = '';
    } else if (currentTool === 'gate') {
        cella.dataset.sub = currentSubOption;
        if (currentSubOption === 'red') cella.textContent = '🟥🚪';
        if (currentSubOption === 'green') cella.textContent = '🟩🚪';
        if (currentSubOption === 'blue') cella.textContent = '🟦🚪';
        if (currentSubOption === 'yellow') cella.textContent = '🟨🚪';
    }
});

const btnAddCommand = document.getElementById('btn-add-command');
const commandSelector = document.getElementById('command-selector');
const sequenceList = document.getElementById('sequence-list');
const btnClearSequence = document.getElementById('btn-clear-sequence');

let correctSequence = [];

btnAddCommand.addEventListener('click', () => {
    // Rimuoviamo il testo segnaposto se presente
    const placeholder = sequenceList.querySelector('.placeholder-text');
    if (placeholder) placeholder.remove();

    const selectedCommand = commandSelector.value;
    const commandText = commandSelector.options[commandSelector.selectedIndex].text;
    
    // Aggiungiamo il comando all'array logico
    correctSequence.push(selectedCommand);

    // Creiamo l'elemento visivo
    const cmdDiv = document.createElement('div');
    cmdDiv.classList.add('sequence-item');
    if (selectedCommand === 'ripeti') cmdDiv.classList.add('loop');
    if (selectedCommand === 'fine_ripeti') cmdDiv.classList.add('end-loop');
    
    cmdDiv.textContent = commandText;
    sequenceList.appendChild(cmdDiv);
});

btnClearSequence.addEventListener('click', () => {
    correctSequence = [];
    sequenceList.innerHTML = '<p class="placeholder-text">Nessun comando inserito.</p>';
});

document.getElementById('btn-save').addEventListener('click', () => {
    const levelData = {
        title: document.getElementById('level-title').value,
        instructions: document.getElementById('level-instructions').value,
        timer: document.getElementById('level-timer').value,
        sequence: correctSequence,
        map: []
    };

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.dataset.type) {
            levelData.map.push({
                x: parseInt(cell.dataset.x),
                y: parseInt(cell.dataset.y),
                type: cell.dataset.type,
                sub: cell.dataset.sub || null
            });
        }
    });

    const dataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levelData));
    const downloadAnchor = document.createElement('a');
    
    let fileName = levelData.title.trim() !== "" ? levelData.title.replace(/\s+/g, '_').toLowerCase() : "nuovo_livello";
    
    downloadAnchor.setAttribute("href", dataString);
    downloadAnchor.setAttribute("download", fileName + ".json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

document.getElementById('btn-load').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', (evento) => {
        const file = evento.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                
                // Ripristiniamo i testi del livello
                document.getElementById('level-title').value = levelData.title || '';
                document.getElementById('level-instructions').value = levelData.instructions || '';
                document.getElementById('level-timer').value = levelData.timer || '';
                
                // Svuotiamo la griglia attuale e le classi CSS
                document.querySelectorAll('.cell').forEach(cell => {
                    cell.dataset.type = '';
                    cell.dataset.sub = '';
                    cell.textContent = '';
                    cell.style.backgroundColor = '';
                    cell.style.transform = '';
                });

                // Ricostruiamo la mappa leggendo le coordinate salvate
                levelData.map.forEach(item => {
                    const cell = document.querySelector(`.cell[data-x="${item.x}"][data-y="${item.y}"]`);
                    if (cell) {
                        cell.dataset.type = item.type;
                        if (item.sub) cell.dataset.sub = item.sub;
                        
                        if (item.type === 'wall') cell.textContent = '🧱';
                        if (item.type === 'flag') cell.textContent = '🏁';
                        if (item.type === 'robot') {
                            cell.textContent = '🤖';
                            if (item.sub === 'right') cell.style.transform = 'rotate(90deg)';
                            if (item.sub === 'down') cell.style.transform = 'rotate(180deg)';
                            if (item.sub === 'left') cell.style.transform = 'rotate(-90deg)';
                        }
                        if (item.type === 'ball') {
                            if (item.sub === 'red') cell.textContent = '🔴';
                            if (item.sub === 'green') cell.textContent = '🟢';
                            if (item.sub === 'blue') cell.textContent = '🔵';
                            if (item.sub === 'yellow') cell.textContent = '🟡';
                        }
                        if (item.type === 'deposit') {
                            if (item.sub === 'red') cell.textContent = '🟥';
                            if (item.sub === 'green') cell.textContent = '🟩';
                            if (item.sub === 'blue') cell.textContent = '🟦';
                            if (item.sub === 'yellow') cell.textContent = '🟨';
                        }
                        
                        // Ripristino su editor dei nuovi elementi
                        if (item.type === 'key') {
                            if (item.sub === 'red') cell.textContent = '🔴🔑';
                            if (item.sub === 'green') cell.textContent = '🟢🔑';
                            if (item.sub === 'blue') cell.textContent = '🔵🔑';
                            if (item.sub === 'yellow') cell.textContent = '🟡🔑';
                        }
                        if (item.type === 'lock') {
                            if (item.sub === 'red') cell.textContent = '🟥🔒';
                            if (item.sub === 'green') cell.textContent = '🟩🔒';
                            if (item.sub === 'blue') cell.textContent = '🟦🔒';
                            if (item.sub === 'yellow') cell.textContent = '🟨🔒';
                        }
                        if (item.type === 'gate') {
                            if (item.sub === 'red') cell.textContent = '🟥🚪';
                            if (item.sub === 'green') cell.textContent = '🟩🚪';
                            if (item.sub === 'blue') cell.textContent = '🟦🚪';
                            if (item.sub === 'yellow') cell.textContent = '🟨🚪';
                        }
                    }
                });

                // Ripristiniamo la sequenza dei comandi
                correctSequence = levelData.sequence || [];
                const sequenceList = document.getElementById('sequence-list');
                sequenceList.innerHTML = '';
                
                if (correctSequence.length === 0) {
                    sequenceList.innerHTML = '<p class="placeholder-text">Nessun comando inserito.</p>';
                } else {
                    correctSequence.forEach(cmd => {
                        const cmdDiv = document.createElement('div');
                        cmdDiv.classList.add('sequence-item');
                        if (cmd === 'ripeti') cmdDiv.classList.add('loop');
                        if (cmd === 'fine_ripeti') cmdDiv.classList.add('end-loop');
                        
                        const selector = document.getElementById('command-selector');
                        const option = Array.from(selector.options).find(opt => opt.value === cmd);
                        cmdDiv.textContent = option ? option.text : cmd;
                        
                        sequenceList.appendChild(cmdDiv);
                    });
                }

            } catch (error) {
                alert("Errore durante il caricamento del file. Assicurati che sia un livello valido.");
            }
        };
        reader.readAsText(file);
    });
    
    fileInput.click();
});

const testOverlay = document.getElementById('test-overlay');
const btnTest = document.getElementById('btn-test');
const btnCloseTest = document.getElementById('btn-close-test');
const gameGrid = document.getElementById('game-grid');
const gameBoardContainer = document.getElementById('game-board-container');

let robotElement = null;
let cellSize = 100 / 16; 

// Variabili globali per lo stato della simulazione di gioco
let startX = 0;
let startY = 0;
let startRotation = 0;
let currentX = 0;
let currentY = 0;
let currentRotation = 0;
let robotInventoryType = null;
let robotInventoryColor = null;
let isPlaying = false;
let stepsToExecute = [];
let currentStepIndex = 0;
let stepTimer = null;

// Funzione per configurare la mappa e resettare lo stato iniziale del livello
function setupTestLevel() {
    gameGrid.innerHTML = '';
    if (robotElement) robotElement.remove();
    
    // Azzeriamo il nuovo inventario avanzato
    robotInventoryType = null;
    robotInventoryColor = null;
    document.getElementById('student-inventory').textContent = '';
    
    for (let i = 0; i < 256; i++) {
        const cell = document.createElement('div');
        cell.classList.add('game-cell');
        gameGrid.appendChild(cell);
    }
    
    const gameCells = document.querySelectorAll('.game-cell');
    const editorCells = document.querySelectorAll('.cell');
    
    editorCells.forEach(editorCell => {
        if (editorCell.dataset.type) {
            const x = parseInt(editorCell.dataset.x);
            const y = parseInt(editorCell.dataset.y);
            const index = y * 16 + x;
            const targetCell = gameCells[index];
            const type = editorCell.dataset.type;
            const sub = editorCell.dataset.sub;
            
            targetCell.dataset.type = type;
            targetCell.dataset.sub = sub || '';
            
            if (type === 'wall') targetCell.textContent = '🧱';
            if (type === 'flag') targetCell.textContent = '🏁';
            
            if (type === 'ball') {
                if (sub === 'red') targetCell.textContent = '🔴';
                if (sub === 'green') targetCell.textContent = '🟢';
                if (sub === 'blue') targetCell.textContent = '🔵';
                if (sub === 'yellow') targetCell.textContent = '🟡';
            }
            if (type === 'deposit') {
                if (sub === 'red') targetCell.textContent = '🟥';
                if (sub === 'green') targetCell.textContent = '🟩';
                if (sub === 'blue') targetCell.textContent = '🟦';
                if (sub === 'yellow') targetCell.textContent = '🟨';
            }
            
            // Nuovi elementi per il collaudo
            if (type === 'key') {
                if (sub === 'red') targetCell.textContent = '🔴🔑';
                if (sub === 'green') targetCell.textContent = '🟢🔑';
                if (sub === 'blue') targetCell.textContent = '🔵🔑';
                if (sub === 'yellow') targetCell.textContent = '🟡🔑';
            }
            if (type === 'lock') {
                if (sub === 'red') targetCell.textContent = '🟥🔒';
                if (sub === 'green') targetCell.textContent = '🟩🔒';
                if (sub === 'blue') targetCell.textContent = '🟦🔒';
                if (sub === 'yellow') targetCell.textContent = '🟨🔒';
            }
            if (type === 'gate') {
                if (sub === 'red') targetCell.textContent = '🟥🚪';
                if (sub === 'green') targetCell.textContent = '🟩🚪';
                if (sub === 'blue') targetCell.textContent = '🟦🚪';
                if (sub === 'yellow') targetCell.textContent = '🟨🚪';
            }
            
            if (type === 'robot') {
                startX = x;
                startY = y;
                let rotation = 0;
                if (sub === 'right') rotation = 90;
                if (sub === 'down') rotation = 180;
                if (sub === 'left') rotation = -90;
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
btnTest.addEventListener('click', () => {
    testOverlay.classList.remove('hidden');
    
    document.getElementById('display-mission-title').textContent = document.getElementById('level-title').value || "Nuova Missione";
    document.getElementById('display-mission-text').textContent = document.getElementById('level-instructions').value || "Raggiungi la bandierina!";

    const timerValue = document.getElementById('level-timer').value;
    const timerDisplay = document.getElementById('display-timer');
    if (timerValue && timerValue > 0) {
        timerDisplay.textContent = "Tempo a disposizione: " + timerValue + " secondi";
    } else {
        timerDisplay.textContent = "";
    }
    
    setupTestLevel();
});

btnCloseTest.addEventListener('click', () => {
    stopSimulation();
    testOverlay.classList.add('hidden');
});

function updateRobotPosition(x, y) {
    robotElement.style.left = (x * cellSize) + '%';
    robotElement.style.top = (y * cellSize) + '%';
}

const studentPalette = document.getElementById('student-palette');
const studentSequenceArea = document.getElementById('student-sequence-area');
const studentPlaceholder = document.getElementById('student-placeholder');

let activeLoopBody = null;

studentPalette.addEventListener('click', (evento) => {
    const btn = evento.target.closest('.student-cmd-btn');
    if (!btn) return;

    if (studentPlaceholder) studentPlaceholder.style.display = 'none';

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

// FUNZIONI DEL MOTORE DI GIOCO PER L'ESECUZIONE DEI COMANDI

// Trasforma la struttura visiva ad albero dei ragazzi in una lista piatta di azioni esecutive reali
function parseCommands(container) {
    let steps = [];
    const children = container.children;
    for (let child of children) {
        if (child.classList.contains('student-line')) {
            steps.push({
                cmd: child.dataset.cmd,
                element: child
            });
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

// Analizza il codice dello studente traducendolo in un elenco testuale piatto per il controllo di vittoria
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
    setupTestLevel();
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

    if (targetCell && targetCell.dataset.type === 'gate') {
        alert("🚪 Il percorso è bloccato da un cancello chiuso!");
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
        
        let emoji = '';
        if (robotInventoryType === 'ball') {
            if (robotInventoryColor === 'red') emoji = '🔴';
            if (robotInventoryColor === 'green') emoji = '🟢';
            if (robotInventoryColor === 'blue') emoji = '🔵';
            if (robotInventoryColor === 'yellow') emoji = '🟡';
        } else if (robotInventoryType === 'key') {
            if (robotInventoryColor === 'red') emoji = '🔴🔑';
            if (robotInventoryColor === 'green') emoji = '🟢🔑';
            if (robotInventoryColor === 'blue') emoji = '🔵🔑';
            if (robotInventoryColor === 'yellow') emoji = '🟡🔑';
        }
        
        document.getElementById('student-inventory').textContent = emoji;
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
            let depositEmoji = '🟩';
            if (robotInventoryColor === 'red') depositEmoji = '🟥';
            if (robotInventoryColor === 'blue') depositEmoji = '🟦';
            if (robotInventoryColor === 'yellow') depositEmoji = '🟨';
            currentCell.textContent = depositEmoji + '✅';
        } else {
            alert("❌ Errore! Stai cercando di depositare l'oggetto sbagliato o nel deposito errato!");
            return false;
        }
    } else if (currentCell.dataset.type === 'lock') {
        if (robotInventoryType === 'key' && currentCell.dataset.sub === robotInventoryColor) {
            currentCell.dataset.filled = 'true';
            let lockEmoji = '🟩';
            if (robotInventoryColor === 'red') lockEmoji = '🟥';
            if (robotInventoryColor === 'blue') lockEmoji = '🟦';
            if (robotInventoryColor === 'yellow') lockEmoji = '🟨';
            currentCell.textContent = lockEmoji + '🔓';
            
            gameCells.forEach(cella => {
                if (cella.dataset.type === 'gate' && cella.dataset.sub === robotInventoryColor) {
                    cella.dataset.type = '';
                    cella.dataset.sub = '';
                    cella.textContent = '💨'; 
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
            if (robotInventoryColor === 'red') currentCell.textContent = '🔴🔑';
            if (robotInventoryColor === 'green') currentCell.textContent = '🟢🔑';
            if (robotInventoryColor === 'blue') currentCell.textContent = '🔵🔑';
            if (robotInventoryColor === 'yellow') currentCell.textContent = '🟡🔑';
        }
    }
    
    robotInventoryType = null;
    robotInventoryColor = null;
    robotElement.textContent = '🤖';
    document.getElementById('student-inventory').textContent = '';
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
    
    alert("🎉 Bravissimo! Missione compiuta con successo! Il codice è perfetto.");
}

// Funzione per svuotare il codice dello studente
document.getElementById('btn-clear-student-code').addEventListener('click', () => {
    const studentSequenceArea = document.getElementById('student-sequence-area');
    
    // Svuotiamo l'area e rimettiamo il testo segnaposto
    studentSequenceArea.innerHTML = '<p class="placeholder-text" id="student-placeholder">Clicca sui comandi per iniziare a scrivere.</p>';
    
    // Resettiamo la variabile che controlla se siamo dentro una cornice "ripeti"
    activeLoopBody = null; 
});