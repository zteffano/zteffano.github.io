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
    constructor(name) {
        this.name = name;
    }
}
function rotateTurns() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
}



// On page load, populate the players list and set the first player's turn
window.onload = function() {
    document.querySelectorAll('.player-name').forEach(input => {
        players.push(new Player(input.value || input.placeholder));
    });
    document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
}


function getRandomPrice(min, max) {
    let rawPrice = Math.random() * (max - min + 1) + min;
    // Round the price to the nearest 10
    return Math.round(rawPrice / 100) * 100;
}


function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updatePrices() {
    for (let drug in prices) {
        document.querySelectorAll(`.${drug}`).forEach(cell => {
            cell.textContent = `$${getRandomPrice(prices[drug].min, prices[drug].max)}`;
        });
    }
}

document.getElementById('startGame').addEventListener('click', function() {
    let numPlayers = document.getElementById('playerSelect').value;
    
    // Show player input boxes
    document.querySelectorAll('.player-input').forEach((container, index) => {
        if (index < numPlayers) {
            container.style.display = 'block';
        }
    });
    
    // Hide the start game container
    document.getElementById('startContainer').style.display = 'none';
});

// On start of the game (when Roll Dice is clicked), initialize players.
document.getElementById('rollDice').addEventListener('click', function() {
    if (players.length === 0) {
        document.querySelectorAll('.player-name').forEach(input => {
            if (input.value || input.placeholder) {
                players.push(new Player(input.value || input.placeholder));
            }
        });
        document.getElementById('playerTurn').textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }

    const diceVal = rollDice();
    document.getElementById('diceResult').textContent = `You rolled a ${diceVal}!`;
    updatePrices();
    rotateTurns();
});



// Initial Price Update
updatePrices();


document.querySelectorAll('.player-name-field').forEach(inputField => {
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            // Prevent form submission if it's inside a form
            event.preventDefault();

            // Get the entered name
            let enteredName = inputField.value;

            // Find the related containers
            let inputContainer = inputField.closest('.player-name-input');
            let nameLabelContainer = inputField.closest('.player-input').querySelector('.player-name-label');
            let nameTextElement = nameLabelContainer.querySelector('.player-name-text');

            // Update text and swap visibility
            nameTextElement.textContent = enteredName;
            inputContainer.style.display = 'none';
            nameLabelContainer.style.display = 'block';

            // Update the players list
            if (!players.some(p => p.name === enteredName)) {
                players.push(new Player(enteredName));
            }
        }
    });
});
