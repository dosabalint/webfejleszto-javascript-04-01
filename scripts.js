// konstansok
const gridSize = 9;

// változók
let cursorCol = 0,
    cursorRow = 0,
    stepCount = 0,
    finished = false;

// elemek összegyűjtése
const tableGrid = document.getElementById('grid');
const spanStepCount = document.getElementById('stepCount');
const spanCurrentMark = document.getElementById('currentMark');

// feliratkozás
window.addEventListener('keydown', OnKeyDown);
window.addEventListener('gameFinished', OnGameFinished);

// init
RenderGrid();
MoveCursor();
UpdateCurrentMarkSpan();

//////////////////////////////////////////////////

// renderelés

function RenderGrid() {
    tableGrid.innerHTML = '';

    // sorok
    for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        let newRow = document.createElement('tr');

        // sor cellák = oszlopok
        for (let colIndex = 0; colIndex < gridSize; colIndex++) {
            let newCell = document.createElement('td');
            newRow.appendChild(newCell);
        }

        tableGrid.appendChild(newRow);
    }
}

// eseményre reagálás

function OnKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
        case 'ArrowLeft':
            let direction = event.key;
            direction = direction.replace('Arrow', '');
            MoveCursor(direction);
            break;

        case 'Space':
            PlaceMark();
            break;
    }
}

function OnGameFinished(event) {
    let message = 'A játék végetért. Nyertes: ' + GetCurrentMark();
    alert(message);
    console.log(message);
    finished = true;
}

// kurzor

function SetCursor(rowIndex, colIndex) {
    // finished állapot figyelés
    if (finished) {
        return;
    }

    // sor kikeresése és validálás
    let rows = tableGrid.childNodes;
    if (rows.length <= rowIndex) {
        console.error('Túl nagy sor index');
        return;
    }

    // cella kikeresése
    let cells = rows[rowIndex].childNodes;
    if (cells.length <= colIndex) {
        console.error('Túl nagy oszlop index');
        return;
    }
    let selectedCell = cells[colIndex];

    // előző kurzor eltűntetése
    let prevCursorCollection = document.getElementsByClassName('cursor');
    for (
        let cursorIndex = 0;
        cursorIndex < prevCursorCollection.length;
        cursorIndex++
    ) {
        let prevCursor = prevCursorCollection[cursorIndex];
        prevCursor.className = '';
    }

    // érték beállítása
    selectedCell.className = 'cursor';
}

function MoveCursor(direction) {
    switch (direction) {
        case 'Up':
            cursorRow = Math.max(0, cursorRow - 1);
            break;

        case 'Right':
            cursorCol = Math.min(gridSize - 1, cursorCol + 1);
            break;

        case 'Down':
            cursorRow = Math.min(gridSize - 1, cursorRow + 1);
            break;

        case 'Left':
            cursorCol = Math.max(0, cursorCol - 1);
            break;
    }
    SetCursor(cursorRow, cursorCol);
}

// jel elhelyezés

function GetCellValue(rowIndex, colIndex) {
    // sor kikeresése és validálás
    let rows = tableGrid.childNodes;
    if (rows.length <= rowIndex) {
        return -1;
    }

    // cella kikeresése
    let cells = rows[rowIndex].childNodes;
    if (cells.length <= colIndex) {
        return -1;
    }
    let cell = cells[colIndex];

    return cell.innerText;
}

function SetCellValue(rowIndex, colIndex, value) {
    // megfelelő sor és cella kikeresése
    let rows = tableGrid.childNodes,
        cells = rows[rowIndex].childNodes,
        selectedCell = cells[colIndex];

    // érték beállítása
    selectedCell.innerText = value;
}

function PlaceMark() {
    // finished állapot figyelés
    if (finished) {
        return;
    }

    // kitöltöttség figyelés
    if (GetCellValue(cursorRow, cursorCol)) {
        return;
    }

    // jel beállítás
    SetCellValue(cursorRow, cursorCol, GetCurrentMark());

    // triggerelünk ha kész vagyunk
    if (IsGameFinished()) {
        TriggerFinished();
    }

    // növeljük a lépésszámot
    IncreaseStepCount();

    // kiírjuk az aktuális játékost
    UpdateCurrentMarkSpan();
}

function GetCurrentMark() {
    return stepCount % 2 == 0 ? 'X' : 'O';
}

function UpdateCurrentMarkSpan() {
    spanCurrentMark.innerText = GetCurrentMark();
}

// lépésszám

function IncreaseStepCount() {
    stepCount++;
    spanStepCount.innerText = stepCount;
}

// játék állapot ellenőrzés

function IsGameFinished() {
    // függőleges ellenőrzés
    for (let rowIndex = 2; rowIndex < gridSize - 2; rowIndex++) {
        for (let colIndex = 0; colIndex < gridSize; colIndex++) {
            // vizsgált tartomány
            let cellValues = [
                GetCellValue(rowIndex - 2, colIndex),
                GetCellValue(rowIndex - 1, colIndex),
                GetCellValue(rowIndex, colIndex),
                GetCellValue(rowIndex + 1, colIndex),
                GetCellValue(rowIndex + 2, colIndex)
            ];

            // O-k
            if (CountValue(cellValues, 'O') == 5) {
                return true;
            }

            // X-ek
            if (CountValue(cellValues, 'X') == 5) {
                return true;
            }
        }
    }

    // vízszintes ellenőrzés
    for (let colIndex = 2; colIndex < gridSize - 2; colIndex++) {
        for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
            // vizsgált tartomány
            let cellValues = [
                GetCellValue(rowIndex, colIndex - 2),
                GetCellValue(rowIndex, colIndex - 1),
                GetCellValue(rowIndex, colIndex),
                GetCellValue(rowIndex, colIndex + 1),
                GetCellValue(rowIndex, colIndex + 2)
            ];

            // O-k
            if (CountValue(cellValues, 'O') == 5) {
                return true;
            }

            // X-ek
            if (CountValue(cellValues, 'X') == 5) {
                return true;
            }
        }
    }

    return false;
}

function CountValue(valueCollection, valueToCount) {
    return valueCollection.filter(function(value) {
        return value == valueToCount;
    }).length;
}

function TriggerFinished() {
    let event = new Event('gameFinished');
    window.dispatchEvent(event);
}
