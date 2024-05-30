// Variable globale : l'id du deck utilisé, dans lequel on pioche
let idDeck = null;

// Constante globale : l'URI du endpoint de demande de nouveau deck
const API_ENDPOINT_NEW_DECK = "https://deckofcardsapi.com/api/deck/new/";

// Fonctions (syntaxe de fonction fléchée) qui renvoient des URI dynamiques de demande de mélange du deck et de pioche
const getApiEndpointShuffleDeck = () =>
  `https://deckofcardsapi.com/api/deck/${idDeck}/shuffle/`;

// Fonctions (syntaxe de fonction fléchée) qui renvoient des URI dynamiques de demande de mélange du deck et de pioche
const getApiEndpointDrawCard = () =>
  `https://deckofcardsapi.com/api/deck/${idDeck}/draw/?count=1`;

// Supprime les cartes de l'ancien deck du DOM
const cleanDomCardsFromPreviousDeck = () =>
  // Récupération des cartes (classes CSS "card")
  document
    .querySelectorAll(".card")
    // et pour chacune de ses cartes
    .forEach((child) =>
      // suppression du DOM
      child.remove()
    );

// Eléments HTML utiles pour les événements et pour la manipulation du DOM
const cardsContainer = document.getElementById("cards-container");
const actionResetButton = document.getElementById("action-reset");
const actionDrawButton = document.getElementById("action-draw");
const remainingCardsElement = document.getElementById("remaining-cards");

actionResetButton.addEventListener("click", actionReset);
actionDrawButton.addEventListener("click", actionDraw);

// Fonction qui fait le fetch(), qui contacte l'API
async function callAPI(uri) {
  console.log("-- CALL API - start --");
  console.log("uri = ", uri);

  try {
    // fetch(), appel à l'API et réception de la réponse
    const response = await fetch(uri);
    console.log("response = ", response);

    // Vérification de la réponse HTTP
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }

    // Récupration des données JSON reçues de l'API
    const data = await response.json();
    console.log("data = ", data);

    console.log("-- callAPI - end --");

    // Renvoi des données
    return data;
  } catch (error) {
    console.error("Error in callAPI:", error);
    throw error; // Répéter l'erreur pour la gérer à un niveau supérieur si nécessaire
  }
}

// Fonction de demande de nouveau deck
async function getNewDeck() {
  console.log(">> getNewDeck");
  return await callAPI(API_ENDPOINT_NEW_DECK);
}

// Fonction de demande de mélange du deck
async function shuffleDeck() {
  console.log(">> shuffleDeck");
  return await callAPI(getApiEndpointShuffleDeck());
}

// Fonction de demande de pioche dans le deck
async function drawCard() {
  console.log(">> drawCard");
  const response = await callAPI(getApiEndpointDrawCard());
  console.log("Remaining cards in the deck : ", response.remaining);

  remainingCardsElement.textContent =
    "There is " + response.remaining + " card(s) left";

  if (response.remaining == 0) {
    console.log("There is no card left in the deck");
    actionDrawButton.disabled = true;
    actionDrawButton.style.display = "none";
  }
  return response;
}

// Fonction de réinitialisation (demande de nouveau deck + demande de mélange de ce nouveau deck)
async function actionReset() {
  actionDrawButton.disabled = false;
  actionDrawButton.style.display = "block";

  remainingCardsElement.textContent = "";

  // Vider dans le DOM les cartes de l'ancien deck
  cleanDomCardsFromPreviousDeck();

  // Récupération d'un nouveau deck
  const newDeckResponse = await getNewDeck();

  // Récupération de l'ID de ce nouveau deck dan les données reçues et mise à jour de la variable globale
  idDeck = newDeckResponse.deck_id;

  // Mélange du deck
  await shuffleDeck();
}

// Ajoute une carte dans le DOM (dans la zone des cartes piochées) d'après l'URI de son image
function addCardToDomByImgUri(imgUri) {
  // Création de l'élément HTML "img", de classe CSS "card" et avec pour attribut HTML "src" l'uRI reçue en argument
  const imgCardHtmlElement = document.createElement("img");
  imgCardHtmlElement.classList.add("card");
  imgCardHtmlElement.src = imgUri;

  // Ajout de cette image dans la zone des cartes piochées (en dernière position, dernier enfant de cardsContainer)
  cardsContainer.append(imgCardHtmlElement);
}

// Fonction qui demande à piocher une carte, puis qui fait l'appel pour l'intégrer dans le DOM
async function actionDraw() {
  // Appel à l'API pour demander au croupier de piocher une carte et de nous la renvoyer
  const drawCardResponse = await drawCard();
  console.log("drawCardResponse = ", drawCardResponse);

  // Récupération de l'URI de l'image de cette carte dans les données reçues
  const imgCardUri = drawCardResponse.cards[0].image;

  // Ajout de la carte piochée dans la zone des cartes piochées
  addCardToDomByImgUri(imgCardUri);
}

actionReset();
