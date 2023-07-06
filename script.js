// SELECTORS
const flagElement = document.querySelector("[data-todays-flag]");
const guessPrompt = document.querySelector("[data-guess-prompt]");
const guessInput = document.querySelector("[data-input]");
const continentTracker = document.querySelector("[data-continent-tracker]");
const countryTracker = document.querySelector("[data-country-tracker]");
const capitalTracker = document.querySelector("[data-capital-tracker]");
const trackerList = [continentTracker, countryTracker, capitalTracker];

const alertContainer = document.querySelector("[data-alert-container]");
const gomOverlay = document.querySelector("[data-gom-overlay]");
const gom = document.querySelector("[data-gom]");
const gomContent = document.querySelector("[data-gom-content]");
const gomTitle = document.querySelector("[data-gom-title]");
const gomSubtitle = document.querySelector("[data-gom-subtitle]");
const gomScorecard = document.querySelector("[data-gom-scorecard]");
const gomItem = document.querySelectorAll("[data-gom-Item]");
const gomRow1 = document.querySelectorAll("[data-gom-row1]");
const gomRow2 = document.querySelectorAll("[data-gom-row2]");
const gomRow3 = document.querySelectorAll("[data-gom-row3]");
const gomCloseButton = document.querySelector("[data-gom-x-button]");
const gomShareButton = document.querySelector("[data-gom-share-button]");

const checkEmoji = "assets/emojis/check-emoji.png";
const xEmoji = "assets/emojis/cross-mark.png";
const emptyEmoji = "assets/emojis/white-square.png";
const mapEmoji = "assets/emojis/world-map.png";
const pinEmoji = "assets/emojis/map-pin.png";
const capEmoji = "assets/emojis/classical-building.png";

// CONFIGS

const MAX_CHAR_COUNT = 45;
const NODE_ATTEMPTS = 3;
const AVAILABLE_ATTEMPTS = 9;
const KEY_INPUT_REGEX = /^[A-Za-z ]$/;

const LOCAL_STORAGE_NAME = "flagyak_gameState";
let ACTIVE_STATE_OBJ;
let DEFAULT_STATE_OBJ = {
  currentState: {
    continent: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "continent",
      solved: false,
      solution: [],
      status: "IN_PROGRESS",
    },
    country: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "country",
      solved: false,
      solution: [],
      status: "NOT_STARTED",
    },
    capital: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "capital",
      solved: false,
      solution: [],
      status: "NOT_STARTED",
    },
  },
  expiration: new Date(),
  gameStatus: "IN_PROGRESS",
  placeholder: "",
  solvedCounter: 0,
  totalAttempts: 0,
  win: false,
  winStatus: "",
};
let GAME_STATE_OBJ = {
  currentState: {
    continent: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "continent",
      solved: false,
      solution: [],
      status: "IN_PROGRESS",
    },
    country: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "country",
      solved: false,
      solution: [],
      status: "NOT_STARTED",
    },
    capital: {
      attempts: 0,
      guessedList: [],
      guessedValidationList: [],
      sectionName: "capital",
      solved: false,
      solution: [],
      status: "NOT_STARTED",
    },
  },
  expiration: new Date(),
  gameStatus: "IN_PROGRESS",
  placeholder: "",
  solvedCounter: 0,
  totalAttempts: 0,
  win: false,
  winStatus: "",
};

const offsetFromDate = new Date(2023, 06, 03);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const todaysDate = new Date();

let todaysFlag;
let prompt = "";
let guessText = "";
let scoreText = "";
let emojiList = [];
let emojiString = "";
// INIT

initialize(GAME_STATE_OBJ);

// GAME STATE + DATA

function initialize(gameStatusObj) {
  getTodaysFlag().then((flagOBJ) => {
    todaysFlag = flagOBJ["flag_4x3"];
    flagElement.src = todaysFlag;
    gameStatusObj.currentState.country.solution = flagOBJ["name"];
    gameStatusObj.currentState.capital.solution = flagOBJ["capital"];
    gameStatusObj.currentState.continent.solution = flagOBJ["continent"];
  });

  if (JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME)) != null) {
    getGameState();
  } else {
    displayPrompt(gameStatusObj);
    displayTrackerState(gameStatusObj);
    getActiveState(gameStatusObj);
  }

  if (GAME_STATE_OBJ.gameStatus != "COMPLETE") {
    startInt();
  } else {
    gomCheckStatus();
    guessInput.placeholder = "GAME OVER";
  }
}

function setGameState() {
  localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(GAME_STATE_OBJ));
  return;
}

function getGameState() {
  GAME_STATE_OBJ = JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME));
  dateString = GAME_STATE_OBJ.expiration;
  const exp = new Date(dateString);
  const expDay = exp.getDate();
  const today = todaysDate.getDate();
  if (today == expDay) {
    getActiveState(GAME_STATE_OBJ);
    displayPrompt(GAME_STATE_OBJ);
    displayTrackerState(GAME_STATE_OBJ);
    return true;
  } else {
    localStorage.removeItem(LOCAL_STORAGE_NAME);
    guessInput.value = "";
  }
}

function getActiveState(gameStatusObj) {
  for (i in gameStatusObj.currentState) {
    if (gameStatusObj.currentState[i].status == "IN_PROGRESS") {
      ACTIVE_STATE_OBJ = gameStatusObj.currentState[i];
      return ACTIVE_STATE_OBJ;
    }
  }
}

async function getTodaysFlag() {
  try {
    const response = await fetch("countries_data.json");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const res = await response.json();
    const flagOBJ = res[getNumber(res.length)];
    return flagOBJ;
  } catch (error) {
    console.error(`Could not fetch countries object: ${error}`);
  }
}

function getNumber(listLength) {
  if (dayOffset <= listLength) {
    return Math.floor(dayOffset);
  } else {
    let todaysDate = new Date();
    let day = todaysDate.getDate();
    let month = todaysDate.getMonth();
    let year = todaysDate.getFullYear();

    offsetFromDate = new Date(year, month, day);
    msOffset = Date.now() - offsetFromDate;
    dayOffset = msOffset / 1000 / 60 / 60 / 24;
    todaysDate = new Date();
    return Math.floor(dayOffset);
  }
}

// INTERACTION LISTENERS

function startInt() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);

  return;
}

function endInt() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
  return;
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);

    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

// GAMEPLAY FUNCTIONS

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.metaKey == true || e.altKey == true || e.ctrlKey == true) {
  } else if (e.key.match(KEY_INPUT_REGEX)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  guessText = guessText + key.toUpperCase();
  guessInput.value = guessText;

  if (guessInput.value !== "") {
    guessInput.setAttribute("data-state", "active");
  } else {
    guessInput.setAttribute("data-state", "");
  }
}

function deleteKey() {
  if (guessText == "") {
    return;
  } else {
    guessText = guessText.slice(0, -1);
    guessInput.value = guessText;
  }
}

function submitGuess() {
  if (guessText.length > MAX_CHAR_COUNT) {
    showAlert("Your guess is too long, try again");
    shake(guessInput);
  } else if (validationChecker(ACTIVE_STATE_OBJ) == true) {
    showAlert("Nice, that's correct!");
    ACTIVE_STATE_OBJ.guessedValidationList.push(true);
    postValidationActions(ACTIVE_STATE_OBJ, GAME_STATE_OBJ);
  } else {
    ACTIVE_STATE_OBJ.guessedValidationList.push(false);
    shake(guessInput);
    postValidationActions(ACTIVE_STATE_OBJ, GAME_STATE_OBJ);
  }
}

function validationChecker(activeStatusObj) {
  const tempGuessText = guessText.toLowerCase().replace(/\s+/g, "");
  const solutionsList = activeStatusObj.solution;
  let bool = false;
  for (i = 0; i < solutionsList.length; i++) {
    const solutionItem = solutionsList[i].toLowerCase().replace(/\s+/g, "");
    console.log();
    if (tempGuessText == solutionItem) {
      activeStatusObj.solved = true;
      bool = true;
      return bool;
    } else {
      activeStatusObj.solved = false;
      bool = false;
    }
  }
  return bool;
}

function winLose(gameStatusObj) {
  const tempList = gameStatusObj.currentState;
  const tempListLength = Object.keys(tempList).length;
  let solvedCounter = 0;
  let completeCounter = 0;

  for (i in tempList) {
    if (tempList[i].status == "COMPLETE") {
      completeCounter += 1;
    }
    if (tempList[i].solved == true) {
      solvedCounter += 1;
      gameStatusObj.solvedCounter = solvedCounter;
    }
  }

  if (solvedCounter == tempListLength) {
    gameStatusObj.win = true;
    gameStatusObj.gameStatus = "COMPLETE";
    gameStatusObj.winStatus = "WIN";
    endInt();
  } else if (
    gameStatusObj.win == false &&
    gameStatusObj.totalAttempts == AVAILABLE_ATTEMPTS &&
    solvedCounter == 0
  ) {
    gameStatusObj.gameStatus = "COMPLETE";
    gameStatusObj.winStatus = "LOSS";
    endInt();
  } else if (
    (gameStatusObj.win == false &&
      gameStatusObj.totalAttempts < AVAILABLE_ATTEMPTS &&
      solvedCounter < tempListLength &&
      completeCounter == tempListLength) ||
    (gameStatusObj.win == false &&
      gameStatusObj.totalAttempts == AVAILABLE_ATTEMPTS &&
      solvedCounter >= tempListLength - tempListLength + 1)
  ) {
    gameStatusObj.gameStatus = "COMPLETE";
    gameStatusObj.winStatus = "PARTIAL";
    endInt();
  }
}

function postValidationActions(activeStatusObj, gameStatusObj) {
  const sectionName = activeStatusObj.sectionName;
  if (
    activeStatusObj.status == "IN_PROGRESS" &&
    gameStatusObj.totalAttempts < AVAILABLE_ATTEMPTS
  ) {
    activeStatusObj.attempts += 1;
    activeStatusObj.guessedList.push(guessText);
    gameStatusObj.totalAttempts += 1;

    if (
      (activeStatusObj.attempts <= NODE_ATTEMPTS &&
        validationChecker(activeStatusObj) == true) ||
      (activeStatusObj.attempts == NODE_ATTEMPTS &&
        validationChecker(activeStatusObj) == false)
    ) {
      activeStatusObj.status = "COMPLETE";

      if (validationChecker(activeStatusObj) == false) {
        showAlert(
          `The correct answer is "${activeStatusObj.solution[0]}"`,
          2000
        );
      }

      for (i in gameStatusObj.currentState) {
        if (
          gameStatusObj.currentState[i].sectionName == sectionName ||
          gameStatusObj.currentState[i].status == "COMPLETE"
        ) {
          continue;
        } else {
          gameStatusObj.currentState[i].status = "IN_PROGRESS";
          break;
        }
      }
    }
  }

  winLose(gameStatusObj);
  gomCheckStatus();

  if (gameStatusObj.gameStatus != "COMPLETE") {
    clearUserText(guessText);
  }

  setGameState(gameStatusObj);
  getActiveState(gameStatusObj);
  displayPrompt(gameStatusObj);
  displayTrackerState(gameStatusObj);
}

// UI FUNCTIONS - IN GAME

function displayPrompt(gameStatusObj) {
  const tempList = gameStatusObj.currentState;
  const tempListLength = Object.keys(tempList).length;
  if (gameStatusObj.gameStatus == "COMPLETE" && gameStatusObj.win == true) {
    prompt = "Congratulations, you won!";
    guessPrompt.textContent = `${prompt}`;
  } else if (
    gameStatusObj.gameStatus == "COMPLETE" &&
    gameStatusObj.winStatus == "PARTIAL"
  ) {
    prompt = `Partial win, you got ${gameStatusObj.solvedCounter} out of ${tempListLength} correct.`;
    guessPrompt.textContent = `${prompt}`;
  } else if (gameStatusObj.gameStatus == "NOT_STARTED") {
    prompt = "Guess the continent";
    guessPrompt.textContent = `${prompt}`;
  } else {
    for (i in gameStatusObj.currentState) {
      if (gameStatusObj.currentState[i].status == "IN_PROGRESS") {
        ACTIVE_STATE_OBJ = gameStatusObj.currentState[i];
        prompt = ACTIVE_STATE_OBJ.sectionName;
        guessPrompt.textContent = `Guess the ${prompt}`;
        return;
      } else {
        prompt = "Aw, better luck tomorrow!";
        guessPrompt.textContent = `${prompt}`;
      }
    }
  }
  return;
}

function displayTrackerState(gameStatusObj) {
  const states = gameStatusObj.currentState;
  let trackerIcon;
  let trackerNodes;

  for (a in states) {
    const attempts = states[a].attempts;
    const sectionName = states[a].sectionName;

    if (sectionName == "continent") {
      trackerIcon = continentTracker.querySelector("[data-tracker-icon]");
      trackerNodes = continentTracker.lastElementChild.children;
    } else if (sectionName == "country") {
      trackerIcon = countryTracker.querySelector("[data-tracker-icon]");
      trackerNodes = countryTracker.lastElementChild.children;
    } else if (sectionName == "capital") {
      trackerIcon = capitalTracker.querySelector("[data-tracker-icon]");
      trackerNodes = capitalTracker.lastElementChild.children;
    }
    // if the section is completed correctly
    if (states[a].solved == true) {
      trackerIcon.setAttribute("data-state", "correct");
      trackerIcon.firstElementChild.setAttribute("data-state", "correct");
      //flip(trackerIcon);
      for (i = 0; i <= attempts; i++) {
        if (i < attempts - 1) {
          trackerNodes[i].setAttribute("data-state", "wrong");
          trackerNodes[i].classList.add("scale");
        } else if (i == attempts - 1) {
          trackerNodes[i].setAttribute("data-state", "correct");
          trackerNodes[i].classList.add("scale");
        }
      }
      // if the section is in progress
    } else if (states[a].solved == false && states[a].status == "IN_PROGRESS") {
      trackerIcon.setAttribute("data-state", "active");
      trackerIcon.firstElementChild.setAttribute("data-state", "active");
      for (i = 0; i <= attempts; i++) {
        if (i <= attempts - 1) {
          trackerNodes[i].classList.add("scale");
          trackerNodes[i].setAttribute("data-state", "wrong");
        } else if (i > attempts - 1) {
          trackerNodes[i].setAttribute("data-state", "active");
        }
      }
      // if the section is completed incorrectly
    } else if (states[a].solved == false && states[a].status == "COMPLETE") {
      trackerIcon.setAttribute("data-state", "wrong");
      trackerIcon.firstElementChild.setAttribute("data-state", "wrong");
      for (i = 0; i <= attempts; i++) {
        if (i <= attempts - 1) {
          trackerNodes[i].setAttribute("data-state", "wrong");
          trackerNodes[i].classList.add("scale");
          trackerIcon.classList.add("scale");
        }
      }
    }
  }
}

function clearUserText() {
  guessText = "";
  guessInput.value = "";
  return;
}

// UI FUNCTIONS - MODALS

function gomRenderContent() {
  const correctCount = GAME_STATE_OBJ.solvedCounter;
  scoreText = ` got ${correctCount}/3 correct`;
  gomSubtitle.textContent = "You" + scoreText + "!";

  const state = GAME_STATE_OBJ.currentState;
  emojiMap = {
    continent: gomRow1,
    country: gomRow2,
    capital: gomRow3,
  };

  for (i in state) {
    const validationList = state[i].guessedValidationList;
    const row = emojiMap[i];

    for (const v in validationList) {
      const listItem = row[v];
      const emojiSrc = validationList[v] ? checkEmoji : xEmoji;
      listItem.firstElementChild.src = emojiSrc;
    }
  }
}

function shareText() {
  const emojiList = [];
  const check = "✅";
  const wrong = "❌";
  const empty = "🔳";
  const map = "🗺";
  const pin = "📍";
  const cap = "🏛";
  const itemsPerRow = NODE_ATTEMPTS + 1; // Number of items per row
  let count = 0; // Counter for tracking the number of items

  gomItem.forEach((element, index) => {
    const imgSrc = element.firstElementChild.getAttribute("src");
    let emoji;

    if (imgSrc === checkEmoji) {
      emoji = check;
    } else if (imgSrc === xEmoji) {
      emoji = wrong;
    } else if (imgSrc === emptyEmoji) {
      emoji = empty;
    } else if (imgSrc === mapEmoji) {
      emoji = map;
    } else if (imgSrc === pinEmoji) {
      emoji = pin;
    } else if (imgSrc === capEmoji) {
      emoji = cap;
    }

    emojiList.push(emoji);
    count++;

    if (count % itemsPerRow === 0 && index !== gomItem.length - 1) {
      emojiList.push("\n");
    }
  });

  emojiString = emojiList.join(""); // Convert the emojiList to a string
}

function gomCheckStatus() {
  if (
    GAME_STATE_OBJ.gameStatus == "COMPLETE" &&
    gomOverlay.style.display != "block"
  ) {
    if (GAME_STATE_OBJ.win == true) {
      winFlip(trackerList)
        .then(() => {
          gomRenderContent();
          shareText();
          gomOverlay.style.display = "block";
        })
        .catch(console.error);
    } else {
      gomRenderContent();
      shareText();
      gomOverlay.style.display = "block";
    }
  }
}

gomContent.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  if (e.target === gomOverlay) {
    gomOverlay.style.display = "none";
  }
});

gomShareButton.addEventListener("click", () => {
  if (navigator.share) {
    navigator
      .share({
        title: "My FlagYak Score Today",
        text: "I" + scoreText + " on today's FlagYak!" + "\n\n" + emojiString,
        url: "https://www.flagyak.com",
      })
      .catch(console.error);
  } else {
    navigator.clipboard
      .writeText(
        "I" +
          scoreText +
          "\n\n" +
          emojiString +
          "\n\n" +
          "Play at https://www.flagyak.com"
      )
      .then(() => {
        showAlert("Copied to clipboard", 500);
      })
      .catch(() => {
        alert("An error occured, you can't share right now.");
      });
  }
});

gomCloseButton.addEventListener("click", () => {
  gomOverlay.style.display = "none";
});

// UI ANIMATIONS

function showAlert(message, duration = 2000) {
  const alert = document.createElement("div");
  alert.textContent = message.toUpperCase();
  alert.classList.add("alert");
  alertContainer.prepend(alert);

  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shake(elem) {
  elem.classList.add("shake");
  setTimeout(
    function () {
      elem.classList.remove("shake");
    }.bind(elem),
    500
  );
}

function flip(tracker) {
  tracker.classList.add("flip");
  setTimeout(
    function () {
      tracker.classList.remove("flip");
    }.bind(tracker),
    2000
  );
}

function winFlip(list) {
  return new Promise(function (resolve, reject) {
    // Perform some asynchronous task
    list.forEach((tracker, index) => {
      setTimeout(() => {
        tracker.classList.add("flip");
        tracker.addEventListener(
          "animationend",
          () => {
            tracker.classList.remove("flip");
          },
          { once: true }
        );
      }, ((index + 1) * 1500) / 3);
    });

    setTimeout(() => {
      resolve(0);
    }, 2800);
  });
}
