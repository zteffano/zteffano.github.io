(function () {
  const cities = ["East Harlem", "Brooklyn", "Manhattan", "Queens"];
  //const drugsList = ["cocaine", "heroin", "ecstacy", "LSD", "hash","morphine"];
  const drugsList = ["morphine", "ecstacy", "crack", "LSD", "hash", "cocaine","heroin"];
  const prices = {
    cocaine: { min: 1475, max: 2950 },
    heroin: { min: 2050, max: 3500 },
    ecstacy: { min: 20, max: 60 },
    morphine: { min: 15, max: 40},
    LSD: { min: 150, max: 350 },
    hash: { min: 125, max: 400 },
    crack: { min: 100, max: 250 },
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
    });

    document.getElementById("roll-button").addEventListener("click", function () {
      
      updatePrices();
      rotateTurns();
      updateCashDisplay(players);
      
    });
    document.getElementById("dayJob").addEventListener("click", function () {
      const currentPlayer = players[currentPlayerIndex];
      currentPlayer.cash += 100;
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
                playerPicture.classList.add("player-picture");
                //nameLabel.textContent = `Name: ${enteredName}`;
                nameLabel.textContent = `${enteredName}`;
                nameLabel.classList.add("player-name-label");
                inputContainer.replaceChild(nameLabel, inputField);
                inputContainer.appendChild(playerPicture);
                inputContainer.style.display = "flex";
                inputContainer.style.justifyContent = "space-around";
                updatePlayerTurnDisplay();
                setupPlayerPictures();
                
                
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
        document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-inventory`
        ).innerHTML = Object.entries(currentPlayer.inventory)
          .map(([drug, quantity]) => `${drug}: ${quantity}`)
          .join("<br>");
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
          Object.entries(currentPlayer.inventory).map(([drug, quantity]) => `${drug}: ${quantity}`).join('<br>');
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

  // Initialization code
  document.addEventListener("DOMContentLoaded", function () {
    generateTableHeaders();
    generateTable();
    updatePrices();
    setupEventListeners();
    setupBuyButtons();
  });
})();


