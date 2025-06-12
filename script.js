let currentSlide = 0;
const slides = document.querySelectorAll(".carousel-slide");
const totalSlides = slides.length;
const carousel = document.getElementById("carousel");
const carouselNav = document.getElementById("carouselNav");
const carouselContainer = document.querySelector(".carousel-container");

// Drag/Touch variables
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationId = 0;
let startTime = 0;

// Create navigation dots
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement("div");
  dot.classList.add("nav-dot");
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(i));
  dot.setAttribute("aria-label", `Ir para slide ${i + 1}`);
  carouselNav.appendChild(dot);
}

// Create progress bar
const progressBar = document.createElement("div");
progressBar.classList.add("carousel-progress");
carouselContainer.appendChild(progressBar);

function updateCarousel() {
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update navigation dots
  document.querySelectorAll(".nav-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });

  // Update progress bar
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = `${progress}%`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

// Enhanced drag functionality
function getPositionX(event) {
  return event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;
}

function dragStart(event) {
  isDragging = true;
  startPos = getPositionX(event);
  startTime = Date.now();

  prevTranslate = -currentSlide * carouselContainer.offsetWidth;
  currentTranslate = prevTranslate;

  carousel.classList.add("dragging");
  animationId = requestAnimationFrame(animation);
  stopAutoAdvance();

  // Prevent default behavior for touch events
  if (event.type === "touchstart") {
    event.preventDefault();
  }
}

function dragMove(event) {
  if (!isDragging) return;

  const currentPosition = getPositionX(event);
  const diff = currentPosition - startPos;

  // Add resistance at edges
  let resistance = 1;
  if (
    (currentSlide === 0 && diff > 0) ||
    (currentSlide === totalSlides - 1 && diff < 0)
  ) {
    resistance = 0.3;
  }

  currentTranslate = prevTranslate + diff * resistance;

  // Prevent default to avoid scrolling
  if (event.type === "touchmove") {
    event.preventDefault();
  }
}

function dragEnd(event) {
  if (!isDragging) return;

  isDragging = false;
  cancelAnimationFrame(animationId);
  carousel.classList.remove("dragging");

  const movedBy = currentTranslate - prevTranslate;
  const threshold = carouselContainer.offsetWidth * 0.2; // 20% threshold
  const dragTime = Date.now() - startTime;
  const velocity = Math.abs(movedBy) / dragTime;

  // Determine if we should change slides based on distance or velocity
  if (Math.abs(movedBy) > threshold || velocity > 0.5) {
    if (movedBy < 0 && currentSlide < totalSlides - 1) {
      nextSlide();
    } else if (movedBy > 0 && currentSlide > 0) {
      prevSlide();
    } else {
      updateCarousel();
    }
  } else {
    updateCarousel();
  }

  prevTranslate = -currentSlide * carouselContainer.offsetWidth;
  currentTranslate = prevTranslate;

  setTimeout(startAutoAdvance, 3000);
}

function animation() {
  if (isDragging) {
    carousel.style.transform = `translateX(${currentTranslate}px)`;
    requestAnimationFrame(animation);
  }
}

// Mouse events
carouselContainer.addEventListener("mousedown", dragStart);
carouselContainer.addEventListener("mousemove", dragMove);
carouselContainer.addEventListener("mouseup", dragEnd);
carouselContainer.addEventListener("mouseleave", dragEnd);

// Touch events with proper passive handling
carouselContainer.addEventListener("touchstart", dragStart, { passive: false });
carouselContainer.addEventListener("touchmove", dragMove, { passive: false });
carouselContainer.addEventListener("touchend", dragEnd, { passive: true });
carouselContainer.addEventListener("touchcancel", dragEnd, { passive: true });

// Prevent context menu on long press
carouselContainer.addEventListener("contextmenu", (e) => {
  if (isDragging) e.preventDefault();
});

// Auto-advance carousel
let autoAdvance;
function startAutoAdvance() {
  stopAutoAdvance();
  autoAdvance = setInterval(() => {
    if (!isDragging) {
      nextSlide();
    }
  }, 8000);
}

function stopAutoAdvance() {
  clearInterval(autoAdvance);
}

// Mobile menu functions
function toggleMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  navMenu.classList.toggle("active");
}

function closeMobileMenu() {
  const navMenu = document.getElementById("navMenu");
  navMenu.classList.remove("active");
}

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  const navMenu = document.getElementById("navMenu");
  const menuBtn = document.querySelector(".mobile-menu-btn");

  if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
    navMenu.classList.remove("active");
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up");
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll(".section-title").forEach((el) => {
  observer.observe(el);
});

// Add keyboard navigation for carousel
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    prevSlide();
    stopAutoAdvance();
  } else if (e.key === "ArrowRight") {
    nextSlide();
    stopAutoAdvance();
  }
});

// Initialize
updateCarousel();
startAutoAdvance();

// Pause auto-advance when page is not visible
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoAdvance();
  } else {
    startAutoAdvance();
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  prevTranslate = -currentSlide * carouselContainer.offsetWidth;
  currentTranslate = prevTranslate;
  updateCarousel();
});

// Intersection observer for carousel to pause when not visible
const carouselObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAutoAdvance();
      } else {
        stopAutoAdvance();
      }
    });
  },
  { threshold: 0.5 }
);

carouselObserver.observe(carouselContainer);

// Voting system
function vote(featureId) {
  // Here you would typically send the vote to a backend server
  const button = event.currentTarget;
  button.classList.add("voted");
  button.innerHTML =
    '<span class="vote-icon">✓</span><span class="vote-text">Votado!</span>';
  button.disabled = true;

  // Show a thank you message
  alert("Obrigado pelo seu voto!");
}

// Add smooth scrolling for new sections
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// --- RANKING SUPABASE ---
const supabaseUrl = "https://zbzxchsusbenhikxyumw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpienhjaHN1c2Jlbmhpa3h5dW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzc0NDgsImV4cCI6MjA2NDY1MzQ0OH0.dgD9P2kBdMd4N4QzZwIsPOMpe7XpUXPqE3R5l5u1Fiw";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const verRankingBtn = document.getElementById("verRankingBtn");
const rankingModal = document.getElementById("rankingModal");
const fecharRankingBtn = document.getElementById("fecharRankingBtn");
const rankingConteudo = document.getElementById("rankingConteudo");

verRankingBtn.addEventListener("click", async () => {
  rankingModal.style.display = "flex";
  rankingConteudo.innerHTML = "<p>Carregando ranking...</p>";
  const { data, error } = await supabase
    .from("jogadores")
    .select("*")
    .order("pontuacao", { ascending: false })
    .limit(20);
  if (error) {
    rankingConteudo.innerHTML = "<p>Erro ao carregar ranking.</p>";
    return;
  }
  if (!data || data.length === 0) {
    rankingConteudo.innerHTML = "<p>Nenhum jogador encontrado.</p>";
    return;
  }
  let html = '<ol style="padding-left: 1.2em;">';
  data.forEach((jogador, idx) => {
    html += `<li><strong>${jogador.nome}</strong> — <span style="color:#007bff;">${jogador.pontuacao} pts</span></li>`;
  });
  html += "</ol>";
  rankingConteudo.innerHTML = html;
});

fecharRankingBtn.addEventListener("click", () => {
  rankingModal.style.display = "none";
});

// Fechar modal ao clicar fora do conteúdo
rankingModal.addEventListener("click", (e) => {
  if (e.target === rankingModal) {
    rankingModal.style.display = "none";
  }
});
