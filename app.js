const card = document.getElementById("card");
const drawButton = document.getElementById("drawButton");
const resetButton = document.getElementById("resetButton");
const cardCategory = document.getElementById("cardCategory");
const cardQuestion = document.getElementById("cardQuestion");
const cardHint = document.getElementById("cardHint");
const cardExample = document.getElementById("cardExample");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggle = document.getElementById("themeToggle");
const cardTools = document.getElementById("cardTools");
const favoriteButton = document.getElementById("favoriteButton");
const journalButton = document.getElementById("journalButton");
const journalSection = document.getElementById("journalSection");
const journalQuestion = document.getElementById("journalQuestion");
const journalText = document.getElementById("journalText");
const saveJournalButton = document.getElementById("saveJournalButton");
const saveStatus = document.getElementById("saveStatus");
const savedSection = document.getElementById("savedSection");
const savedEntries = document.getElementById("savedEntries");

let cards = [];
let explanations = {};
let remainingCards = [];
let currentCard = null;

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "light" ? "☀" : "☾";
  localStorage.setItem("introspection-theme", theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem("introspection-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(savedTheme || (prefersLight ? "light" : "dark"));
}

function getCardExplanation(card) {
  return explanations[card.id] || {};
}

function getFilteredCards() {
  const selected = categoryFilter.value;
  return selected === "all"
    ? cards
    : cards.filter(card => card.categorie === selected);
}

function loadDeck() {
  remainingCards = [...getFilteredCards()];
}

function getRandomCard() {
  if (remainingCards.length === 0) {
    loadDeck();
  }

  const index = Math.floor(Math.random() * remainingCards.length);
  const selected = remainingCards[index];
  remainingCards.splice(index, 1);
  return selected;
}

function addTiltEffect() {
  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    card.classList.add("tilting");
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
    card.classList.remove("tilting");
  });
}

function createParticles() {
  const container = document.querySelector(".particles");
  const count = 25;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";

    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = 8 + Math.random() * 10 + "s";
    particle.style.animationDelay = Math.random() * 10 + "s";
    particle.style.opacity = 0.2 + Math.random() * 0.3;

    container.append(particle);
  }
}

function showCard(selected) {
  currentCard = selected;
  const explanation = getCardExplanation(selected);

  cardCategory.textContent = selected.categorie;
  cardQuestion.textContent = selected.question;

  if (explanation.aide) {
    cardHint.textContent = explanation.aide;
    cardHint.classList.remove("hidden");
  } else {
    cardHint.textContent = "";
    cardHint.classList.add("hidden");
  }

  if (explanation.exemple) {
    cardExample.textContent = explanation.exemple;
    cardExample.classList.remove("hidden");
  } else {
    cardExample.textContent = "";
    cardExample.classList.add("hidden");
  }

  card.classList.remove("flipped");

  setTimeout(() => {
    card.classList.add("flipped");
    cardTools.classList.remove("hidden");
  }, 120);

  journalQuestion.textContent = selected.question;
  journalText.value = getSavedReflection(selected.id) || "";
  journalSection.classList.remove("hidden");

  updateFavoriteButton();
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("introspection-favorites") || "[]");
}

function saveFavorites(favorites) {
  localStorage.setItem("introspection-favorites", JSON.stringify(favorites));
}

function updateFavoriteButton() {
  const favorites = getFavorites();
  const isFavorite = currentCard && favorites.includes(currentCard.id);
  favoriteButton.textContent = isFavorite ? "★ Favori" : "☆ Mettre en favori";
}

function getJournal() {
  return JSON.parse(localStorage.getItem("introspection-journal") || "[]");
}

function saveJournal(entries) {
  localStorage.setItem("introspection-journal", JSON.stringify(entries));
}

function getSavedReflection(cardId) {
  const entry = getJournal().find(item => item.cardId === cardId);
  return entry ? entry.text : "";
}

function renderJournal() {
  const entries = getJournal();

  if (entries.length === 0) {
    savedSection.classList.add("hidden");
    return;
  }

  savedSection.classList.remove("hidden");
  savedEntries.innerHTML = "";

  entries
    .slice()
    .reverse()
    .forEach(entry => {
      const cardData = cards.find(item => item.id === entry.cardId);
      const article = document.createElement("article");
      article.className = "saved-entry";

      const category = document.createElement("span");
      category.className = "category";
      category.textContent = cardData ? cardData.categorie : "Carte";

      const question = document.createElement("p");
      question.textContent = cardData ? cardData.question : "";

      const reflection = document.createElement("p");
      reflection.textContent = entry.text;

      article.append(category, question, reflection);
      savedEntries.append(article);
    });
}

async function init() {
  const [cardsResponse, explanationsResponse] = await Promise.all([
    fetch("cards.json"),
    fetch("explanations.json")
  ]);

  cards = await cardsResponse.json();
  explanations = await explanationsResponse.json();

  initTheme();
  addTiltEffect();
  createParticles();
  loadDeck();
  renderJournal();

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  const categories = [...new Set(cards.map(card => card.categorie))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  categoryFilter.addEventListener("change", () => {
    loadDeck();
    currentCard = null;
    card.classList.remove("flipped");
    cardTools.classList.add("hidden");
    journalSection.classList.add("hidden");
  });

  drawButton.addEventListener("click", () => {
    showCard(getRandomCard());
  });

  card.addEventListener("click", () => {
    showCard(getRandomCard());
  });

  resetButton.addEventListener("click", () => {
    loadDeck();
    currentCard = null;
    card.classList.remove("flipped");
    cardTools.classList.add("hidden");
    journalSection.classList.add("hidden");
  });

  favoriteButton.addEventListener("click", () => {
    if (!currentCard) return;

    const favorites = getFavorites();
    const index = favorites.indexOf(currentCard.id);

    if (index === -1) {
      favorites.push(currentCard.id);
    } else {
      favorites.splice(index, 1);
    }

    saveFavorites(favorites);
    updateFavoriteButton();
  });

  journalButton.addEventListener("click", () => {
    journalSection.classList.toggle("hidden");
  });

  saveJournalButton.addEventListener("click", () => {
    if (!currentCard) return;

    const text = journalText.value.trim();

    if (!text) {
      saveStatus.textContent = "Écris d’abord ta réflexion.";
      return;
    }

    const entries = getJournal().filter(item => item.cardId !== currentCard.id);
    entries.push({
      cardId: currentCard.id,
      text,
      date: new Date().toISOString()
    });

    saveJournal(entries);
    renderJournal();
    saveStatus.textContent = "Réflexion enregistrée.";
  });
}

init();
