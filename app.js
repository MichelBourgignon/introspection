const card = document.getElementById("card");
const drawButton = document.getElementById("drawButton");
const resetButton = document.getElementById("resetButton");
const cardCategory = document.getElementById("cardCategory");
const cardQuestion = document.getElementById("cardQuestion");
const cardHint = document.getElementById("cardHint");
const cardExample = document.getElementById("cardExample");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggle = document.getElementById("themeToggle");
const explanationToggle = document.getElementById("explanationToggle");
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
const adviceSection = document.getElementById("adviceSection");
const adviceText = document.getElementById("adviceText");

let cards = [];
let explanations = {};
let remainingCards = [];
let currentCard = null;
let explanationsEnabled = localStorage.getItem("introspection-explanations") !== "false";

const adviceRules = [
  {
    keywords: ["stress", "anxieux", "anxiété", "peur", "panique", "inquiet", "inquiète", "tension"],
    advice: "Ton texte semble porter de la tension. Essaie de nommer précisément ce qui te pèse aujourd’hui, puis choisis une seule action très petite pour reprendre un peu de contrôle : respirer cinq minutes, marcher, écrire, ou parler à quelqu’un de confiance."
  },
  {
    keywords: ["triste", "tristesse", "seul", "seule", "vide", "déprimé", "déprimée", "fatigué", "fatiguée", "épuisé", "épuisée"],
    advice: "Ce que tu décris demande de la douceur. Tu n’as pas besoin de tout régler aujourd’hui : priorise le repos, une activité simple qui te fait du bien, et un contact humain bienveillant. Demander de l’aide est une force, pas un échec."
  },
  {
    keywords: ["colère", "énervé", "énervée", "injuste", "frustré", "frustrée", "agacé", "agacée"],
    advice: "Ta colère semble signaler qu’une limite ou un besoin important a été touché. Avant d’agir, essaie d’identifier le besoin derrière l’émotion : être respecté, entendu, soutenu ou libre. Une pause peut t’aider à répondre plutôt qu’à réagir."
  },
  {
    keywords: ["confus", "confuse", "perdu", "perdue", "incertain", "incertaine", "doute", "hésite", "hésitation"],
    advice: "L’incertitude peut être inconfortable, mais elle laisse de la place au choix. Écris deux ou trois options possibles, puis demande-toi laquelle respecte le mieux tes valeurs et ton énergie actuelle. Tu n’as pas besoin d’une réponse parfaite immédiatement."
  },
  {
    keywords: ["fiert", "fier", "fière", "réussi", "réussie", "progress", "content", "contente", "gratitude", "heureux", "heureuse", "joie"],
    advice: "Il y a quelque chose de positif à reconnaître dans ta réflexion. Prends un instant pour savourer cette progression, et note ce qui t’a aidé à y arriver : tu pourras t’appuyer dessus lors d’un moment plus difficile."
  },
  {
    keywords: ["relation", "famille", "ami", "amie", "amour", "couple", "conflit", "separation", "séparation"],
    advice: "Les relations peuvent réveiller des besoins profonds. Essaie de distinguer ce qui dépend de toi, ce qui dépend de l’autre, et ce qui peut être exprimé calmement. Une phrase honnête et respectueuse peut parfois ouvrir un espace de compréhension."
  },
  {
    keywords: ["travail", "boulot", "études", "école", "examen", "pression", "charge", "burn", "épuisement"],
    advice: "Ta charge semble peser. Choisis une priorité réelle plutôt que d’essayer de tout porter, découpe la tâche la plus lourde en une première étape de cinq minutes, et protège un moment de récupération dans ta journée."
  }
];

const fallbackAdvice = [
  "Ta réflexion mérite d’être accueillie sans jugement. Choisis une seule petite action qui te rapproche de ce dont tu as besoin aujourd’hui, même si elle paraît minuscule.",
  "Essaie de reformuler ce que tu ressens en une phrase simple : « J’ai besoin de… ». Cela peut t’aider à voir plus clairement la prochaine étape.",
  "Prends quelques respirations lentes, puis demande-toi : qu’est-ce qui est sous mon contrôle maintenant, et qu’est-ce que je peux déposer pour l’instant ?",
  "Sois aussi bienveillant envers toi-même que tu le serais avec un proche dans la même situation. La progression compte souvent plus que la perfection."
];

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

function updateExplanationToggle() {
  explanationToggle.textContent = explanationsEnabled ? "Explications : activées" : "Explications : désactivées";
  explanationToggle.setAttribute("aria-pressed", String(explanationsEnabled));
}

function getCardExplanation(card) {
  if (!explanationsEnabled) return {};
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

function generateAdvice(text) {
  const normalized = text.toLowerCase();
  const matchingRules = adviceRules.filter(rule =>
    rule.keywords.some(keyword => normalized.includes(keyword))
  );

  if (matchingRules.length === 0) {
    return fallbackAdvice[Math.floor(Math.random() * fallbackAdvice.length)];
  }

  const rule = matchingRules[Math.floor(Math.random() * matchingRules.length)];
  return rule.advice;
}

function addTiltEffect() {
  card.addEventListener("mousemove", event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.04)`;
    card.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
    card.classList.add("tilting");
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
    card.classList.remove("tilting");
  });
}

function createParticles() {
  const container = document.querySelector(".particles");
  const count = 25;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";

    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = 8 + Math.random() * 10 + "s";
    particle.style.animationDelay = Math.random() * 10 + "s";
    particle.style.opacity = 0.2 + Math.random() * 0.3;

    container.append(particle);
    particles.push(particle);
  }

  document.addEventListener("mousemove", event => {
    particles.forEach(particle => {
      const rect = particle.getBoundingClientRect();
      const particleX = rect.left + rect.width / 2;
      const particleY = rect.top + rect.height / 2;

      const distanceX = particleX - event.clientX;
      const distanceY = particleY - event.clientY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < 120) {
        const force = (120 - distance) / 120;
        particle.style.translate = `${distanceX * force * 0.3}px ${distanceY * force * 0.3}px`;
      } else {
        particle.style.translate = "0px 0px";
      }
    });
  });
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
  }, 180);

  journalQuestion.textContent = selected.question;
  journalText.value = getSavedReflection(selected.id) || "";
  journalSection.classList.remove("hidden");
  adviceSection.classList.add("hidden");
  adviceText.textContent = "";

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

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "secondary";
      deleteButton.textContent = "Supprimer ma réponse";

      deleteButton.addEventListener("click", () => {
        const confirmed = window.confirm(
          "Supprimer cette réponse de ce navigateur ? Cette action est définitive."
        );

        if (!confirmed) return;

        try {
          const remainingEntries = getJournal().filter(
            item => item.cardId !== entry.cardId
          );

          saveJournal(remainingEntries);

          if (currentCard?.id === entry.cardId) {
            journalText.value = "";
            adviceSection.classList.add("hidden");
            adviceText.textContent = "";
          }

          renderJournal();
          saveStatus.textContent = "Réponse supprimée.";
        } catch {
          saveStatus.textContent =
            "La suppression a échoué. Réessaie dans quelques instants.";
        }
      });

      article.append(category, question, reflection, deleteButton);
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
  updateExplanationToggle();
  addTiltEffect();
  createParticles();
  loadDeck();
  renderJournal();

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  explanationToggle.addEventListener("click", () => {
    explanationsEnabled = !explanationsEnabled;
    localStorage.setItem("introspection-explanations", String(explanationsEnabled));
    updateExplanationToggle();

    if (currentCard) {
      showCard(currentCard);
    }
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
    adviceSection.classList.add("hidden");
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
    adviceSection.classList.add("hidden");
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
      adviceSection.classList.add("hidden");
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

    adviceText.textContent = generateAdvice(text);
    adviceSection.classList.remove("hidden");
  });
}

init();
