(function () {
  const cities = ["East Harlem", "Brooklyn", "Manhattan", "Queens"];
  const drugsList = ["cocaine", "heroin", "ecstacy", "lsd", "hash"];
  const prices = {
    cocaine: { min: 4000, max: 12000 },
    heroin: { min: 5000, max: 15000 },
    ecstacy: { min: 200, max: 500 },
    lsd: { min: 1500, max: 3500 },
    hash: { min: 1000, max: 4000 },
  };

  let players = [];
  let currentPlayerIndex = 0;

  class Player {
    constructor(name, cash, city = null) {
      this.name = name;
      this.cash = cash;
      this.city = city;
      this.inventory = {}; // Empty object to store drugs and their quantities
    }
  }

  const getRandomPrice = (min, max) =>
    Math.round((Math.random() * (max - min + 1) + min) / 100) * 100;

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const updatePrices = () => {
    drugsList.forEach((drug) => {
      cities.forEach((city) => {
        let cell = document.querySelector(
          `.${drug}.${city.toLowerCase().replace(/\s+/g, "-")}`
        );
        cell
          ? (cell.textContent = `$${getRandomPrice(
              prices[drug].min,
              prices[drug].max
            )}`)
          : console.error(
              `Cell for drug: ${drug} and city: ${city} not found.`
            );
      });
    });
  };

  const rotateTurns = () => {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    if (players[currentPlayerIndex]) {
      document.getElementById(
        "playerTurn"
      ).textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }
  };

  const updatePlayerTurnDisplay = () => {
    if (players[currentPlayerIndex]) {
      document.getElementById(
        "playerTurn"
      ).textContent = `It's ${players[currentPlayerIndex].name}'s turn!`;
    }
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
    });

    document.getElementById("rollDice").addEventListener("click", function () {
      const diceVal = rollDice();
      document.getElementById(
        "diceResult"
      ).textContent = `You rolled a ${diceVal}!`;
      updatePrices();
      rotateTurns();
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
                //nameLabel.textContent = `Name: ${enteredName}`;
                nameLabel.textContent = `${enteredName}`;
                nameLabel.classList.add("player-name-label");
                inputContainer.replaceChild(nameLabel, inputField);
                updatePlayerTurnDisplay();
            }
        }
    });
    });
  };

  function setupBuyButtons() {
    const buyButtons = document.querySelectorAll(".buy-btn");

    buyButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const drugType = this.getAttribute("data-drug");
        const currentPlayer = players[currentPlayerIndex];
        const playerCity = currentPlayer.city;

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

        if (currentPlayer.cash < price) {
          alert(`You don't have enough cash to buy ${drugType}.`);
          return;
        }

        currentPlayer.cash -= price;
        if (!currentPlayer.inventory[drugType]) {
          currentPlayer.inventory[drugType] = 0;
        }
        currentPlayer.inventory[drugType]++;

        // Update player cash on the display
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
        document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-inventory`
        ).innerHTML = Object.entries(currentPlayer.inventory)
          .map(([drug, quantity]) => `${drug}: ${quantity}`)
          .join("<br>");
      });
    });
    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const drugType = this.dataset.drug;
            const currentPlayer = players[currentPlayerIndex];
            const currentCity = currentPlayer.city.toLowerCase().replace(/\s+/g, '-');
            const priceCell = document.querySelector(`.${drugType}.${currentCity}`);
            
            if (!priceCell) {
                console.error(`Price cell for drug: ${drugType} and city: ${currentCity} not found.`);
                return;
            }
            
            const sellingPrice = parseInt(priceCell.textContent.replace('$', ''));
            
            // Check if player has the drug in inventory
            if (currentPlayer.inventory[drugType] && currentPlayer.inventory[drugType] > 0) {
                currentPlayer.cash += sellingPrice;
                currentPlayer.inventory[drugType]--;
                
                // Update cash in UI
                const cashDisplay = document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-cash-display`);
                cashDisplay.textContent = `$${currentPlayer.cash}`;
                
                // Update inventory in UI
                document.querySelector(`#player-container .player-input:nth-child(${currentPlayerIndex + 1}) .player-inventory`).innerHTML = 
                    Object.entries(currentPlayer.inventory).map(([drug, quantity]) => `${drug}: ${quantity}`).join('<br>');
            } else {
                alert(`You don't have any ${drugType} to sell.`);
            }
        });
    });
  }

  // Initialization code
  document.addEventListener("DOMContentLoaded", function () {
    generateTableHeaders();
    generateTable();
    updatePrices();
    setupEventListeners();
    setupBuyButtons();
  });
})();
