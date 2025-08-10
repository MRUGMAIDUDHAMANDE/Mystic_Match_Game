(() => {
  const IMAGE_COUNT = 14; // 14 Images
  const IMAGE_PATH = (idx) => `assets/cards/card${idx}.png`; // 1-based index
  const DEFAULT_HARD_TIME = 180;
  const PAIR_COUNTS = {
    easy: 6,
    medium: 8,
    hard: 10,
  };
  const MOVE_LIMIT_FACTOR = {
    easy: Infinity,
    medium:2.5,
    hard:3.5,
  };

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
      : pairs * MOVE_LIMIT_FACTOR[gameMode];
  let hardTime = DEFAULT_HARD_TIME;

  let cardImages = [];
  let firstCard = null;
  let secondCard = null;
  let boardLocked = false;
  let moves = 0;
  let matches = 0;
  let totalPairs = pairs;
  let timerInterval = null;
  let timeElapsed = 0; // seconds
  let timeRemaining = hardTime;
  let countdownMode = gameMode === "hard";
  let buzzerThreshold = 10; // seconds left when buzzer plays
  let buzzerPlaying = false;
  let movesRemaining = maxMoves;

  function formatTime(seconds) {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function shuffle(array) {
    // Fisher-Yates Algorithm
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

  function buildBoard() {
    const chosen = pickRandomImages(pairs);
    const duplicated = chosen.concat(chosen);
    cardImages = shuffle(duplicated.slice());

    const totalCards = cardImages.length;
    const cols = Math.ceil(Math.sqrt(totalCards));
    board.style.gridTemplateColumns = `repeat(${cols}, minmax(80px, 1fr))`;

    board.innerHTML = "";
    cardImages.forEach((imgSrc, idx) => {
      const item = document.createElement("div");
      item.className = "card-item";
      item.dataset.index = idx;
      item.dataset.image = imgSrc;

      const inner = document.createElement("div");
      inner.className = "card-inner";
      inner.tabIndex = 0;

      const front = document.createElement("div");
      front.className = "card-face card-front";
      front.innerHTML = `<div style="font-size:3.8rem;">❤️🎗️</div>`;
      // 🎆🎗️🎊💎🎴💡🪙
      const back = document.createElement("div");
      back.className = "card-face card-back";
      const imgel = document.createElement("img");
      imgel.src = imgSrc;
      imgel.alt = "card";
      back.appendChild(imgel);

      inner.appendChild(front);
      inner.appendChild(back);
      item.appendChild(inner);
      board.appendChild(item);

      inner.addEventListener("click", () => onCardClick(inner));
      inner.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(inner);
        }
      });
    });
  }

  function onCardClick(cardInner) {
    if (boardLocked) return;
    if (cardInner === firstCard) return;
    if (cardInner.classList.contains("matched")) return;

    cardInner.classList.add("flipped");

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
      }, 350);
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard = null;
        secondCard = null;
        boardLocked = false;
        checkEnd();
      }, 700);
    }
  }

  function startTimer() {
    if (countdownMode) {
      timerDisplay.textContent = formatTime(timeRemaining);
      timerInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= buzzerThreshold && timeRemaining > 0) {
          if (buzzerAudio && !buzzerPlaying) {
            buzzerPlaying = true;
            buzzerAudio.play().catch(() => {});

            setTimeout(() => {
              buzzerAudio.pause();
              buzzerAudio.currentTime = 0;
              buzzerPlaying = false;
            }, 900);
          }
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
      setTimeout(() => showResult(true), 250);
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
      const used = formatTime(hardTime - timeRemaining);
      timeStat.textContent = `Time: ${
        countdownMode && !won && reason === "time"
          ? formatTime(0)
          : won
          ? used
          : formatTime(hardTime - timeRemaining)
      }`;
    } else {
      timeStat.textContent = `Time: ${formatTime(timeElapsed)}`;
    }
    resultStats.appendChild(timeStat);

    const movesStat = document.createElement("li");
    movesStat.textContent =
      maxMoves === Infinity
        ? `Moves: ${moves}`
        : `Moves => ${won ? "(Used)" : ` Remaining : ${movesRemaining} `}`;
    resultStats.appendChild(movesStat);

    if (!won && reason) {
      const reasonli = document.createElement("li");
      reasonli.textContent = `Loss reason: ${
        reason === "time" ? "Time up" : "Moves exhausted"
      }`;
      resultStats.appendChild(reasonli);
    }
  }

  replayBtn?.addEventListener("click", () => {
    resultOverlay.classList.add("hidden");
    resetAndStart();
  });

  infoBtn?.addEventListener("click", () => {
    location.href = "game_info.html";
  });

  restartBtn?.addEventListener("click", () => {
    resetAndStart();
  });

  backBtn?.addEventListener("click", () => {
    location.href = "game_info.html";
  });

  function updateMovesDisplay() {
    if (gameMode === "easy") {
      movesCountEl.textContent = moves;
    } else {
      movesCountEl.textContent = movesRemaining;
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
        : pairs * MOVE_LIMIT_FACTOR[gameMode];
    countdownMode = gameMode === "hard";
    timeRemaining = DEFAULT_HARD_TIME;

    resetState();
    buildBoard();
    setTimeout(() => startTimer(), 300);
  }

  resetAndStart();
})();
