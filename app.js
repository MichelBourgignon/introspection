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
const crisisAlert = document.getElementById("crisisAlert");

let cards = [];
let explanations = {};
let remainingCards = [];
let currentCard = null;
let explanationsEnabled = localStorage.getItem("introspection-explanations") !== "false";

const adviceThemes = {
  anxiety: {
    keywords: ["stress", "anxieux", "anxieuse", "anxiété", "peur", "panique", "inquiet", "inquiète", "tension", "angoisse"],
    advice: [
      "Ce que tu décris ressemble à une surcharge émotionnelle. Essaie de séparer ce qui est immédiat de ce qui peut attendre : choisis une seule action concrète pour les prochaines dix minutes, puis reviens au reste plus tard.",
      "Lorsque l’anxiété prend de la place, essaie de revenir au présent par les sens : nomme cinq choses que tu vois, quatre que tu touches, trois que tu entends. Ensuite, demande-toi quelle est la prochaine étape la plus simple.",
      "Tu n’as pas besoin de résoudre toute la situation maintenant. Identifie un besoin immédiat — boire, marcher, respirer, parler à quelqu’un — et accorde-toi cette petite pause avant de décider quoi que ce soit."
    ]
  },
  sadness: {
    keywords: ["triste", "tristesse", "seul", "seule", "vide", "déprimé", "déprimée", "fatigué", "fatiguée", "épuisé", "épuisée", "pleurer", "larme"],
    advice: [
      "Ce que tu ressens a le droit d’exister. Pour aujourd’hui, réduis les attentes envers toi-même et choisis une chose douce : un repas simple, une douche, quelques minutes dehors ou un message à une personne sûre.",
      "La tristesse n’a pas besoin d’être réparée immédiatement. Essaie de lui laisser une place sans la laisser décider de tout : écris ce dont tu aurais besoin si quelqu’un pouvait t’aider, puis regarde s’il existe une toute petite façon de te l’offrir.",
      "Tu sembles porter beaucoup. Demander du soutien n’est pas un fardeau pour les autres ; c’est une façon de te protéger. Choisis une personne de confiance et dis-lui simplement : « J’ai besoin de parler, même sans solution. »"
    ]
  },
  anger: {
    keywords: ["colère", "énervé", "énervée", "injuste", "frustré", "frustrée", "agacé", "agacée", "rage", "irrité", "irritée"],
    advice: [
      "Ta colère semble indiquer qu’une limite ou un besoin important a été touché. Avant d’agir, essaie de la traduire en besoin : être respecté, entendu, soutenu ou libre. Cela peut t’aider à choisir une réponse plus alignée avec toi.",
      "Prends une pause avant de répondre, même de quelques minutes. Puis demande-toi : qu’est-ce que je veux protéger dans cette situation, et quelle action respecterait à la fois mes limites et mes valeurs ?",
      "La frustration peut être une information utile. Écris ce qui s’est passé, ce que tu aurais préféré, et une phrase calme que tu pourrais dire si la situation se reproduit."
    ]
  },
  uncertainty: {
    keywords: ["confus", "confuse", "perdu", "perdue", "incertain", "incertaine", "doute", "hésite", "hésitation", "choix", "décision"],
    advice: [
      "L’incertitude peut être inconfortable, mais elle signifie aussi qu’il reste des possibilités. Écris deux ou trois options, puis identifie celle qui respecte le mieux tes valeurs et ton énergie actuelle — même si elle n’est pas parfaite.",
      "Tu n’as pas besoin de trouver la réponse définitive aujourd’hui. Choisis une prochaine étape réversible : parler à quelqu’un, recueillir une information, essayer une petite action, puis réévaluer.",
      "Essaie de distinguer ce que tu sais déjà de ce qui reste inconnu. Souvent, une décision devient plus claire lorsqu’on cesse d’exiger une certitude totale avant d’avancer."
    ]
  },
  positive: {
    keywords: ["fiert", "fier", "fière", "réussi", "réussie", "progress", "content", "contente", "gratitude", "heureux", "heureuse", "joie", "soulagé", "soulagée"],
    advice: [
      "Il y a quelque chose de précieux dans ce que tu décris : prends un instant pour le reconnaître sans le minimiser. Note ce qui t’a aidé à arriver là, car cela pourra te soutenir dans un moment plus difficile.",
      "Ta progression mérite d’être célébrée, même si elle te paraît petite. Demande-toi quelle habitude, quelle personne ou quelle décision t’a aidé, puis garde une trace de cette ressource.",
      "Profite de cette énergie positive pour identifier une prochaine étape réaliste. Tu n’as pas besoin de tout transformer : choisis une action qui prolonge doucement ce qui te fait du bien."
    ]
  },
  relationships: {
    keywords: ["relation", "famille", "ami", "amie", "amour", "couple", "conflit", "separation", "séparation", "seul", "seule", "abandon"],
    advice: [
      "Les relations peuvent réveiller des besoins profonds. Essaie de séparer ce qui dépend de toi, ce qui dépend de l’autre, et ce qui peut être exprimé calmement. Une phrase honnête peut parfois ouvrir un espace de compréhension.",
      "Avant de tirer une conclusion sur la relation, demande-toi quel besoin n’est pas entendu : sécurité, respect, attention, liberté ou réassurance. Cela peut t’aider à formuler une demande plus claire.",
      "Tu as le droit de protéger ton bien-être tout en restant ouvert·e au dialogue. Choisis une limite simple et une phrase respectueuse que tu pourrais dire si la situation se reproduit."
    ]
  },
  overload: {
    keywords: ["travail", "boulot", "études", "école", "examen", "pression", "charge", "burn", "épuisement", "trop", "débordé", "débordée"],
    advice: [
      "Ta charge semble dépasser ce que tu peux porter seul·e aujourd’hui. Choisis une priorité réelle, découpe la tâche la plus lourde en une étape de cinq minutes, puis protège un moment de récupération.",
      "Tu n’as pas à prouver ta valeur par l’épuisement. Fais la liste de ce qui est urgent, de ce qui peut attendre, et de ce qui peut être demandé à quelqu’un d’autre.",
      "Essaie de remplacer « je dois tout faire » par : « quelle est la prochaine action la plus utile ? ». Une seule étape terminée peut déjà réduire la pression."
    ]
  }
};

const fallbackAdvice = [
  "Ta réflexion mérite d’être accueillie sans jugement. Demande-toi : quel est le besoin le plus important derrière ce que je ressens, et quelle petite action pourrait y répondre aujourd’hui ?",
  "Essaie de reformuler ton expérience en une phrase : « Je traverse… et j’ai besoin de… ». Cela peut rendre la prochaine étape plus claire.",
  "Prends quelques respirations lentes, puis sépare ce qui est sous ton contrôle de ce qui ne l’est pas. Choisis une seule action sur ce que tu peux influencer.",
  "Sois aussi bienveillant envers toi-même que tu le serais avec un proche dans la même situation. La progression compte souvent plus que la perfection.",
  "Écris une chose que tu as traversée, une chose que tu as apprise, et une chose que tu veux protéger demain. Cela peut aider à reprendre un peu de perspective."
];

const crisisKeywords = [
  "suicide", "suicidaire", "me suicider", "mourir", "me tuer", "tuer",
  "me faire du mal", "me blesser", "automutilation", "me couper", "me scarifier",
  "je veux disparaître", "disparaître pour toujours", "plus envie de vivre",
  "plus envie d’être là", "finir mes jours", "overdose"
];

function isCrisisText(text) {
  const normalized = text.toLowerCase();
  return crisisKeywords.some(keyword => normalized.includes(keyword));
}

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
  return selected === "all" ? cards : cards.filter(card => card.categorie === selected);
}

function loadDeck() {
  remainingCards = [...getFilteredCards()];
}

function getRandomCard() {
  if (remainingCards.length === 0) loadDeck();
  const index = Math.floor(Math.random() * remainingCards.length);
  const selected = remainingCards[index];
  remainingCards.splice(index, 1);
  return selected;
}

function generateAdvice(text) {
  const normalized = text.toLowerCase();
  const matchingThemes = Object.values(adviceThemes).filter(theme =>
    theme.keywords.some(keyword => normalized.includes(keyword))
  );

  if (matchingThemes.length === 0) {
    return fallbackAdvice[Math.floor(Math.random() * fallbackAdvice.length)];
  }

  const theme = matchingThemes[Math.floor(Math.random() * matchingThemes.length)];
  return theme.advice[Math.floor(Math.random() * theme.advice.length)];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
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
      const distance = Math.hypot(particleX - event.clientX, particleY - event.clientY);
      if (distance < 120) {
        const force = (120 - distance) / 120;
        particle.style.translate = `${(particleX - event.clientX) * force * 0.3}px ${(particleY - event.clientY) * force * 0.3}px`;
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

  const savedEntry = getJournal().find(item => item.cardId === selected.id);
  journalQuestion.textContent = selected.question;
  journalText.value = savedEntry ? savedEntry.text : "";
  journalSection.classList.remove("hidden");
  adviceSection.classList.add("hidden");
  crisisAlert.classList.add("hidden");

  if (savedEntry?.advice) {
    adviceText.textContent = savedEntry.advice;
    adviceSection.classList.remove("hidden");
  }

  if (savedEntry && isCrisisText(savedEntry.text)) {
    crisisAlert.classList.remove("hidden");
  }

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

function renderJournal() {
  const entries = getJournal();
  if (entries.length === 0) {
    savedSection.classList.add("hidden");
    return;
  }
  savedSection.classList.remove("hidden");
  savedEntries.innerHTML = "";

  entries.slice().reverse().forEach(entry => {
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

    const entryDate = formatDate(entry.date);
    if (entryDate) {
      const date = document.createElement("p");
      date.className = "entry-date";
      date.textContent = `Enregistré le ${entryDate}`;
      article.append(date);
    }

    if (entry.advice) {
      const advice = document.createElement("p");
      advice.className = "saved-advice";
      advice.textContent = `Conseil : ${entry.advice}`;
      article.append(advice);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "secondary";
    deleteButton.textContent = "Supprimer ma réponse";

    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm("Supprimer cette réponse de ce navigateur ? Cette action est définitive.");
      if (!confirmed) return;
      try {
        const remainingEntries = getJournal().filter(item => item.cardId !== entry.cardId);
        saveJournal(remainingEntries);
        if (currentCard?.id === entry.cardId) {
          journalText.value = "";
          adviceSection.classList.add("hidden");
          adviceText.textContent = "";
          crisisAlert.classList.add("hidden");
        }
        renderJournal();
        saveStatus.textContent = "Réponse supprimée.";
      } catch {
        saveStatus.textContent = "La suppression a échoué. Réessaie dans quelques instants.";
      }
    });

    article.append(deleteButton);
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
    if (currentCard) showCard(currentCard);
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
    crisisAlert.classList.add("hidden");
  });

  drawButton.addEventListener("click", () => showCard(getRandomCard()));
  card.addEventListener("click", () => showCard(getRandomCard()));

  resetButton.addEventListener("click", () => {
    loadDeck();
    currentCard = null;
    card.classList.remove("flipped");
    cardTools.classList.add("hidden");
    journalSection.classList.add("hidden");
    adviceSection.classList.add("hidden");
    crisisAlert.classList.add("hidden");
  });

  favoriteButton.addEventListener("click", () => {
    if (!currentCard) return;
    const favorites = getFavorites();
    const index = favorites.indexOf(currentCard.id);
    if (index === -1) favorites.push(currentCard.id);
    else favorites.splice(index, 1);
    saveFavorites(favorites);
    updateFavoriteButton();
  });

  journalButton.addEventListener("click", () => journalSection.classList.toggle("hidden"));

  saveJournalButton.addEventListener("click", () => {
    if (!currentCard) return;
    const text = journalText.value.trim();
    if (!text) {
      saveStatus.textContent = "Écris d’abord ta réflexion.";
      adviceSection.classList.add("hidden");
      crisisAlert.classList.add("hidden");
      return;
    }

    const advice = generateAdvice(text);
    const entries = getJournal().filter(item => item.cardId !== currentCard.id);
    entries.push({
      cardId: currentCard.id,
      text,
      advice,
      date: new Date().toISOString()
    });
    saveJournal(entries);
    renderJournal();
    saveStatus.textContent = "Réflexion enregistrée.";

    adviceText.textContent = advice;
    adviceSection.classList.remove("hidden");

    if (isCrisisText(text)) {
      crisisAlert.classList.remove("hidden");
    } else {
      crisisAlert.classList.add("hidden");
    }
  });
}

init();
