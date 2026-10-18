const card = document.getElementById("card");
const drawButton = document.getElementById("drawButton");
const resetButton = document.getElementById("resetButton");
const cardCategory = document.getElementById("cardCategory");
const cardQuestion = document.getElementById("cardQuestion");
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
let remainingCards = [];
let currentCard = null;

function loadDeck() {
  remainingCards = [...cards];
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

function showCard(selected) {
  currentCard = selected;
  cardCategory.textContent = selected.categorie;
  cardQuestion.textContent = selected.question;

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
  const response = await fetch("cards.json");
  cards = await response.json();

  loadDeck();
  renderJournal();

  drawButton.addEventListener("click", () => {
    showCard(getRandomCard());
  });

  card.addEventListener("click", () => {
    if (currentCard) {
      card.classList.toggle("flipped");
    }
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
