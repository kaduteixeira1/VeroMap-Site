// Dados dos níveis e locais
const levels = {
  1: [
    { name: "Basílica de Nazaré", image: "lvl1/basilica de nazare.jpg" },
    { name: "Estação das Docas", image: "lvl1/estacao das docas.jpg" },
    { name: "Forte do Castelo", image: "lvl1/Forte do castelo.jpg" },
    { name: "Portal da Amazônia", image: "lvl1/portal da amazonia.jpg" },
    { name: "Ver-o-Peso", image: "lvl1/veropeso.jpg" },
  ],
  2: [
    {
      name: "Bosque Rodrigues Alves",
      image: "lvl2/bosque rodrigues alves.jpg",
    },
    { name: "Hangar", image: "lvl2/hangar.jpg" },
    { name: "Porto Futuro", image: "lvl2/porto futuro.jpg" },
    { name: "Praça da República", image: "lvl2/praca da republica.jpg" },
    { name: "Praça do Relógio", image: "lvl2/praca do relogio.jpg" },
  ],
  3: [
    { name: "Casa das Onze Janelas", image: "lvl3/casa das onze janelas.jpg" },
    { name: "Praça Batista Campos", image: "lvl3/praca batista campos.jpg" },
    { name: "Orla de Icoaraci", image: "lvl3/orla icoaraci.jpg" },
    { name: "Teatro da Paz", image: "lvl3/teatro da paz.jpg" },
  ],
  4: [
    { name: "Igreja da Trindade", image: "lvl4/igreja da trindade.jpg" },
    { name: "Mangal das Garças", image: "lvl4/mangal das garcas.jpg" },
    { name: "Museu Emílio Goeldi", image: "lvl4/museu emilio goeldi.jpg" },
    { name: "Vila da Barca", image: "lvl4/vila da barca.jpg" },
  ],
  5: [
    { name: "Igreja da Sé", image: "lvl5/igreja da se.jpg" },
    { name: "Praça Eneida", image: "lvl5/praca eneida.jpg" },
    { name: "Rua do Arsenal", image: "lvl5/rua do arsenal.jpg" },
  ],
};

// Estado do jogo
let playerName = "";
let lives = 5;
let score = 0;
let currentLevel = 1;
let currentQuestionIndex = 0;
let ranking = [];
let wrongAnswers = new Set();
let currentStreak = 0;
let startTime = null;
let endTime = null;

const startScreen = document.getElementById("start-screen");
const initialScreen = document.getElementById("initial-screen");
const playBtn = document.getElementById("play-btn");
const startBtn = document.getElementById("start-btn");
const playerNameInput = document.getElementById("player-name");
const countdown = document.getElementById("countdown");
const countdownNumber = document.getElementById("countdown-number");

const questionImage = document.getElementById("question-image");
const optionsDiv = document.getElementById("options");
const livesSpan = document.getElementById("lives");
const scoreSpan = document.getElementById("score");
const levelSpan = document.getElementById("level");
const rankingDiv = document.getElementById("ranking");

const gameOverModal = document.getElementById("game-over-modal");
const victoryModal = document.getElementById("victory-modal");
const gameOverMessage = document.getElementById("game-over-message");
const victoryMessage = document.getElementById("victory-message");
const restartBtn = document.getElementById("restart-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const backToMenuBtn = document.getElementById("back-to-menu-btn");
const backToMenuVictoryBtn = document.getElementById("back-to-menu-victory-btn");

// --- SUPABASE CONFIG ---
const supabaseUrl = "https://zbzxchsusbenhikxyumw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienhjaHN1c2Jlbmhpa3h5dW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzc0NDgsImV4cCI6MjA2NDY1MzQ0OH0.dgD9P2kBdMd4N4QzZwIsPOMpe7XpUXPqE3R5l5u1Fiw";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

restartBtn.addEventListener("click", () => {
  gameOverModal.style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("initial-screen").style.display = "flex";
  resetGame();
});

playAgainBtn.addEventListener("click", () => {
  victoryModal.style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("initial-screen").style.display = "flex";
  resetGame();
});

backToMenuBtn.addEventListener("click", () => {
  gameOverModal.style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("initial-screen").style.display = "flex";
  resetGame();
});

backToMenuVictoryBtn.addEventListener("click", () => {
  victoryModal.style.display = "none";
  document.getElementById("game").style.display = "none";
  document.getElementById("initial-screen").style.display = "flex";
  resetGame();
});

playBtn.addEventListener("click", () => {
  initialScreen.style.display = "none";
  startScreen.style.display = "flex";
});

playerNameInput.addEventListener("input", () => {
  startBtn.disabled = playerNameInput.value.trim() === "";
});

startBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();
  if (playerName) {
    startScreen.style.display = "none";
    startCountdown();
  }
});

function startCountdown() {
  countdown.style.display = "flex";
  let count = 3;
  
  function updateCountdown() {
    countdownNumber.textContent = count;
    
    if (count > 0) {
      count--;
      setTimeout(updateCountdown, 1000);
    } else {
      countdown.style.display = "none";
      document.getElementById("game").style.display = "block";
      resetGame();
    }
  }
  
  updateCountdown();
}

function resetGame() {
  lives = 5;
  score = 0;
  currentLevel = 1;
  currentQuestionIndex = 0;
  currentStreak = 0;
  wrongAnswers.clear();
  startTime = Date.now();
  updateStatus();
  loadLevel(currentLevel);
}

function getTimeElapsed() {
  if (!startTime) return 0;
  const end = endTime || Date.now();
  return Math.floor((end - startTime) / 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateStatus() {
  livesSpan.textContent = lives;
  scoreSpan.textContent = score;
  levelSpan.textContent = currentLevel;
  const streakSpan = document.getElementById("streak");
  if (streakSpan) {
    streakSpan.textContent = currentStreak;
  }
}

function loadLevel(level) {
  const questions = levels[level];
  if (!questions) {
    victory();
    return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestionIndex = randomIndex;
  const question = questions[randomIndex];
  questionImage.src = question.image;
  questionImage.alt = `Imagem de ${question.name}`;

  const options = generateOptions(level, question.name);
  renderOptions(options, question.name);
  updateStatus();
}

function generateOptions(level, correctName) {
  const questions = levels[level];
  const options = new Set();
  options.add(correctName);

  const allLevels = Object.values(levels).flat();
  const otherQuestions = allLevels.filter((q) => q.name !== correctName);

  while (options.size < 4) {
    const randomQuestion =
      otherQuestions[Math.floor(Math.random() * otherQuestions.length)];
    options.add(randomQuestion.name);
  }

  return shuffleArray(Array.from(options));
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderOptions(options, correctAnswer) {
  optionsDiv.innerHTML = "";
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className = "option-btn";
    btn.onclick = () => checkAnswer(btn, correctAnswer);
    optionsDiv.appendChild(btn);
  });
}

function calculatePoints(level, streak) {
  let basePoints;
  switch (level) {
    case 1:
      basePoints = 1;
      break;
    case 2:
      basePoints = 3;
      break;
    case 3:
      basePoints = 5;
      break;
    case 4:
      basePoints = 10;
      break;
    case 5:
      basePoints = 15;
      break;
    default:
      basePoints = 0;
  }
  
  const streakMultiplier = Math.min(1 + (streak * 0.2), 3);
  return Math.floor(basePoints * streakMultiplier);
}

function checkAnswer(selectedBtn, correctName) {
  if (selectedBtn.textContent === correctName) {
    selectedBtn.classList.add("correct");
    currentStreak++;
    score += calculatePoints(currentLevel, currentStreak);
    updateStatus();
    wrongAnswers.clear();

    setTimeout(() => {
      currentLevel++;
      currentQuestionIndex = 0;
      loadLevel(currentLevel);
    }, 600);
  } else {
    selectedBtn.classList.add("wrong");
    currentStreak = 0;

    if (wrongAnswers.has(correctName)) {
      lives = 0;
      gameOver();
      return;
    }

    wrongAnswers.add(correctName);
    lives--;
    const pointsToLose = calculatePoints(currentLevel, 0);
    score = Math.max(0, score - pointsToLose);
    updateStatus();

    if (lives <= 0) {
      gameOver();
      return;
    }

    setTimeout(() => {
      const questions = levels[currentLevel];
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * questions.length);
      } while (
        randomIndex === currentQuestionIndex ||
        questions[randomIndex].name === correctName
      );

      currentQuestionIndex = randomIndex;
      const newQuestion = questions[randomIndex];
      questionImage.src = newQuestion.image;
      questionImage.alt = `Imagem alternativa: ${newQuestion.name}`;

      const newOptions = generateOptions(currentLevel, newQuestion.name);
      renderOptions(newOptions, newQuestion.name);

      selectedBtn.classList.remove("wrong");
    }, 600);
  }

  const allButtons = document.querySelectorAll(".option-btn");
  allButtons.forEach((btn) => (btn.disabled = true));
}

// --- PERSISTÊNCIA NO SUPABASE ---
async function savePlayerToSupabase(name, score) {
  try {
    const timeElapsed = getTimeElapsed();
    const { error } = await supabase
      .from("jogadores")
      .insert([{ 
        nome: name, 
        pontuacao: score,
        tempo: timeElapsed 
      }]);
    if (error) throw error;
  } catch (e) {
    alert("Erro ao salvar pontuação no ranking: " + e.message);
  }
}

// --- RANKING GLOBAL ---
async function renderRanking() {
  rankingDiv.innerHTML = "<p>Carregando ranking...</p>";
  try {
    const { data, error } = await supabase
      .from("jogadores")
      .select("nome, pontuacao, tempo")
      .order("pontuacao", { ascending: false })
      .order("tempo", { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      rankingDiv.innerHTML = "<p>Nenhum jogador encontrado.</p>";
      return;
    }

    // Soma total de pontos e tempo médio
    const totalPontos = data.reduce(
      (acc, jogador) => acc + (jogador.pontuacao || 0),
      0
    );
    const tempoMedio = Math.floor(
      data.reduce((acc, jogador) => acc + (jogador.tempo || 0), 0) / data.length
    );
    
    // Quem está vencendo
    const lider = data[0];
    let html = `<div style='margin-bottom:10px;'><strong>Pontuação Geral:</strong> <span style='color:#FFD700;'>${totalPontos} pts</span></div>`;
    html += `<div style='margin-bottom:10px;'><strong>Tempo Médio:</strong> <span style='color:#4CAF50;'>${formatTime(tempoMedio)}</span></div>`;
    html += `<div style='margin-bottom:10px;'><strong>Líder:</strong> <span style='color:#4CAF50;'>${lider.nome}</span> <span style='color:#FFD700;'>(${lider.pontuacao} pts)</span> <span style='color:#4CAF50;'>(${formatTime(lider.tempo)})</span></div>`;
    html += '<ol style="padding-left:1.2em;">';
    
    let currentScore = null;
    let currentRank = 0;
    let sameScoreCount = 0;

    data.slice(0, 15).forEach((jogador, idx) => {
      if (jogador.pontuacao !== currentScore) {
        currentScore = jogador.pontuacao;
        currentRank = idx + 1;
        sameScoreCount = 0;
      } else {
        sameScoreCount++;
      }

      const rankDisplay = sameScoreCount > 0 ? 
        `<span style="color:#FFD700;">#${currentRank}</span>` : 
        `<span style="color:#FFD700;">#${currentRank}</span>`;

      html += `<li><strong>${jogador.nome}</strong> — <span style="color:#FFD700;">${jogador.pontuacao} pts</span> <span style="color:#4CAF50;">(${formatTime(jogador.tempo)})</span></li>`;
    });
    html += "</ol>";
    rankingDiv.innerHTML = html;
  } catch (e) {
    rankingDiv.innerHTML = "<p>Erro ao carregar ranking.</p>";
  }
}

// Criação dinâmica do modal e botão na tela de início
window.addEventListener("DOMContentLoaded", () => {
  renderRanking();
  
  // Add ranking toggle functionality
  const rankingToggle = document.getElementById("ranking-toggle");
  const rankingContainer = document.getElementById("ranking-container");
  const sidebar = document.getElementById("sidebar");
  
  // Adicionar botão de retorno na tela inicial
  const initialScreen = document.getElementById("initial-screen");
  if (initialScreen && !document.getElementById("back-to-home-btn")) {
    const backBtn = document.createElement("button");
    backBtn.id = "back-to-home-btn";
    backBtn.innerHTML = "←";
    backBtn.title = "Voltar para a tela principal";
    backBtn.onclick = () => {
      window.location.href = "../index.html";
    };
    initialScreen.insertBefore(backBtn, initialScreen.firstChild);
  }
  
  // Adicionar botão de retorno na tela de início do jogo
  if (!document.getElementById("back-to-start-btn")) {
    const backBtn = document.createElement("button");
    backBtn.id = "back-to-start-btn";
    backBtn.innerHTML = "←";
    backBtn.title = "Voltar para o menu principal";
    backBtn.onclick = () => {
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("game").style.display = "none";
      document.getElementById("initial-screen").style.display = "flex";
      resetGame();
    };
    document.getElementById("start-screen").insertBefore(backBtn, document.getElementById("start-screen").firstChild);
  }
  
  rankingToggle.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");
    rankingContainer.classList.toggle("hidden");
    if (!rankingContainer.classList.contains("hidden")) {
      rankingContainer.classList.add("expanded");
    } else {
      rankingContainer.classList.remove("expanded");
    }
  });

  // Close ranking when clicking outside
  document.addEventListener("click", (event) => {
    if (!sidebar.contains(event.target) && 
        !rankingContainer.classList.contains("hidden")) {
      sidebar.classList.remove("expanded");
      rankingContainer.classList.add("hidden");
      rankingContainer.classList.remove("expanded");
    }
  });

  const startScreen = document.getElementById("start-screen");
  if (startScreen && !document.getElementById("showFullRankingBtn")) {
    const btn = document.createElement("button");
    btn.id = "showFullRankingBtn";
    btn.textContent = "Ver Ranking Completo";
    btn.style.marginTop = "10px";
    btn.onclick = showFullRanking;
    startScreen.appendChild(btn);
  }

  // Criar o elemento do popup
  if (!document.getElementById("rankingPopup")) {
    const popup = document.createElement("div");
    popup.id = "rankingPopup";
    popup.style.display = "none";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "#0a1a42";
    popup.style.color = "#fff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    popup.style.zIndex = "9999";
    popup.style.maxWidth = "80%";
    popup.style.maxHeight = "80vh";
    popup.style.overflow = "auto";
    popup.style.textAlign = "center";
    
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Fechar";
    closeBtn.style.marginTop = "15px";
    closeBtn.style.padding = "8px 20px";
    closeBtn.style.background = "#4CAF50";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.color = "white";
    closeBtn.style.cursor = "pointer";
    
    const content = document.createElement("div");
    content.id = "rankingPopupContent";
    
    popup.appendChild(content);
    popup.appendChild(closeBtn);
    document.body.appendChild(popup);
    
    closeBtn.onclick = () => {
      popup.style.display = "none";
    };
  }
});

async function showFullRanking() {
  const popup = document.getElementById("rankingPopup");
  const content = document.getElementById("rankingPopupContent");
  
  try {
    const { data, error } = await supabase
      .from("jogadores")
      .select("nome, pontuacao, tempo")
      .order("pontuacao", { ascending: false })
      .order("tempo", { ascending: true });
    
    if (error) throw error;
    if (!data || data.length === 0) {
      content.innerHTML = "<p>Nenhum jogador encontrado.</p>";
      popup.style.display = "block";
      return;
    }
    
    let html = "<h2 style='margin-bottom: 20px;'>Top 15 Jogadores</h2>";
    html += '<ol style="text-align: left; padding-left: 20px;">';
    
    let currentScore = null;
    let currentRank = 0;
    let sameScoreCount = 0;

    data.slice(0, 15).forEach((jogador, idx) => {
      if (jogador.pontuacao !== currentScore) {
        currentScore = jogador.pontuacao;
        currentRank = idx + 1;
        sameScoreCount = 0;
      } else {
        sameScoreCount++;
      }

      const rankDisplay = sameScoreCount > 0 ? 
        `<span style="color:#FFD700;">#${currentRank}</span>` : 
        `<span style="color:#FFD700;">#${currentRank}</span>`;

      html += `<li style="margin-bottom: 10px;"> <strong>${jogador.nome}</strong> — <span style="color:#FFD700;">${jogador.pontuacao} pts</span> <span style="color:#4CAF50;">(${formatTime(jogador.tempo)})</span></li>`;
    });
    html += "</ol>";
    
    content.innerHTML = html;
    popup.style.display = "block";
  } catch (e) {
    content.innerHTML = "<p>Erro ao carregar ranking completo.</p>";
    popup.style.display = "block";
  }
}

function gameOver() {
  endTime = Date.now();
  const timeElapsed = getTimeElapsed();
  gameOverMessage.textContent = `${playerName}, você perdeu! Sua pontuação final foi ${score} pontos em ${formatTime(timeElapsed)}.`;
  savePlayerToSupabase(playerName, score).then(renderRanking);
  gameOverModal.style.display = "flex";
}

function victory() {
  endTime = Date.now();
  const timeElapsed = getTimeElapsed();
  victoryMessage.textContent = `${playerName}, você completou todos os níveis! Sua pontuação final foi ${score} pontos em ${formatTime(timeElapsed)}!`;
  savePlayerToSupabase(playerName, score).then(renderRanking);
  victoryModal.style.display = "flex";
}

// Ao carregar a página, mostrar ranking global
window.addEventListener("DOMContentLoaded", renderRanking);
