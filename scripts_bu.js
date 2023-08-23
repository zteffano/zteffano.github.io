document.addEventListener("DOMContentLoaded", function() {


const cities = ['East Harlem', 'Brooklyn', 'Manhattan', 'Queens'];
const drugsList = ['cocaine', 'heroin', 'ecstacy', 'lsd', 'hash'];

const prices = {
    cocaine: { min: 4000, max: 12000 },
    heroin: { min: 5000, max: 15000 },
    ecstacy: { min: 200, max: 500 },
    lsd: { min: 1500, max: 3500 },
    hash: { min: 1000, max: 4000 }
};

let players = [];
let currentPlayerIndex = 0;

class Player {
    constructor(name, cash) {
        this.name = name;
        this.cash = cash;
    }
}


function rotateTurns() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    if(players.length > 0 && players[currentPlayerIndex]) {
        document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
        console.log(players)
    }
}

window.onload = function() {
    document.querySelectorAll('.player-name').forEach(input => {
        players.push(new Player(input.value || input.placeholder));
    });
    if(players.length > 0 && players[currentPlayerIndex]) {
        document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }
    generateTableHeaders();
    generateTable();
}

function getRandomPrice(min, max) {
    let rawPrice = Math.random() * (max - min + 1) + min;
    return Math.round(rawPrice / 100) * 100;
}

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updatePrices() {
    console.log(`Players Array: ${players}`)
    console.log(`Current Player Index: ${currentPlayerIndex}`)
    for (let drug of drugsList) {
        for (let city of cities) {
            let cell = document.querySelector(`.${drug}.${city.toLowerCase().replace(/\s+/g, '-')}`);
            if(cell) {
                cell.textContent = `$${getRandomPrice(prices[drug].min, prices[drug].max)}`;
            } else {
                console.error(`Cell for drug: ${drug} and city: ${city} not found.`);
            }
        }
    }
}

document.getElementById('startGame').addEventListener('click', function() {
    let numPlayers = document.getElementById('playerSelect').value;
    let startingCash = parseInt(document.getElementById('startCash').value) || 0;  // Use 0 as default if no value is provided

    document.querySelectorAll('.player-input').forEach((container, index) => {
        if (index < numPlayers) {
            container.style.display = 'block';

            // Add a display for the player's cash
            let cashDisplay = document.createElement('div');
            cashDisplay.classList.add('player-cash-display');
            cashDisplay.textContent = `$${startingCash}`;
            container.appendChild(cashDisplay);
        }
    });

    document.getElementById('startContainer').style.display = 'none';
});

document.getElementById('rollDice').addEventListener('click', function() {
    if (players.length === 0) {
        document.querySelectorAll('.player-name-field').forEach(input => {
            let enteredName = input.value || input.placeholder;
            let startingCash = parseInt(document.getElementById('startCash').value) || 0;  // Use 0 as default if no value is provided

            if (enteredName) {
                players.push(new Player(enteredName, startingCash));
            }
        });
        document.querySelectorAll('.player-name').forEach(input => {
            if (input.value || input.placeholder) {
                players.push(new Player(input.value || input.placeholder));
            }
        });
        if(players.length > 0 && players[currentPlayerIndex]) {
            document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
        }
    }

    const diceVal = rollDice();
    document.getElementById('diceResult').textContent = `You rolled a ${diceVal}!`;
    updatePrices();
    rotateTurns();
});

document.querySelectorAll('.player-name-field').forEach(inputField => {
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            let enteredName = inputField.value;
            let inputContainer = inputField.closest('.player-name-input');
            let nameLabelContainer = inputField.closest('.player-input').querySelector('.player-name-label');
            let nameTextElement = nameLabelContainer.querySelector('.player-name-text');

            nameTextElement.textContent = enteredName;
            inputContainer.style.display = 'none';
            nameLabelContainer.style.display = 'block';

            if (!players.some(p => p.name === enteredName)) {
                players.push(new Player(enteredName));
            }
        }
    });
});

function generateTable() {
    let table = document.querySelector('tbody');
    table.innerHTML = '';

    for (let drug of drugsList) {
        let row = document.createElement('tr');
        let drugCell = document.createElement('td');
        
        // Add drug name and buy button to the cell
        drugCell.innerHTML = `<b>${drug.charAt(0).toUpperCase() + drug.slice(1)}</b> <button class="buy-btn" data-drug="${drug}">Buy</button>`;
        
        row.appendChild(drugCell);

        for (let city of cities) {
            let cell = document.createElement('td');
            cell.classList.add(drug, city.toLowerCase().replace(/\s+/g, '-'));
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}


function generateTableHeaders() {
    let headerRow = document.querySelector('thead tr');
    
    // Clear existing headers after 'Drugs'
    while (headerRow.children.length > 1) {
        headerRow.removeChild(headerRow.lastChild);
    }

    // Create header cells for each city
    for (let city of cities) {
        let header = document.createElement('th');
        header.textContent = city;

        // Tilføj en klik event listener til by header
        header.addEventListener('click', function() {
            setPlayerCity(city);
        });

        headerRow.appendChild(header);
    }
}

function setPlayerCity(cityName) {
    // Opdater den aktuelle spillers by
    players[currentPlayerIndex].city = cityName;

    // Opdater h2 teksten
    let h2Element = document.getElementById('playerCityDisplay');
    h2Element.textContent = `${players[currentPlayerIndex].name} er i ${cityName}`;
}



}); // Afslutter: DOMContentLoaded