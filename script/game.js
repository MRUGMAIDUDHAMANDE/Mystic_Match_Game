(() => {
  const IMAGE_COUNT = 14;
  const IMAGE_PATH = (idx) => `assets/cards/card${idx}.png`;
  const DEFAULT_HARD_TIME = 180;
  const PAIR_COUNTS = { easy: 6, medium: 8, hard: 10 };
  const MOVE_LIMIT_FACTOR = { easy: Infinity, medium: 2.5, hard: 3.5 };

  const board = document.getElementById("board");
  const movesCountEl = document.getElementById("movesCount");
  const matchesCountEl = document.getElementById("matchesCount");
  const timerDisplay = document.getElementById("timerDisplay");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const resultStats = document.getElementById("resultStats");
  const replayBtn = document.getElementById("replayBtn");
  const infoBtn = document.getElementById("infoBtn");
  const playerNameEl = document.getElementById("playerName");
  const modeTag = document.getElementById("modeTag");
  const restartBtn = document.getElementById("restartBtn");
  const backBtn = document.getElementById("backBtn");
  const greetingEl = document.getElementById("greeting");
  const buzzerAudio = document.getElementById("buzzerAudio");
  const winAudio = document.getElementById("winAudio");

  let gameMode = new URLSearchParams(location.search).get("mode") || "easy";
  gameMode = ["easy", "medium", "hard"].includes(gameMode) ? gameMode : "easy";
  modeTag.textContent = gameMode.toUpperCase();

  const playerName = sessionStorage.getItem("firstName") || "Mystic Match";
  playerNameEl.textContent = playerName;

  let pairs = PAIR_COUNTS[gameMode];
  let maxMoves =
    MOVE_LIMIT_FACTOR[gameMode] === Infinity
      ? Infinity
      : Math.floor(pairs * MOVE_LIMIT_FACTOR[gameMode]);
  let hardTime = DEFAULT_HARD_TIME;

  let cardImages = [];
  let firstCard = null;
  let secondCard = null;
  let boardLocked = false;
  let moves = 0;
  let matches = 0;
  let totalPairs = pairs;
  let timerInterval = null;
  let timeElapsed = 0;
  let timeRemaining = hardTime;
  let countdownMode = gameMode === "hard";
  let buzzerThreshold = 10;
  let buzzerPlayed = false;
  let movesRemaining = maxMoves;

  function formatTime(seconds) {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function pickRandomImages(n) {
    const pool = Array.from({ length: IMAGE_COUNT }, (_, i) => i + 1);
    shuffle(pool);
    const chosen = pool.slice(0, n);
    return chosen.map((i) => IMAGE_PATH(i));
  }

  function renderCard(imgSrc, idx) {
    const item = document.createElement("div");
    item.className = "card-item";
    item.dataset.index = idx;
    item.dataset.image = imgSrc;

    const inner = document.createElement("div");
    inner.className = "card-inner";
    inner.tabIndex = 0;
    inner.setAttribute("role", "button");
    inner.setAttribute("aria-pressed", "false");

    const front = document.createElement("div");
    front.className = "card-face card-front";
    front.innerHTML = `<div class="card-content">❤️🎗️</div>`;

    const back = document.createElement("div");
    back.className = "card-face card-back";
    const imgel = document.createElement("img");
    imgel.src = imgSrc;
    imgel.alt = "card";
    back.appendChild(imgel);

    inner.appendChild(front);
    inner.appendChild(back);
    item.appendChild(inner);
    return item;
  }

  function buildBoard() {
    const chosen = pickRandomImages(pairs);
    const duplicated = chosen.concat(chosen);
    cardImages = shuffle(duplicated.slice());

    board.innerHTML = "";
    cardImages.forEach((imgSrc, idx) => {
      const node = renderCard(imgSrc, idx);
      board.appendChild(node);
    });
  }

  function flipCard(cardInner, state) {
    if (state) {
      cardInner.classList.add("flipped");
      cardInner.setAttribute("aria-pressed", "true");
    } else {
      cardInner.classList.remove("flipped");
      cardInner.setAttribute("aria-pressed", "false");
    }
  }

  function onCardActivate(cardInner) {
    if (boardLocked) return;
    if (!cardInner || !cardInner.parentElement) return;
    if (cardInner === firstCard) return;
    if (cardInner.classList.contains("matched")) return;

    flipCard(cardInner, true);

    if (!firstCard) {
      firstCard = cardInner;
      return;
    }

    secondCard = cardInner;
    boardLocked = true;

    moves++;
    if (gameMode === "medium" || gameMode === "hard") {
      movesRemaining--;
    }
    updateMovesDisplay();

    const imgA = firstCard.parentElement.dataset.image;
    const imgB = secondCard.parentElement.dataset.image;

    if (imgA === imgB) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matches++;
      matchesCountEl.textContent = matches;
      setTimeout(() => {
        firstCard = null;
        secondCard = null;
        boardLocked = false;
        checkEnd();
      }, 300);
    } else {
      setTimeout(() => {
        flipCard(firstCard, false);
        flipCard(secondCard, false);
        firstCard = null;
        secondCard = null;
        boardLocked = false;
        checkEnd();
      }, 650);
    }
  }

  function startTimer() {
    if (countdownMode) {
      buzzerPlayed = false;
      timeRemaining = DEFAULT_HARD_TIME;
      timerDisplay.textContent = formatTime(timeRemaining);
      timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining === buzzerThreshold && buzzerAudio && !buzzerPlayed) {
          buzzerPlayed = true;
          buzzerAudio.currentTime = 0;
          buzzerAudio.play().catch(() => {});
        }
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          timerDisplay.textContent = "00:00";
          handleLoss("time");
          return;
        }
        timerDisplay.textContent = formatTime(timeRemaining);
      }, 1000);
    } else {
      timeElapsed = 0;
      timerDisplay.textContent = formatTime(timeElapsed);
      timerInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = formatTime(timeElapsed);
      }, 1000);
    }
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function checkEnd() {
    if (matches === totalPairs) {
      stopTimer();
      setTimeout(() => showResult(true), 200);
      return;
    }
    if (gameMode === "medium" || gameMode === "hard") {
      if (movesRemaining <= 0) {
        stopTimer();
        handleLoss("moves");
        return;
      }
    }
  }

  function handleLoss(reason) {
    stopTimer();
    showResult(false, reason);
  }

  function showResult(won, reason) {
    resultOverlay.classList.remove("hidden");
    requestAnimationFrame(() => resultOverlay.classList.add("show"));
    if (won) {
      resultTitle.textContent = "You Won! 🎉";
      resultMessage.textContent = "Great job — you matched all pairs.";
      if (winAudio) {
        winAudio.currentTime = 0;
        winAudio.play().catch(() => {});
      }
    } else {
      resultTitle.textContent = "You Lost 😞";
      if (reason === "time") resultMessage.textContent = "Time ran out.";
      else if (reason === "moves")
        resultMessage.textContent = "You ran out of moves.";
      else resultMessage.textContent = "Better luck next time.";
    }

    resultStats.innerHTML = "";
    const timeStat = document.createElement("li");
    if (countdownMode) {
      const used = hardTime - timeRemaining;
      timeStat.textContent = `Time: ${won ? formatTime(used) : "00:00"}`;
    } else {
      timeStat.textContent = `Time: ${formatTime(timeElapsed)}`;
    }
    resultStats.appendChild(timeStat);

    const movesStat = document.createElement("li");
    movesStat.textContent =
      maxMoves === Infinity
        ? `Moves: ${moves}`
        : `Moves Left: ${Math.max(0, movesRemaining)}`;
    resultStats.appendChild(movesStat);

    if (!won && reason) {
      const reasonli = document.createElement("li");
      reasonli.textContent = `Loss reason: ${
        reason === "time" ? "Time up" : "Moves exhausted"
      }`;
      resultStats.appendChild(reasonli);
    }
  }

  function hideOverlay() {
    resultOverlay.classList.remove("show");
    setTimeout(() => resultOverlay.classList.add("hidden"), 300);
  }

  function updateMovesDisplay() {
    if (gameMode === "easy") {
      movesCountEl.textContent = moves;
    } else {
      movesCountEl.textContent = Math.max(0, movesRemaining);
    }
  }

  function resetState() {
    firstCard = null;
    secondCard = null;
    boardLocked = false;
    moves = 0;
    matches = 0;
    timeElapsed = 0;
    timeRemaining = DEFAULT_HARD_TIME;
    movesRemaining = maxMoves;
    updateMovesDisplay();
    matchesCountEl.textContent = matches;
    timerDisplay.textContent = formatTime(0);
  }

  function resetAndStart() {
    gameMode = new URLSearchParams(location.search).get("mode") || gameMode;
    if (!["easy", "medium", "hard"].includes(gameMode)) gameMode = "easy";
    pairs = PAIR_COUNTS[gameMode];
    totalPairs = pairs;
    maxMoves =
      MOVE_LIMIT_FACTOR[gameMode] === Infinity
        ? Infinity
        : Math.floor(pairs * MOVE_LIMIT_FACTOR[gameMode]);
    countdownMode = gameMode === "hard";
    timeRemaining = DEFAULT_HARD_TIME;
    modeTag.textContent = gameMode.toUpperCase();
    resetState();
    buildBoard();
    setTimeout(() => startTimer(), 250);
  }

  board.addEventListener("click", (e) => {
    const inner = e.target.closest(".card-inner");
    if (!inner || !board.contains(inner)) return;
    onCardActivate(inner);
  });

  board.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const inner = e.target.closest(".card-inner");
    if (!inner || !board.contains(inner)) return;
    e.preventDefault();
    onCardActivate(inner);
  });

  replayBtn?.addEventListener("click", () => {
    hideOverlay();
    resetAndStart();
  });

  infoBtn?.addEventListener("click", () => {
    location.href = "game_info.html";
  });

  restartBtn?.addEventListener("click", () => {
    if (confirm("Restart the game?")) resetAndStart();
  });

  backBtn?.addEventListener("click", () => {
    location.href = "game_info.html";
  });

  resetAndStart();
})();
