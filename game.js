const puzzles = [
  {
    question: "What has keys but cannot open locks?",
    answers: ["A door", "A piano", "A map", "A clock"],
    correct: 1,
    hint: "You can play music on it."
  },
  {
    question: "What gets wetter as it dries?",
    answers: ["A towel", "The sun", "A cloud", "A sponge"],
    correct: 0,
    hint: "You use it after a bath."
  },
  {
    question: "What has hands but cannot clap?",
    answers: ["A robot", "A clock", "A doll", "A monkey"],
    correct: 1,
    hint: "It tells you the time."
  },
  {
    question: "What has a neck but no head?",
    answers: ["A bottle", "A person", "A shirt", "A tree"],
    correct: 0,
    hint: "You can fill it with water."
  },
  {
    question: "What has one eye but cannot see?",
    answers: ["A needle", "A cat", "A camera", "A storm"],
    correct: 0,
    hint: "It is used for sewing."
  },
  {
    question: "What goes up but never comes down?",
    answers: ["A balloon", "Your age", "Smoke", "A bird"],
    correct: 1,
    hint: "You get more of it every birthday."
  },
  {
    question: "What has many teeth but cannot bite?",
    answers: ["A lion", "A comb", "A shark", "A crocodile"],
    correct: 1,
    hint: "You use it on your hair."
  },
  {
    question: "What can travel around the world while staying in one corner?",
    answers: ["A stamp", "A plane", "A cloud", "A bird"],
    correct: 0,
    hint: "You put it on a letter."
  },
  {
    question: "What has legs but doesn't walk?",
    answers: ["A dog", "A table", "A horse", "A bird"],
    correct: 1,
    hint: "You can put things on it."
  },
  {
    question: "What has a face and two hands but no arms or legs?",
    answers: ["A clock", "A person", "A doll", "A mirror"],
    correct: 0,
    hint: "It helps you know the time."
  },
  {
    question: "What has a head and a tail but no body?",
    answers: ["A snake", "A coin", "A fish", "A kite"],
    correct: 1,
    hint: "You can flip it."
  },
  {
    question: "What has words but never speaks?",
    answers: ["A book", "A teacher", "A radio", "A baby"],
    correct: 0,
    hint: "You read it."
  },
  {
    question: "What can you catch but not throw?",
    answers: ["A ball", "A cold", "A fish", "A bird"],
    correct: 1,
    hint: "It can make you sneeze."
  },
  {
    question: "What has four fingers and a thumb but is not alive?",
    answers: ["A glove", "A hand", "A robot", "A tree"],
    correct: 0,
    hint: "You wear it in winter."
  },
  {
    question: "What has cities but no houses, forests but no trees?",
    answers: ["A book", "A map", "A painting", "A garden"],
    correct: 1,
    hint: "You use it to find places."
  },
  {
    question: "What runs but never walks?",
    answers: ["A river", "A child", "A dog", "A horse"],
    correct: 0,
    hint: "It flows towards the sea."
  },
  {
    question: "What has an end but no beginning?",
    answers: ["A circle", "A stick", "A road", "A rope"],
    correct: 0,
    hint: "Think of a shape with no start."
  },
  {
    question: "What has a ring but no finger?",
    answers: ["A phone", "A tree", "A bell", "A person"],
    correct: 0,
    hint: "It can ring when someone calls."
  },
  {
    question: "What is full of holes but still holds water?",
    answers: ["A bucket", "A sponge", "A glass", "A net"],
    correct: 1,
    hint: "You can squeeze it."
  },
  {
    question: "What belongs to you but other people use it more?",
    answers: ["Your name", "Your phone", "Your shoes", "Your bag"],
    correct: 0,
    hint: "People call you by it."
  }
];

const $ = id => document.getElementById(id);

let current = 0;
let coins = 0;
let score = 0;
let lives = 3;
let answered = false;
let hintUsed = false;
let soundOn = true;
let gameActive = false;

const TOTAL = puzzles.length;

function getSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log("Saving is not available.");
  }
}

let bestScore = getSaved("bp_best", 0);
let totalCoins = getSaved("bp_coins", 0);
let savedLevel = getSaved("bp_level", 1);
let soundSetting = getSaved("bp_sound", true);
soundOn = soundSetting;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  $(id).classList.add("active");
}

function updateHome() {
  $("homeBest").textContent = bestScore;
  $("homeCoins").textContent = totalCoins;
  $("homeLevel").textContent = savedLevel;

  const claimed = getSaved("bp_bonus_date", "");
  const today = new Date().toDateString();

  $("bonusBtn").disabled = claimed === today;
  $("bonusBtn").textContent =
    claimed === today ? "✅ Bonus Claimed Today" : "🎁 Claim Daily Bonus";
}

function updateSoundButton() {
  $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
  save("bp_sound", soundOn);
}

function playSound(type) {
  if (!soundOn) return;

  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    const sounds = {
      correct: [660, 880],
      wrong: [220],
      click: [440],
      win: [523, 659, 784]
    };

    const notes = sounds[type] || [440];
    let time = audio.currentTime;

    notes.forEach((frequency, index) => {
      oscillator.frequency.setValueAtTime(
        frequency,
        time + index * 0.13
      );
    });

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + notes.length * 0.15
    );

    oscillator.start(time);
    oscillator.stop(time + notes.length * 0.15);

    oscillator.onended = () => audio.close();
  } catch (error) {
    console.log("Sound unavailable.");
  }
}

function startGame() {
  current = 0;
  coins = 0;
  score = 0;
  lives = 3;
  gameActive = true;

  showScreen("game");
  loadPuzzle();
}

function updateStats() {
  $("coins").textContent = coins;
  $("score").textContent = score;
  $("lives").textContent = lives;
}

function loadPuzzle() {
  answered = false;
  hintUsed = false;

  const puzzle = puzzles[current];

  $("level").textContent = current + 1;
  $("levelCount").textContent =
    `${current + 1} / ${TOTAL}`;

  $("questionNumber").textContent =
    String(current + 1).padStart(2, "0");

  $("progress").style.width =
    `${((current + 1) / TOTAL) * 100}%`;

  $("question").textContent = puzzle.question;
  $("feedback").textContent = "";
  $("nextBtn").disabled = true;
  $("hintBtn").disabled = false;

  const answers = $("answers");
  answers.innerHTML = "";

  puzzle.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = answer;

    button.addEventListener("click", () => {
      checkAnswer(index, button);
    });

    answers.appendChild(button);
  });

  updateStats();
}

function checkAnswer(index, button) {
  if (answered || !gameActive || lives <= 0) return;

  const puzzle = puzzles[current];
  const buttons = document.querySelectorAll(".answer-btn");

  if (index === puzzle.correct) {
    answered = true;
    button.classList.add("correct");

    buttons.forEach(btn => {
      btn.disabled = true;
    });

    score += 10;
    coins += 10;
    totalCoins += 10;

    $("feedback").textContent = "🎉 Correct! +10 points";
    $("feedback").style.color = "#26b978";
    $("nextBtn").disabled = false;
    $("hintBtn").disabled = true;

    playSound("correct");
    updateStats();
    save("bp_coins", totalCoins);
    save("bp_best", Math.max(bestScore, score));
    bestScore = Math.max(bestScore, score);
    updateHome();

  } else {
    button.classList.add("wrong");
    button.disabled = true;
    lives--;

    $("feedback").textContent = "❌ Wrong answer! Try again.";
    $("feedback").style.color = "#d94c68";

    playSound("wrong");
    updateStats();

    if (lives <= 0) {
      answered = true;
      buttons.forEach(btn => btn.disabled = true);

      setTimeout(() => {
        $("overScore").textContent = score;
        $("overCoins").textContent = coins;
        gameActive = false;
        showScreen("over");
      }, 700);
    }
  }
}

function useHint() {
  if (hintUsed || answered || !gameActive) return;

  if (coins < 5) {
    $("feedback").textContent = "🪙 You need 5 coins for a hint.";
    $("feedback").style.color = "#bd830d";
    return;
  }

  coins -= 5;
  totalCoins = Math.max(0, totalCoins - 5);
  hintUsed = true;

  $("feedback").textContent = "💡 " + puzzles[current].hint;
  $("feedback").style.color = "#a46b00";
  $("hintBtn").disabled = true;

  updateStats();
  save("bp_coins", totalCoins);
  updateHome();
  playSound("click");
}

function nextPuzzle() {
  if (!answered || lives <= 0 || !gameActive) return;

  current++;

  if (current >= TOTAL) {
    finishGame();
    return;
  }

  savedLevel = Math.max(savedLevel, current + 1);
  save("bp_level", savedLevel);
  updateHome();
  loadPuzzle();
  playSound("click");
}

function finishGame() {
  gameActive = false;

  bestScore = Math.max(bestScore, score);
  save("bp_best", bestScore);

  $("finalScore").textContent = score;
  $("finalCoins").textContent = coins;

  savedLevel = 1;
  save("bp_level", savedLevel);
  updateHome();

  showScreen("complete");
  playSound("win");
}

function claimBonus() {
  const today = new Date().toDateString();
  const claimed = getSaved("bp_bonus_date", "");

  if (claimed === today) {
    $("bonusMessage").textContent =
      "You have already claimed today's bonus.";
    return;
  }

  totalCoins += 25;
  save("bp_coins", totalCoins);
  save("bp_bonus_date", today);

  updateHome();
  $("bonusMessage").textContent = "🎉 25 bonus coins added!";
  $("bonusModal").classList.add("show");
  playSound("win");
}

function closeBonus() {
  $("bonusModal").classList.remove("show");
}

function goHome() {
  gameActive = false;
  updateHome();
  showScreen("home");
}

$("playBtn").addEventListener("click", () => {
  playSound("click");
  startGame();
});

$("homeBtn").addEventListener("click", goHome);
$("hintBtn").addEventListener("click", useHint);
$("nextBtn").addEventListener("click", nextPuzzle);
$("againBtn").addEventListener("click", startGame);
$("retryBtn").addEventListener("click", startGame);
$("bonusBtn").addEventListener("click", claimBonus);
$("closeBonus").addEventListener("click", closeBonus);

$("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;
  updateSoundButton();
  playSound("click");
});

document.querySelectorAll(".home-link").forEach(button => {
  button.addEventListener("click", goHome);
});

updateSoundButton();
updateHome();
