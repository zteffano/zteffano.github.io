(function() {
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
        constructor(name, cash, city = null) {
            this.name = name;
            this.cash = cash;
            this.city = city;
        }
    }

    const getRandomPrice = (min, max) => Math.round((Math.random() * (max - min + 1) + min) / 100) * 100;

    const rollDice = () => Math.floor(Math.random() * 6) + 1;

    const updatePrices = () => {
        drugsList.forEach(drug => {
            cities.forEach(city => {
                let cell = document.querySelector(`.${drug}.${city.toLowerCase().replace(/\s+/g, '-')}`);
                cell ? cell.textContent = `$${getRandomPrice(prices[drug].min, prices[drug].max)}` 
                    : console.error(`Cell for drug: ${drug} and city: ${city} not found.`);
            });
        });
    }

    const rotateTurns = () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        if (players[currentPlayerIndex]) {
            document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
        }
    }

    const updatePlayerTurnDisplay = () => {
        if (players[currentPlayerIndex]) {
            document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
        }
    }

    const generateTable = () => {
        let table = document.querySelector('tbody');
        table.innerHTML = '';
        drugsList.forEach(drug => {
            let row = document.createElement('tr');
            let drugCell = document.createElement('td');
            drugCell.innerHTML = `<b>${drug.charAt(0).toUpperCase() + drug.slice(1)}</b> <button class="buy-btn" data-drug="${drug}">Buy</button>`;
            row.appendChild(drugCell);
            cities.forEach(city => {
                let cell = document.createElement('td');
                cell.classList.add(drug, city.toLowerCase().replace(/\s+/g, '-'));
                row.appendChild(cell);
            });
            table.appendChild(row);
        });
    }

    const generateTableHeaders = () => {
        let headerRow = document.querySelector('thead tr');
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastChild);
        }
        cities.forEach(city => {
            let header = document.createElement('th');
            header.textContent = city;
            header.addEventListener('click', () => setPlayerCity(city));
            headerRow.appendChild(header);
        });
    }

    const setPlayerCity = cityName => {
        players[currentPlayerIndex].city = cityName;
        document.getElementById('playerCityDisplay').textContent = `${players[currentPlayerIndex].name} is in ${cityName}`;
    }

    const setupEventListeners = () => {
        document.getElementById('startGame').addEventListener('click', function() {
            let numPlayers = document.getElementById('playerSelect').value;
            let startingCash = parseInt(document.getElementById('startCash').value) || 0;
            document.querySelectorAll('.player-input').forEach((container, index) => {
                if (index < numPlayers) {
                    container.style.display = 'block';
                    let cashDisplay = document.createElement('div');
                    cashDisplay.classList.add('player-cash-display');
                    cashDisplay.textContent = `$${startingCash}`;
                    container.appendChild(cashDisplay);
                }
            });
            document.getElementById('startContainer').style.display = 'none';
        });

        document.getElementById('rollDice').addEventListener('click', function() {
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
                    if (!players.some(p => p.name === enteredName)) {
                        let startingCash = parseInt(document.getElementById('startCash').value) || 0;
                        players.push(new Player(enteredName, startingCash));
                        let inputContainer = inputField.closest('.player-name-input');
                        let nameLabel = document.createElement('label');
                        nameLabel.textContent = `Name: ${enteredName}`;
                        inputContainer.replaceChild(nameLabel, inputField);
                        updatePlayerTurnDisplay();
                    }
                }
            });
        });
    }

    // Initialization code
    document.addEventListener('DOMContentLoaded', function() {
        generateTableHeaders();
        generateTable();
        updatePrices();
        setupEventListeners();
    });
})();
