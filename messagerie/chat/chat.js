//Variables de l'état de la page
let currentChannel = Local.readCurrentChannel();
let currentUser = null;
let unsubscribeMessages = null;

// Element du DOM
const inputMessage = document.getElementById("message-input");
const divMessages = document.getElementById("chat-display-box");
const formMessage = document.getElementById("form-message");
const spanChannelTitle = document.getElementById("span-channel-title");
const linkLogout = document.getElementById("link-logout");


// Envoi d'un message lors de la soumission du formulaire
formMessage.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Verif si le user est bien connecté
  if (!currentUser) {
    alert("Vous devez être connecté pour envoyer un message.");
    window.location.replace("../signin.html");
    return;
  }

  // Verifie que le message n'est pas vide
  const content = inputMessage.value.trim();
  if (!content) return;

  // Enregistrement du message dans Supabase
  const channelId = currentChannel ? currentChannel.id : null;
  const { data, error } = await Data.sendMessage(
    channelId,
    content,
    currentUser.email
  );

  if (error) {
    console.error("Erreur d'envoi :", error.message);
    alert("Erreur lors de l'envoi du message.");
    return;
  }

  // Affiche le message de l'utilisateur (en vert)
  if (data && data.length > 0) {
    appendMessage(data[0]);
  }

  // Vide la zone de texte
  inputMessage.value = "";
  inputMessage.focus();
});

// Envoi avec la touche Entrée
inputMessage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formMessage.requestSubmit();
  }
});

// Déconnexion lors du clic sur Logout
if (linkLogout) {
  linkLogout.addEventListener("click", async (event) => {
    event.preventDefault();
    await Auth.signOut();
    Local.clearSession();
    window.location.replace("../signin.html");
  });
}

// Redirection si la session prend fin
Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("../signin.html");
});

// Gestion des salons
async function loadChannels() {
  const { data: channels, error } = await Data.fetchChannels();
  if (error) {
    console.error("Impossible de charger les salons :", error.message);
    return;
  }

  // S'il y a déjà un salon dans la base, on l'utilise
  if (channels && channels.length > 0) {
    currentChannel = channels[0];
    Local.writeCurrentChannel(currentChannel);
  } else {
    // Sinon on crée un salon par défaut "Général"
    const { data: created } = await Data.createChannel("Général");
    if (created && created.length > 0) {
      currentChannel = created[0];
      Local.writeCurrentChannel(currentChannel);
    }
  }

  if (currentChannel) {
    showChannelTitle(currentChannel.name);
  }
}

function showChannelTitle(title) {
  if (spanChannelTitle) {
    spanChannelTitle.textContent = "# " + title;
  }
}

//Affichage des messages
async function loadMessages() {
  const channelId = currentChannel ? currentChannel.id : null;
  const { data: messages, error } = await Data.fetchMessages(channelId);

  if (error) {
    console.error("Impossible de charger les messages :", error.message);
    return;
  }

  divMessages.replaceChildren();
  messages.forEach((message) => {
    displayMessage(message);
  });
  scrollMessages();
}

function appendMessage(message) {
  displayMessage(message);
  scrollMessages();
}

function displayMessage(message) {
  // Evite d'afficher deux fois le même message
  if (message.id && divMessages.querySelector(`[data-id="${message.id}"]`)) {
    return;
  }

  // Vert si l'utilisateur connecté est l'auteur, gris si c'est qqn d'autre
  const isSent = currentUser && (
    message.user_id == currentUser.id ||
    (message.username && currentUser.email && message.username === currentUser.email)
  );

  // Conteneur du message (sent = vert à droite, received = gris à gauche)
  const msgElement = document.createElement("div");
  msgElement.className = `message ${isSent ? "sent" : "received"}`;
  if (message.id) {
    msgElement.setAttribute("data-id", message.id);
  }

  // Nom de l'expediteur pour les messages reçus
  if (!isSent && message.username) {
    const authorSpan = document.createElement("span");
    authorSpan.className = "author";
    authorSpan.textContent = message.username;
    msgElement.appendChild(authorSpan);
  }

  // Bulle du texte
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message.content;

  // Heure du message
  const timeSpan = document.createElement("span");
  timeSpan.className = "time";
  timeSpan.textContent = formatTime(message.created_at);

  msgElement.appendChild(bubble);
  msgElement.appendChild(timeSpan);
  divMessages.appendChild(msgElement);
}

function scrollMessages() {
  divMessages.scrollTop = divMessages.scrollHeight;
}

// Transforme la date Supabase en heure lisible (ex: "14:05")
function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}


//Verif de connexion au tout début
async function init() {
  // Vérifie si l'utilisateur est connecté et enregistré
  currentUser = (await Auth.getUser()).user;
  if (!currentUser) {
    alert("Vous devez être connecté pour accéder au chat.");
    window.location.replace("../signin.html");
    return;
  }

  // Charge le salon et les anciens messages
  await loadChannels();
  await loadMessages();

  // Ecoute les nouveaux messages en temps réel
  const channelId = currentChannel ? currentChannel.id : null;
  unsubscribeMessages?.();
  unsubscribeMessages = Data.subscribeToMessages(channelId, appendMessage);
}

init();



