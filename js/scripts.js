(function () {
  const cities = ["East Harlem", "Brooklyn", "Manhattan", "Queens"];
  //const drugsList = ["cocaine", "heroin", "ecstacy", "LSD", "hash","morphine"];
  const drugsList = ["Morphine", "Ecstacy", "LSD", "Hash", "Cocaine","Heroin"];
  const prices = {
    Cocaine: { min: 1475, max: 2950 },
    Heroin: { min: 2050, max: 3500 },
    Ecstacy: { min: 20, max: 60 },
    Morphine: { min: 15, max: 40},
    LSD: { min: 150, max: 350 },
    Hash: { min: 125, max: 400 },
    //crack: { min: 100, max: 250 },
  };

  let players = [];
  let currentPlayerIndex = 0;

  class Player {
    static nextId = 1;
    constructor(name, cash, city = null) {
      this.id = Player.nextId++;
      this.name = name;
      this.cash = cash;
      this.city = city;
      this.inventory = {}; // Empty object to store drugs and their quantities
    }
    getNetWorth(averagePrices) {
      let netWorth = this.cash;
      for (const [drug, quantity] of Object.entries(this.inventory)) {
        if (averagePrices[drug]) {
          netWorth += averagePrices[drug] * quantity;
        }
      }
      return netWorth;
    }

  }
  const getRandomPrice = (min, max) =>
    Math.round((Math.random() * (max - min + 1) + min) / 5) * 5;



  const averagePrices = {}; // Global object to store average prices of each drug

  const updatePrices = () => {
    const formatter = new Intl.NumberFormat('en-US');
    drugsList.forEach((drug) => {
      let total = 0;
      cities.forEach((city) => {
        let cell = document.querySelector(
          `.${drug}.${city.toLowerCase().replace(/\s+/g, "-")}`
        );
        if (cell) {
          const price = getRandomPrice(prices[drug].min, prices[drug].max);
          total += price;
          const formattedPrice = formatter.format(price);
          cell.textContent = `$${formattedPrice}`;
        } else {
          console.error(`Cell for drug: ${drug} and city: ${city} not found.`);
        }
      });
      const averagePrice = Math.round(total / cities.length);
      averagePrices[drug] = averagePrice;
    });
    //console.log(averagePrices); // Log the object with average prices of each drug
  };

  
  const updatePlayerTurnDisplay = () => {
    if (players[currentPlayerIndex]) {
      document.getElementById(
        "playerTurn"
      ).textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }
  };

  const rotateTurns = () => {
    
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    let cityDisplay = document.getElementById("playerCityDisplay");
    cityDisplay.innerHTML = "";
    if (players[currentPlayerIndex]) {
      document.getElementById(
        "playerTurn"
      ).textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }
    removeCityClasses();
    updateLeaderboard();
  };



  const generateTable = () => {
    let table = document.querySelector("tbody");
    table.innerHTML = "";
    drugsList.forEach((drug) => {
      let row = document.createElement("tr");
      let drugCell = document.createElement("td");
      drugCell.innerHTML = `
<b>${drug.charAt(0).toUpperCase() + drug.slice(1)}</b><br>
<button class="buy-btn" data-drug="${drug}">Buy</button>
<button class="sell-btn" data-drug="${drug}">Sell</button>`;
      row.appendChild(drugCell);
      cities.forEach((city) => {
        let cell = document.createElement("td");
        cell.classList.add(drug, city.toLowerCase().replace(/\s+/g, "-"));
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
  };

  const generateTableHeaders = () => {
    let headerRow = document.querySelector("thead tr");
    while (headerRow.children.length > 1) {
      headerRow.removeChild(headerRow.lastChild);
    }
    cities.forEach((city) => {
      let header = document.createElement("th");
      header.textContent = city;
      header.addEventListener("click", () => setPlayerCity(city));
      headerRow.appendChild(header);
    });
  };

  const setPlayerCity = (cityName) => {
    players[currentPlayerIndex].city = cityName;
    document.getElementById(
      "playerCityDisplay"
    ).textContent = `${players[currentPlayerIndex].name} is in ${cityName}`;

    // Remove highlight and notactive classes from all headers and cells
    document.querySelectorAll("thead th, td").forEach((element) => {
      element.classList.remove("highlight-city", "notactive-city");
    });

    // Add highlight class to selected city header and cells, and notactive class to others
    let columnIndex = cities.indexOf(cityName) + 2;
    if (columnIndex > 1) {
      let selectedHeader = document.querySelector(`thead th:nth-child(${columnIndex})`);
      selectedHeader.classList.add("highlight-city");
      document.querySelectorAll(`td:nth-child(${columnIndex})`).forEach((cell) => {
        cell.classList.add("highlight-city");
      });
      document.querySelectorAll(`thead th:not(:nth-child(${columnIndex})):not(:nth-child(1)), td:not(:nth-child(${columnIndex})):not(:nth-child(1))`).forEach((element) => {
        element.classList.add("notactive-city");
      });
    }
  };

  const removeCityClasses = () => {
    document.querySelectorAll("td, th").forEach((element) => {
      element.classList.remove("highlight-city", "notactive-city");
    });
  };
  
  const setupEventListeners = () => {
    document.getElementById("startGame").addEventListener("click", function () {
      let numPlayers = document.getElementById("playerSelect").value;
      let startingCash =
        parseInt(document.getElementById("startCash").value) || 0;
      document.querySelectorAll(".player-input").forEach((container, index) => {
        if (index < numPlayers) {
          container.style.display = "block";
          let cashDisplay = document.createElement("div");
          cashDisplay.classList.add("player-cash-display");
          cashDisplay.textContent = `$${startingCash}`;
          container.appendChild(cashDisplay);
        }
      });
      document.getElementById("startContainer").style.display = "none";
      document.querySelector(".game-container").style.display = "block";
      document.getElementById("eventcard").style.display = "flex";
      document.querySelector(".leaderboard-container").style.display = "block";
      document.querySelector(".debug-container").style.display = "block";
    });

    document.getElementById("roll-button").addEventListener("click", function () {
      if(players.length < 1) {
        alert('You need to add at least one player first.');
        return;
      }
      else {
      
      updatePrices();
      rotateTurns();
      updateCashDisplay(players);
      }
    });
    document.getElementById("dayJob").addEventListener("click", function () {
      const currentPlayer = players[currentPlayerIndex];
      currentPlayer.cash += 200;
      const playerCashDisplay = document.querySelector(
        `#player-container .player-input:nth-child(${
          currentPlayerIndex + 1
        }) .player-cash-display`
      );
      if (playerCashDisplay) {
        playerCashDisplay.textContent = `$${currentPlayer.cash}`;
      } else {
        console.error("Could not find player cash display element");
      }
      
      updatePrices();
      rotateTurns();
      updateCashDisplay(players);
    });

    

    document.querySelectorAll(".player-name-field").forEach((inputField) => {
    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            let enteredName = inputField.value;
            if (!players.some((p) => p.name === enteredName)) {
                let startingCash =
                    parseInt(document.getElementById("startCash").value) || 0;
                players.push(new Player(enteredName, startingCash));
                let inputContainer = inputField.closest(".player-name-input");
                let nameLabel = document.createElement("label");
                let playerPicture = document.createElement("div");
                let weightLabel = document.createElement("label");
                playerPicture.classList.add("player-picture");
                //weightLabel.classList.add("player-weight-label");
                //nameLabel.textContent = `Name: ${enteredName}`;
                nameLabel.textContent = `${enteredName}`;
                nameLabel.classList.add("player-name-label");
                inputContainer.replaceChild(nameLabel, inputField);
                inputContainer.appendChild(playerPicture);
                //inputContainer.appendChild(weightLabel);
                inputContainer.style.display = "flex";
                inputContainer.style.justifyContent = "space-around";
                updatePlayerTurnDisplay();
                setupPlayerPictures();
                updateLeaderboard();
                
                
            }
        }
    });
    });
  };

  function setupBuyButtons() {
    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const drugType = this.getAttribute("data-drug");
        const currentPlayer = players[currentPlayerIndex];
        const playerCity = currentPlayer.city;
         // Calculate total items in the inventory
        const totalItems = calculateTotalItems(currentPlayer.inventory);

        // Handle the case where the player doesn't have a city set yet
        if (!playerCity) {
          alert(`${currentPlayer.name}, you need to select a city first.`);
          return;
        }

        const cellClass = `${drugType}.${playerCity
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const cell = document.querySelector(`.${cellClass}`);

        if (!cell) {
          console.error(`Could not find cell for ${drugType} in ${playerCity}`);
          return;
        }

        const price = parseInt(cell.textContent.replace(/[^0-9]/g, ""), 10);

        const quantity = event.ctrlKey ? 5 : 1;

        // Check if the player has 100 or more items
        if (totalItems + quantity > 100) {
          alert('You cannot have more than 100 items in your inventory.');
          return;
        }

        if (!event.shiftKey) {
          if (currentPlayer.cash < price * quantity) {
            alert(`You don't have enough cash to buy ${quantity} ${drugType}(s).`);
            return;
          }
          currentPlayer.cash -= price * quantity;
        }

        if (!currentPlayer.inventory[drugType]) {
          currentPlayer.inventory[drugType] = 0;
        }
        currentPlayer.inventory[drugType] += quantity;

        // Update player cash on the display
        const playerCashDisplay = document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-cash-display`
        );
        if (playerCashDisplay && !event.shiftKey) {
          playerCashDisplay.textContent = `$${currentPlayer.cash}`;
        } else {
          console.error("Could not find player cash display element");
        }
        const playerInventoryDisplay = document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-inventory`
        );
        if (!playerInventoryDisplay) {
          const inventoryDiv = document.createElement("div");
          inventoryDiv.classList.add("player-inventory");
          document
            .querySelector(
              `#player-container .player-input:nth-child(${
                currentPlayerIndex + 1
              })`
            )
            .appendChild(inventoryDiv);
        }
        document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-inventory`).innerHTML =
        Object.entries(currentPlayer.inventory)
        .filter(([_, quantity]) => quantity > 0)  // filter out items with zero count
        .map(([drug, quantity]) => `${drug}: ${quantity}`)
        .join('<br>');
        updatePlayerContainer(currentPlayer, currentPlayerIndex);
      });
    });
    document.querySelectorAll(".sell-btn").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        const drugType = this.dataset.drug;
        const currentPlayer = players[currentPlayerIndex];
        const currentCity = currentPlayer.city.toLowerCase().replace(/\s+/g, "-");
        const priceCell = document.querySelector(`.${drugType}.${currentCity}`);

        if (!priceCell) {
          console.error(`Price cell for drug: ${drugType} and city: ${currentCity} not found.`);
          return;
        }

        const sellingPrice = parseInt(priceCell.textContent.replace("$", ""));

        const quantity = event.ctrlKey ? 5 : 1;

        if (event.shiftKey) {
          if (!currentPlayer.inventory[drugType] || currentPlayer.inventory[drugType] < quantity) {
            alert(`You don't have ${quantity} ${drugType}(s) to remove.`);
            return;
          }
          currentPlayer.inventory[drugType] -= quantity;
        } else {
          if (!currentPlayer.inventory[drugType] || currentPlayer.inventory[drugType] < quantity) {
            alert(`You don't have ${quantity} ${drugType}(s) to sell.`);
            return;
          }
          currentPlayer.cash += sellingPrice * quantity;
          currentPlayer.inventory[drugType] -= quantity;
        }

        // Update cash in UI
        const cashDisplay = document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-cash-display`);
        if (cashDisplay && !event.shiftKey) {
          cashDisplay.textContent = `$${currentPlayer.cash}`;
        }

        // Update inventory in UI
        document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-inventory`).innerHTML =
        Object.entries(currentPlayer.inventory)
        .filter(([_, quantity]) => quantity > 0)  // filter out items with zero count
        .map(([drug, quantity]) => `${drug}: ${quantity}`)
        .join('<br>');
        updatePlayerContainer(currentPlayer, currentPlayerIndex);
      });
    });
  }
  function updateCashDisplay(players) {
    const container = document.querySelector('.cash-variables');
    container.innerHTML = ''; // Clear the previous content
  
    players.forEach((player, index) => {
        // Create a label for the player name
        const nameLabel = document.createElement('label');
        nameLabel.innerHTML = player.name;
        container.appendChild(nameLabel);
  
        // Create an input box for the player's cash
        const cashInput = document.createElement('input');
        cashInput.type = 'number';
        cashInput.value = player.cash;
        cashInput.addEventListener('change', (e) => {
            players[index].cash = parseFloat(e.target.value);
            updatePlayerCashDisplay(index);
            
        });
  
        container.appendChild(cashInput);
    });
  }
  function updatePlayerCashDisplay() {
    const playerContainers = document.querySelectorAll('#player-container .player-input');
    playerContainers.forEach((container, index) => {
      const currentPlayer = players[index];
      const playerCashDisplay = container.querySelector('.player-cash-display');
      if (playerCashDisplay) {
        playerCashDisplay.textContent = `$${currentPlayer.cash}`;
      } else {
        console.error("Could not find player cash display element");
      }
    });
  }
  const noSelectElements = document.querySelectorAll('.no-select');

  noSelectElements.forEach(element => {
      element.addEventListener('selectstart', event => {
          event.preventDefault();
      });
  });
  
  function setupPlayerPictures() {
  const playerPictures = document.querySelectorAll(".player-picture");

    playerPictures.forEach((pictureElement, index) => {
      console.log("Setting player pictures")
        // Assign each picture with the corresponding png file. Assuming they are in the root directory.
        const imgPath = `img/characters/${index + 1}.png`; // it will be 1.png for the first element, 2.png for the second, and so on.
        pictureElement.style.backgroundImage = `url('${imgPath}')`;
        pictureElement.style.backgroundSize = 'cover'; // This ensures the image covers the entire div.
    });

  }
// Utility functions
function calculateTotalItems(inventory) {
  return Object.values(inventory).reduce((total, quantity) => total + quantity, 0);
}

function updatePlayerContainer(currentPlayer, currentPlayerIndex) {
  const cashDisplay = document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-cash-display`);
  if (cashDisplay) {
    cashDisplay.textContent = `$${currentPlayer.cash}`;
  }

  const totalItems = calculateTotalItems(currentPlayer.inventory);
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--inventory-label', `"Weight: ${totalItems}/100"`);

  const inventoryDisplay = document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-inventory`);
  //const weightDisplay = document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-picture`);
  if (inventoryDisplay) {
    inventoryDisplay.innerHTML = 
      Object.entries(currentPlayer.inventory)
        .filter(([_, quantity]) => quantity > 0)
        .map(([drug, quantity]) => `${drug}: ${quantity}`)
        .join('<br>');

  }

}

document.querySelector('.debug-toggle').addEventListener('click', function() {
  const content = document.querySelector('.debug-content');
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
  } else {
    content.style.display = 'none';
  }
});

// Show the popup when the event card is clicked
document.getElementById('eventcard').addEventListener('click', function() {
  const popup = document.getElementById('eventcard-popup');
  popup.style.display = 'flex';
  // Clear existing text
  let eventTextElement = document.querySelector("#event-text-container p");
  eventTextElement.innerHTML = '<br>';
  /*
  You find $500 on the street.

- Receive $500*/
  typeWriter(eventTextElement, "You find $500 on the street. \n \n \n \n - Receive $500");

});

// Hide the popup when clicked
document.getElementById('eventcard-popup').addEventListener('click', function() {
  this.style.display = 'none';
});

function typeWriter(element, text, i = 0, speed = 30) {
  if (i < text.length) {
    const char = text.charAt(i);
    if (char === '\n') {
      element.innerHTML += '<br>';
    } else {
      element.innerHTML += char;
    }
    i++;
    setTimeout(() => typeWriter(element, text, i, speed), speed);
  }
}
const updateLeaderboard = () => {
  const leaderboardContainer = document.querySelector('.leaderboard');
  leaderboardContainer.innerHTML = ''; // Clear the existing leaderboard
  
  // Calculate net worth for each player
  players.forEach((player) => {
    player.netWorth = player.getNetWorth(averagePrices);
  });

  // Sort players by net worth
  const sortedPlayers = players.slice().sort((a, b) => b.netWorth - a.netWorth);

  // Add each player to the leaderboard
  sortedPlayers.forEach((player, index) => {
    const container = document.createElement('div');
    container.classList.add('leaderboard-entry');
    const entry = document.createElement('div');
    entry.textContent = `${index + 1}.`;
    const netWorth = document.createElement('div');
    if (player.netWorth > 250000) {
      netWorth.textContent = `★★★★★ - Drug Lord`;
    }
    else if (player.netWorth > 100000) {
      netWorth.textContent = `★★★★ - Kingpin`;
    }
    else if (player.netWorth > 50000) {
      netWorth.textContent = `★★★ - Dealer`;
    }
    else if (player.netWorth > 10000) {
      netWorth.textContent = `★★ - Pusher`;
    }
    else {
      netWorth.textContent = `★ - Rookie`;
    }
   
    //entry.textContent = `${index + 1}. ${player.name} - $${player.netWorth}`;
    container.appendChild(entry);
    const characterImage = document.createElement('div');
    characterImage.classList.add('player-picture-leaderboard');
    characterImage.style.backgroundImage = `url('img/characters/${player.id}.png')`;
    characterImage.style.backgroundSize = 'cover';
    container.appendChild(characterImage);
    container.appendChild(netWorth);


    leaderboardContainer.appendChild(container);
  });
};








  // Initialization code
  document.addEventListener("DOMContentLoaded", function () {
    generateTableHeaders();
    generateTable();
    //updatePrices();
    setupEventListeners();
    setupBuyButtons();
    
  });
})();


