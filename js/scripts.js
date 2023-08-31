(function () {
  let currentDay = 1;
  let winner;
  // Active events
  let activeEvents = [];
  const cities = ["East Harlem", "Brooklyn", "Manhattan", "Queens"];
  //const drugsList = ["cocaine", "heroin", "ecstacy", "LSD", "hash","morphine"];
  const drugsList = ["Morphine", "Ecstacy", "LSD", "Hash", "Cocaine", "Heroin"];
  const basePrices = {
    Cocaine: { min: 1475, max: 2950 },
    Heroin: { min: 2050, max: 3500 },
    Ecstacy: { min: 20, max: 60 },
    Morphine: { min: 15, max: 40 },
    LSD: { min: 150, max: 350 },
    Hash: { min: 125, max: 400 },
    //crack: { min: 100, max: 250 },
  };


  let prices = {
    Cocaine: { min: 1475, max: 2950 },
    Heroin: { min: 2050, max: 3500 },
    Ecstacy: { min: 20, max: 60 },
    Morphine: { min: 15, max: 40 },
    LSD: { min: 150, max: 350 },
    Hash: { min: 125, max: 400 },
    //crack: { min: 100, max: 250 },
  };
  const cardModifiers = {
    "Rookie": 0.8,
    "Dealer": 1,
    "Pusher": 1.2,
    "Boss": 1.4,
    "Kingpin": 1.6,
    "Drug Lord": 2.5,
  };

  var players = []; // global array to store players
  var currentPlayerIndex = 0; // global variable to store the index of the current player

  class Player {
    static nextId = 1;
    constructor(name, cash, city = null, gender, title = "Rookie") {
      this.id = Player.nextId++;
      this.name = name;
      this.cash = cash;
      this.bankCash = 0; // new property to store bank cash
      this.city = city;
      this.gender = gender;
      this.title = "";
      this.inventory = {}; // Empty object to store drugs and their quantities
      this.netWorthHistory = []; // Array to store net worth over time
      this.drugLordDays = 1;
    }
    getNetWorth(averagePrices) {
      let netWorth = this.cash + this.bankCash; // include bank cash in net worth calculation
      for (const [drug, quantity] of Object.entries(this.inventory)) {
        if (averagePrices[drug]) {
          netWorth += averagePrices[drug] * quantity;
        }
      }
      //if its the current players turn then add the net worth to the net worth history
      if (players[currentPlayerIndex] === this) {
        this.netWorthHistory.push(netWorth);
        this.roundActions(); // cause this runs every turn, we can put any code that needs to run every turn here
      }
      return netWorth;
    }
    depositToBank(amount) {
      if (this.cash >= amount) {
        this.cash -= amount;
        this.bankCash += amount;
        return true;
      } else {
        return false;
      }
    }
    withdrawFromBank(amount) {
      if (this.bankCash >= amount) {
        this.bankCash -= amount;
        this.cash += amount;
        return true;
      } else {
        return false;
      }
    }
    roundActions() {
      // Check if the player is a drug lord
      if (this.netWorth >= 100000) {
        this.drugLordDays += 1;
      } else {
        this.drugLordDays = 1;
      }
    }
  }

  const getRandomPrice = (min, max) =>
    Math.round((Math.random() * (max - min + 1) + min) / 5) * 5;

  const averagePrices = {}; // Global object to store average prices of each drug

  const updatePrices = () => {
    const formatter = new Intl.NumberFormat('en-US');
    prices = JSON.parse(JSON.stringify(basePrices));
    console.log("basePrices: ", basePrices);
    console.log("prices: ", prices);
    console.log("activeEvents: ", activeEvents);
    // Apply each active event to update prices
    activeEvents.forEach((event) => {
      let drug = event.item;
      if (prices[drug]) {  // Make sure the drug exists in the prices object
        let minPrice = prices[drug].min;
        let maxPrice = prices[drug].max;
    
        // Update the price
        prices[drug].min = minPrice + minPrice * event.amount;
        prices[drug].max = maxPrice + maxPrice * event.amount;
    
        // Decrement the event duration
        event.duration--;
    
        // Remove events that have ended
        if (event.duration <= 0) {
          const index = activeEvents.indexOf(event);
          if (index > -1) {
            activeEvents.splice(index, 1);
          }
        }
      }
    });
  
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
      if (currentPlayerIndex === 0) {
        currentDay += 1;
      }
      // add focus to current player's player container
      const playerContainers = document.querySelectorAll(".player-input");
      playerContainers.forEach((container, index) => {
        if (index === currentPlayerIndex) {
          container.classList.add("current-player");
        } else {
          container.classList.remove("current-player");
        }
      });
    }
    console.log("Current Day: ", currentDay);
    removeCityClasses();
    updateLeaderboard();
    populatePlayerDropdowns();
    generateNetWorthLineChart(players);
    document.getElementById("dayDisplay").textContent = `Day: ${currentDay}`;
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
      let selectedHeader = document.querySelector(
        `thead th:nth-child(${columnIndex})`
      );
      selectedHeader.classList.add("highlight-city");
      document
        .querySelectorAll(`td:nth-child(${columnIndex})`)
        .forEach((cell) => {
          cell.classList.add("highlight-city");
        });
      document
        .querySelectorAll(
          `thead th:not(:nth-child(${columnIndex})):not(:nth-child(1)), td:not(:nth-child(${columnIndex})):not(:nth-child(1))`
        )
        .forEach((element) => {
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
      startingCash = Math.min(Math.max(startingCash, 0), 3000);
      document.querySelectorAll(".player-input").forEach((container, index) => {
        if (index < numPlayers) {
          container.style.display = "block";
          let cashDisplay = document.createElement("div");
          let playerInventory = document.createElement("div");
          let bankingCashDisplay = document.createElement("div"); // create new element for banking cash display
          playerInventory.classList.add("player-inventory");
          cashDisplay.classList.add("player-cash-display");
          bankingCashDisplay.classList.add("banking-cash-display"); // add class to the new element
          cashDisplay.textContent = `$${startingCash}`;
          bankingCashDisplay.textContent = `Bank:$0`; // set initial value for banking cash display
          container.appendChild(cashDisplay);
          container.appendChild(bankingCashDisplay); // append the new element to the player container
          container.appendChild(playerInventory);
        }
      });
      document.getElementById("startContainer").style.display = "none";
      document.querySelector(".game-container").style.display = "block";
      document.getElementById("eventcard").style.display = "flex";
      document.querySelector(".leaderboard-container").style.display = "block";
      document.querySelector(".debug-container").style.display = "block";
      document.querySelector("#game-title").style.fontSize = "4em";
    });

    document
      .getElementById("roll-button")
      .addEventListener("click", function () {
        if (players.length < 1) {
          alert("You need to add at least one player first.");
          return;
        } else {
          updatePrices();
          rotateTurns();
          updatePlayerCashDisplay();
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
            // Find input and gender select containers
            let inputContainer = inputField.closest(".player-name-input");
            let genderSelect = inputContainer.querySelector(
              ".player-gender-select"
            );

            // Get the gender from the select field
            let selectedGender = genderSelect.value;

            // Get the starting cash
            let startingCash =
              parseInt(document.getElementById("startCash").value) || 0;

            // Create the new Player object and add to the players array
            players.push(
              new Player(enteredName, startingCash, null, selectedGender)
            );

            // Hide the gender select field
            genderSelect.style.display = "none";

            // Create new elements and labels
            let nameLabel = document.createElement("label");
            let playerPicture = document.createElement("div");

            // Setup the new elements and labels
            nameLabel.textContent = `${enteredName}`;
            nameLabel.classList.add("player-name-label");
            playerPicture.classList.add("player-picture");

            // Replace and append elements
            inputContainer.replaceChild(nameLabel, inputField);
            inputContainer.appendChild(playerPicture);

            // Update the layout and content
            inputContainer.style.display = "flex";
            inputContainer.style.justifyContent = "space-around";

            updatePlayerTurnDisplay();
            setupPlayerPictures();
            updateLeaderboard();
            document.querySelector(".leaderboard-container").style.display = "block"; // temp fix for leaderboard random disappearing -_-
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
          alert("You cannot have more than 100 items in your inventory.");
          return;
        }

        if (!event.shiftKey) {
          if (currentPlayer.cash < price * quantity) {
            alert(
              `You don't have enough cash to buy ${quantity} ${drugType}(s).`
            );
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
          .filter(([_, quantity]) => quantity > 0) // filter out items with zero count
          .map(([drug, quantity]) => `${drug}: ${quantity}`)
          .join("<br>");
        updateAllPlayerContainers();
      });
    });
    document.querySelectorAll(".sell-btn").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        const drugType = this.dataset.drug;
        const currentPlayer = players[currentPlayerIndex];
        const currentCity = currentPlayer.city
          .toLowerCase()
          .replace(/\s+/g, "-");
        const priceCell = document.querySelector(`.${drugType}.${currentCity}`);

        if (!priceCell) {
          console.error(
            `Price cell for drug: ${drugType} and city: ${currentCity} not found.`
          );
          return;
        }

        const sellingPrice = parseInt(
          priceCell.textContent.replace(/,/g, "").replace("$", "")
        );

        const quantity = event.ctrlKey ? 5 : 1;

        if (event.shiftKey) {
          if (
            !currentPlayer.inventory[drugType] ||
            currentPlayer.inventory[drugType] < quantity
          ) {
            alert(`You don't have ${quantity} ${drugType}(s) to remove.`);
            return;
          }
          currentPlayer.inventory[drugType] -= quantity;
        } else {
          if (
            !currentPlayer.inventory[drugType] ||
            currentPlayer.inventory[drugType] < quantity
          ) {
            alert(`You don't have ${quantity} ${drugType}(s) to sell.`);
            return;
          }
          currentPlayer.cash += sellingPrice * quantity;
          currentPlayer.inventory[drugType] -= quantity;
        }

        // Update cash in UI
        const cashDisplay = document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-cash-display`
        );
        if (cashDisplay && !event.shiftKey) {
          cashDisplay.textContent = `$${currentPlayer.cash}`;
        }

        // Update inventory in UI
        document.querySelector(
          `#player-container .player-input:nth-child(${
            currentPlayerIndex + 1
          }) .player-inventory`
        ).innerHTML = Object.entries(currentPlayer.inventory)
          .filter(([_, quantity]) => quantity > 0) // filter out items with zero count
          .map(([drug, quantity]) => `${drug}: ${quantity}`)
          .join("<br>");
        updateAllPlayerContainers();
      });
    });
  }
  function updateCashDisplay(players) {
    const container = document.querySelector(".cash-variables");
    container.innerHTML = ""; // Clear the previous content

    players.forEach((player, index) => {
      // Create a label for the player name
      const nameLabel = document.createElement("label");
      nameLabel.innerHTML = player.name;
      container.appendChild(nameLabel);

      // Create an input box for the player's cash
      const cashInput = document.createElement("input");
      cashInput.type = "number";
      cashInput.value = player.cash;
      cashInput.addEventListener("change", (e) => {
        players[index].cash = parseFloat(e.target.value);
        updatePlayerCashDisplay(index);
      });

      container.appendChild(cashInput);
    });
  }
  function updatePlayerCashDisplay() {
    const playerContainers = document.querySelectorAll(
      "#player-container .player-input"
    );

    playerContainers.forEach((container, index) => {
      const currentPlayer = players[index]; // Getting the player object from the global 'players' array

      // Update player cash display
      const playerCashDisplay = container.querySelector(".player-cash-display");
      if (playerCashDisplay) {
        playerCashDisplay.textContent = `$${currentPlayer.cash}`; // Using currentPlayer.cash
      } else {
        console.error("Could not find player cash display element");
      }

      // Update player bank cash display
      const playerBankDisplay = container.querySelector(
        ".banking-cash-display"
      );
      if (playerBankDisplay) {
        playerBankDisplay.textContent = `Bank: $${currentPlayer.bankCash}`; // Using currentPlayer.bankCash
      } else {
        console.error("Could not find player bank display element");
      }
    });
  }

  const noSelectElements = document.querySelectorAll(".no-select");

  noSelectElements.forEach((element) => {
    element.addEventListener("selectstart", (event) => {
      event.preventDefault();
    });
  });

  function setupPlayerPictures() {
    const playerPictures = document.querySelectorAll(".player-picture");
    const playerGenders = document.querySelectorAll(".player-gender-select"); // Collect the gender selects

    playerPictures.forEach((pictureElement, index) => {
      console.log("Setting player pictures");

      // Get the selected gender for the current player
      const selectedGender = playerGenders[index].value;

      let imgPath;
      if (selectedGender === "male") {
        imgPath = `img/characters/${index + 1}.png`;
      } else if (selectedGender === "female") {
        imgPath = `img/characters/${index + 1}f.png`;
      }

      // Assign each picture with the corresponding png file based on gender.
      pictureElement.style.backgroundImage = `url('${imgPath}')`;
      pictureElement.style.backgroundSize = "cover"; // This ensures the image covers the entire div.
    });
  }

  // Utility functions
  function calculateTotalItems(inventory) {
    return Object.values(inventory).reduce(
      (total, quantity) => total + quantity,
      0
    );
  }

  function updateAllPlayerContainers() {
    players.forEach((player, index) => {
      // Update inventory in UI for each player
      document.querySelector(
        `#player-container .player-input:nth-child(${
          index + 1
        }) .player-inventory`
      ).innerHTML = Object.entries(player.inventory)
        .filter(([_, quantity]) => quantity > 0) // filter out items with zero count
        .map(([drug, quantity]) => `${drug}: ${quantity}`)
        .join("<br>");
    });
  }

  document
    .querySelector(".debug-toggle")
    const debugToggle = document.querySelector(".debug-toggle");
    
    debugToggle.addEventListener("dblclick", function () {
      const content = document.querySelector(".debug-content");
      if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        debugToggle.style.color = "var(--primary-color)";
        
      } else {
        content.style.display = "none";
        debugToggle.style.color = "black";
      }
    });

  const updateLeaderboard = () => {
    const leaderboardContainer = document.querySelector(".leaderboard");
    leaderboardContainer.innerHTML = ""; // Clear the existing leaderboard

    // Calculate net worth for each player
    if (currentDay > 1) {
      players.forEach((player) => {
        player.netWorth = player.getNetWorth(averagePrices);
      });
    }
    // Sort players by net worth
    const sortedPlayers = players
      .slice()
      .sort((a, b) => b.netWorth - a.netWorth);

    // Add each player to the leaderboard
    sortedPlayers.forEach((player, index) => {
      const container = document.createElement("div");
      container.classList.add("leaderboard-entry");
      const entry = document.createElement("div");
      entry.textContent = `${index + 1}.`;
      const netWorth = document.createElement("div");
      if (player.netWorth > 100000) {
        netWorth.textContent = `★★★★★★ - Drug Lord(${player.drugLordDays})`;
        netWorth.classList.add("drug-lord-title");
        player.title = "Drug Lord";
        if (player.drugLordDays >= 5) {
          if (!winner) {
            winner = player;
            localStorage.setItem("winnerName", player.name);

            //players picture path
            if (winner.gender == "male") {
              localStorage.setItem(
                "winnerPicture",
                `img/characters/${player.id}.png`
              );
            } else {
              localStorage.setItem(
                "winnerPicture",
                `img/characters/${player.id}f.png`
              );
            }
          }
          const endGameButton = document.createElement("button");
          endGameButton.textContent = "End Game";
          endGameButton.classList.add("end-game-button");
          endGameButton.addEventListener("click", function () {
            // Add your end game logic here
            // Saving players array to local storage
            localStorage.setItem("playersData", JSON.stringify(players));
            console.log(localStorage.getItem("playersData"));

            generateNetWorthLineChart(players);

            // Open the newspaper popup
            const popupWidth = 800;
            const popupHeight = 600;
            const left = (window.innerWidth - popupWidth) / 2;
            const top = (window.innerHeight - popupHeight) / 2;
            const popupWindow = document.createElement("iframe");
            popupWindow.src = "end-newspaper.html";
            popupWindow.style.width = `${popupWidth}px`;
            popupWindow.style.height = `${popupHeight}px`;
            popupWindow.style.position = "absolute";
            popupWindow.style.left = `${left}px`;
            popupWindow.style.top = `${top}px`;
            popupWindow.style.border = "none";
            document.body.appendChild(popupWindow);

            // Wait for 5 seconds and then redirect to end.html
            setTimeout(() => {
              window.location.href = "end.html";
            }, 8000);
          });
          leaderboardContainer.appendChild(endGameButton);
        }
      } else if (player.netWorth >= 50000) {
        netWorth.textContent = `★★★★★ - Kingpin`;
        player.title = "Kingpin";
      } else if (player.netWorth >= 20000) {
        netWorth.textContent = `★★★★ - Boss`;
        player.title = "Boss";
      } else if (player.netWorth >= 10000) {
        netWorth.textContent = `★★★ - Pusher`;
        player.title = "Pusher";
      } else if (player.netWorth >= 3000) {
        netWorth.textContent = `★★ - Dealer`;
        player.title = "Dealer";
      } else {
        netWorth.textContent = `★ - Rookie`;
        player.title = "Rookie";
      }

      //entry.textContent = `${index + 1}. ${player.name} - $${player.netWorth}`;
      container.appendChild(entry);
      const characterImage = document.createElement("div");
      characterImage.classList.add("player-picture-leaderboard");
      console.log(player);
      if (player.gender == "male") {
        characterImage.style.backgroundImage = `url('img/characters/${player.id}.png')`;
      } else {
        characterImage.style.backgroundImage = `url('img/characters/${player.id}f.png')`;
      }
      characterImage.style.backgroundSize = "cover";
      container.appendChild(characterImage);
      container.appendChild(netWorth);

      leaderboardContainer.appendChild(container);
    });
  };

  //Event card logic

  let eventCards = [];

  fetch("cards/test_cards.json")
    .then((response) => response.json())
    .then((data) => {
      eventCards = data;
      console.log("Loaded event cards:", eventCards);
    })
    .catch((error) => console.error(error));

 
    

  // Show the popup when the event card is clicked
  document.getElementById("eventcard").addEventListener("click", function () {
    const popup = document.getElementById("eventcard-popup");
    popup.style.display = "flex";

    const eventCard = getRandomEventCard();

    let eventTextElement = document.querySelector("#event-text-container p");
    eventTextElement.innerHTML = "<br>";
    let currentPlayer = players[currentPlayerIndex];
    console.log("Current player:", currentPlayer);
    let modifier = cardModifiers[currentPlayer.title];
    console.log("Modifier:", modifier);
    let cardType = eventCard.cardType;

    if ((eventCard.type === "cash" || eventCard.type == "police-raid") && cardType.toLowerCase() === "negative") {
      let amount = eventCard.amount;
      eventCard.description = eventCard.description.replace(
        `${amount}`,
        eventCard.amount * modifier
      );
      console.log(eventCard.description);
    }

    typeWriter(eventTextElement, eventCard.description);

    popup.dataset.type = eventCard.type;
    popup.dataset.amount = eventCard.amount;
    popup.dataset.scope = eventCard.scope;
    popup.dataset.item = eventCard.item;
    popup.dataset.duration = eventCard.duration;
  });

  document
    .getElementById("eventcard-popup")
    .addEventListener("click", function () {
      this.style.display = "none";

      const type = this.dataset.type;
      const amount = parseFloat(this.dataset.amount);
      const scope = this.dataset.scope;
      const item = this.dataset.item;
      const duration = parseInt(this.dataset.duration);

      handleEventCard({ type, amount, scope, item, duration });
    });

  function handleEventCard(eventCard) {
    console.log("Handling event card:", eventCard);
    let playersToAffect = [];

    if (eventCard.scope === "current") {
      playersToAffect.push(players[currentPlayerIndex]);
    } else if (eventCard.scope === "global") {
      playersToAffect = players;
    }

    if (eventCard.type === 'drug-prices') {
      activeEvents.push({
        item: eventCard.item,
        amount: eventCard.amount,
        duration: eventCard.duration*players.length,
      });
    }

    for (const player of playersToAffect) {
      switch (eventCard.type) {
        case "cash":
          let modifier = eventCard.amount > 0 ? 1 : cardModifiers[player.title];
          player.cash += eventCard.amount * modifier;
          break;


          case "random-loss":
            console.log("Random loss event card");
            // Calculate total items in inventory
            const totalItems = Object.values(player.inventory).reduce((a, b) => a + b, 0);
            // Calculate random loss percentage (up to 35%)
            const lossPercent = Math.max(0.15,Math.random() * 0.40);
            const lossAmount = Math.floor(totalItems * lossPercent);

            // Randomly select drugs to lose
            let itemsLost = 0;
            while (itemsLost < lossAmount) { 
              let drugKeys = Object.keys(player.inventory);
              let randomDrug = drugKeys[Math.floor(Math.random() * drugKeys.length)];
          
              if (player.inventory[randomDrug] > 0) {
                player.inventory[randomDrug]--;
                itemsLost++;
              }
            }
            updateAllPlayerContainers();
            break;
          case "specific-loss":

            const specificDrug = eventCard.item;
            console.log("Specific loss event card for drug:", specificDrug)

            if (player.inventory[specificDrug]) {
              // Calculate the maximum loss for the specific drug (up to 30%)
              const maxLoss = Math.max(0.1,Math.floor(player.inventory[specificDrug] * 0.3));
              console.log("Max loss:", maxLoss)
              // If maxLoss is zero but there is some amount of the drug, set maxLoss to 1
              const adjustedMaxLoss = maxLoss === 0 && player.inventory[specificDrug] > 0 ? 1 : maxLoss;
              console.log("Adjusted max loss:", adjustedMaxLoss)
              // Randomly determine the loss amount from 1 to maxLoss
              const lossAmount = Math.floor(Math.random() * (adjustedMaxLoss - 1 + 1)) + 1;
              console.log("Loss amount:", lossAmount)
              // Reduce the drug quantity, ensuring it doesn't go negative
              console.log("Inventory before loss:", player.inventory)
              player.inventory[specificDrug] = Math.max(0, player.inventory[specificDrug] - lossAmount);
              console.log("Inventory after loss:", player.inventory)
            }
            //update the player container
            updateAllPlayerContainers();
            break;

            case "police-raid":
              console.log(player)
              eventCard.amount = eventCard.amount * cardModifiers[player.title];
              // Check if the player can pay the bribe
              if (player.cash >= eventCard.amount) {
                player.cash -= eventCard.amount;
              } else {
                // Calculate 50% loss if bribe can't be paid
                const totalItems = Object.values(player.inventory).reduce((a, b) => a + b, 0);
                const lossAmount = Math.floor(totalItems * 0.5);
                // Randomly remove items from the inventory
                let itemsLost = 0;
                while (itemsLost < lossAmount) {
                  let drugKeys = Object.keys(player.inventory);
                  let randomDrug = drugKeys[Math.floor(Math.random() * drugKeys.length)];
                  if (player.inventory[randomDrug] > 0) {
                    player.inventory[randomDrug]--;
                    itemsLost++;
                  }
                }
              }
              // Update the player container
              updateAllPlayerContainers();
              break;

        case "drugs":
          const drugType = eventCard.item;

          if (!player.inventory[drugType]) {
            player.inventory[drugType] = 0;
          }

          // Adding drugs to the inventory
          if (eventCard.amount > 0) {
            player.inventory[drugType] += eventCard.amount;
          }
          // Removing drugs from the inventory, ensuring it doesn't go negative
          else {
            player.inventory[drugType] = Math.max(
              0,
              player.inventory[drugType] + eventCard.amount
            );
          }
          //update the player container
          updateAllPlayerContainers();

          break;
        default:
          console.error("Unknown event card type:", eventCard.type);
      }
    }

    // Optionally, update UI, logs, or perform additional logic here
    updatePlayerCashDisplay();
  }

  function typeWriter(element, text, i = 0, speed = 30) {
    if (i < text.length) {
      const char = text.charAt(i);
      if (char === "\n") {
        element.innerHTML += "<br>";
      } else {
        element.innerHTML += char;
      }
      i++;
      setTimeout(() => typeWriter(element, text, i, speed), speed);
    }
  }

  function getRandomEventCard() {
    const randomIndex = Math.floor(Math.random() * eventCards.length);
    return eventCards[randomIndex];
  }

  // Function to run mini casino game
  function runGame(chosenOption) {
    const betAmount = parseInt(document.getElementById("betAmount").value);

    if (
      isNaN(betAmount) ||
      betAmount <= 0 ||
      betAmount > players[currentPlayerIndex].cash
    ) {
      alert("Please enter a valid bet amount.");
      return;
    }

    // Generate a random number between 1 and 10
    let randomNumber = Math.floor(Math.random() * 10) + 1;

    // Determine if the random number is odd or even
    const outcome = randomNumber % 2 === 0 ? "Even" : "Odd";
    console.log("Random number: ", randomNumber);
    console.log("Random number: ", randomNumber);
    console.log("Random number: ", randomNumber);
    console.log("Outcome: ", outcome);
    console.log("Chosen option: ", chosenOption);

    // Check if the player wins or loses
    if (chosenOption == outcome) {
      document.getElementById("result").textContent = `You win!`;
      // currrent player wins the bet amount
      console.log("Before win: ", players[currentPlayerIndex].cash);
      players[currentPlayerIndex].cash += betAmount;
      console.log("After win: ", players[currentPlayerIndex].cash);
    } else {
      document.getElementById("result").textContent = `You lose!`;
      // current player loses the bet amount
      console.log("Before lose: ", players[currentPlayerIndex].cash);
      players[currentPlayerIndex].cash -= betAmount;
      console.log("After lose: ", players[currentPlayerIndex].cash);
    }
    updatePlayerCashDisplay();
  }
  // Attach event listeners to the Odd and Even buttons
  document.getElementById("betOdd").addEventListener("click", function () {
    runGame("Odd");
  });

  document.getElementById("betEven").addEventListener("click", function () {
    runGame("Even");
  });

  function populatePlayerDropdowns() {
    const player1Select = document.getElementById("player1Select");
    const player2Select = document.getElementById("player2Select");
    const player1Image = document.getElementById("player1Image");
    const player2Image = document.getElementById("player2Image");
    const startBattle = document.getElementById("startBattle");

    // Clear any existing options
    player1Select.innerHTML = "";
    player2Select.innerHTML = "";

    // Assuming 'players' is an array containing your player objects
    players.forEach((player, index) => {
      const option1 = document.createElement("option");
      option1.value = index;
      option1.text = player.name;
      player1Select.appendChild(option1);

      const option2 = option1.cloneNode(true);
      player2Select.appendChild(option2);
    });

    function updatePlayerImage(playerIndex, imageDiv) {
      const image = `../img/characters/${playerIndex + 1}.png`; // Since index starts from 0, we add 1.
      imageDiv.style.backgroundImage = `url(${image})`;
    }

    // Initialize images with the first player
    updatePlayerImage(0, player1Image);
    updatePlayerImage(0, player2Image);

    player1Select.addEventListener("change", (event) => {
      updatePlayerImage(Number(event.target.value), player1Image);
    });

    player2Select.addEventListener("change", (event) => {
      updatePlayerImage(Number(event.target.value), player2Image);
    });

    // Attach event listener to the Start Battle button
    startBattle.addEventListener("click", battlePlayers);
  }

  function battlePlayers() {
    console.log(
      "Starting battle between players: ",
      player1Select.value,
      player2Select.value
    );
    const player1 = players[player1Select.value];
    const player2 = players[player2Select.value];
    const player1Dice = Math.floor(Math.random() * 6) + 1;
    const player2Dice = Math.floor(Math.random() * 6) + 1;
    if (player1Dice < player2Dice) {
      // take 25% of cash from player 1 and give it to player 2
      const amount = Math.floor(player1.cash * 0.25);
      player1.cash -= amount;
      player2.cash += amount;
      alert(`${player2.name} wins!`);
    } else {
      // take 25% of cash from player 2 and give it to player 1
      const amount = Math.floor(player2.cash * 0.25);
      player2.cash -= amount;
      player1.cash += amount;
      alert(`${player1.name} wins!`);
    }
    updatePlayerCashDisplay();
  }

  document.getElementById("bank").addEventListener("click", function () {
    const modal = document.getElementById("bankModal");
    document.getElementById("playerCash").textContent =
      players[currentPlayerIndex].cash;
    document.getElementById("bankCash").textContent =
      players[currentPlayerIndex].bankCash;
    modal.style.display = "block";
  });

  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      document.getElementById("bankModal").style.display = "none";
      document.getElementById("depositAmount").value = "";
      document.getElementById("withdrawAmount").value = "";
      updatePlayerCashDisplay();
      rotateTurns();
    });

  document.getElementById("depositBtn").addEventListener("click", function () {
    const depositAmount = parseFloat(
      document.getElementById("depositAmount").value
    );
    if (players[currentPlayerIndex].depositToBank(depositAmount)) {
      document.getElementById("playerCash").textContent =
        players[currentPlayerIndex].cash;
      document.getElementById("bankCash").textContent =
        players[currentPlayerIndex].bankCash;
    } else {
      alert("Insufficient funds");
    }
  });

  document.getElementById("withdrawBtn").addEventListener("click", function () {
    const withdrawAmount = parseFloat(
      document.getElementById("withdrawAmount").value
    );
    if (players[currentPlayerIndex].withdrawFromBank(withdrawAmount)) {
      document.getElementById("playerCash").textContent =
        players[currentPlayerIndex].cash;
      document.getElementById("bankCash").textContent =
        players[currentPlayerIndex].bankCash;
    } else {
      alert("Insufficient funds in bank");
    }
  });

  /*End game logic visual graph*/

  function someColorFunction(player) {
    return "#" + ((Math.random() * 0xffffff) << 0).toString(16);
  }

  // Generate Net Worth Line Chart
  let netWorthChart = null;

  function generateNetWorthLineChart(players) {
    const labels = Array.from(
      { length: players[0].netWorthHistory.length },
      (_, i) => i + 1
    );

    const datasets = players.map((player) => {
      return {
        label: player.name,
        data: player.netWorthHistory,
        fill: false,
        borderColor: someColorFunction(player),
        tension: 0.1,
      };
    });

    const data = {
      labels: labels,
      datasets: datasets,
    };

    const config = {
      type: "line",
      data: data,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Days",
            },
          },
          y: {
            title: {
              display: true,
              text: "Networth",
            },
          },
        },
      },
    };

    const ctx = document.getElementById("netWorthChart").getContext("2d");

    // Destroy the existing chart instance if it exists
    if (netWorthChart) {
      netWorthChart.destroy();
    }

    netWorthChart = new Chart(ctx, config);
  }

  // Initialization code
  document.addEventListener("DOMContentLoaded", function () {
    generateTableHeaders();
    generateTable();
    //updatePrices();
    setupEventListeners();
    setupBuyButtons();
    populatePlayerDropdowns();
  });
})();
