//Variables de l'état de la page
let currentChannel = Local.readCurrentChannel();
let currentUser = null;
let allChannels = [];
let unsubscribeMessages = null;
let unsubscribeChannels = null;

// Element du DOM
const inputMessage = document.getElementById("message-input");
const divMessages = document.getElementById("chat-display-box");
const formMessage = document.getElementById("form-message");
const spanChannelTitle = document.getElementById("span-channel-title");
const userStatus = document.getElementById("user-status");
const linkLogout = document.getElementById("link-logout");
const channelsList = document.getElementById("channels-list");
const channelsSearchInput = document.getElementById("channels-search-input");
const btnAddChannel = document.getElementById("btn-add-channel");


// --- Gestion des Salons (Channels) ---

// Charge tous les salons depuis Supabase
async function loadChannels() {
  const { data: channels, error } = await Data.fetchChannels();
  if (error) {
    console.error("Impossible de charger les salons :", error.message);
    if (channelsList) {
      channelsList.innerHTML = `<li class="channels-empty" style="color: #ff6b6b; font-size: 0.85rem; padding: 10px;">Erreur de chargement: ${error.message}</li>`;
    }
    return;
  }

  allChannels = channels || [];

  // S'il n'y a encore aucun salon dans la base, on crée le salon par défaut "Général"
  if (allChannels.length === 0) {
    const { data: created, error: createError } = await Data.createChannel("Général");
    if (!createError && created && created.length > 0) {
      allChannels = created;
    } else if (createError) {
      console.warn("Impossible de créer le salon par défaut Général :", createError.message);
    }
  }

  // Vérifie si le salon sauvegardé dans localStorage existe toujours
  if (currentChannel) {
    const exists = allChannels.find((c) => c.id === currentChannel.id);
    if (exists) {
      currentChannel = exists;
    } else {
      currentChannel = allChannels[0] || null;
    }
  } else {
    currentChannel = allChannels[0] || null;
  }

  if (currentChannel) {
    Local.writeCurrentChannel(currentChannel);
    showChannelTitle(currentChannel.name);
  } else {
    showChannelTitle(null);
  }

  renderChannelsList(getFilteredChannels());
}

// Retourne la liste des salons filtrés par la barre de recherche
function getFilteredChannels() {
  const query = channelsSearchInput ? channelsSearchInput.value.toLowerCase().trim() : "";
  if (!query) return allChannels;
  return allChannels.filter((c) => c.name && c.name.toLowerCase().includes(query));
}

// Affiche la liste des salons dans la sidebar à gauche
function renderChannelsList(channelsToRender) {
  if (!channelsList) return;
  channelsList.replaceChildren();

  if (!channelsToRender || channelsToRender.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "channels-empty";
    emptyLi.textContent = "Aucun salon trouvé";
    channelsList.appendChild(emptyLi);
    return;
  }

  channelsToRender.forEach((channel) => {
    const li = document.createElement("li");
    li.className = "channel-item";
    if (currentChannel && channel.id === currentChannel.id) {
      li.classList.add("active");
    }

    const prefix = document.createElement("span");
    prefix.className = "channel-item-prefix";
    prefix.textContent = "#";

    const name = document.createElement("span");
    name.className = "channel-item-name";
    name.textContent = channel.name;

    li.appendChild(prefix);
    li.appendChild(name);

    li.addEventListener("click", () => {
      selectChannel(channel);
    });

    channelsList.appendChild(li);
  });
}

// Sélectionne un salon et charge ses messages dédiés
async function selectChannel(channel) {
  if (currentChannel && currentChannel.id === channel.id) {
    return;
  }

  currentChannel = channel;
  Local.writeCurrentChannel(channel);
  showChannelTitle(channel.name);

  // Met à jour l'affichage actif dans la sidebar
  renderChannelsList(getFilteredChannels());

  // Réabonne l'écoute en temps réel pour le nouveau salon
  unsubscribeMessages?.();
  unsubscribeMessages = Data.subscribeToMessages(channel.id, appendMessage);

  // Charge les messages du salon sélectionné
  await loadMessages();
}

// Met à jour le titre du salon dans l'en-tête
function showChannelTitle(title) {
  if (spanChannelTitle) {
    spanChannelTitle.textContent = title ? "# " + title : "# Aucun salon";
  }
}

// Filtre les salons lors de la saisie dans le champ de recherche
if (channelsSearchInput) {
  channelsSearchInput.addEventListener("input", () => {
    renderChannelsList(getFilteredChannels());
  });
}

// Création d'un nouveau salon via le bouton +
if (btnAddChannel) {
  btnAddChannel.addEventListener("click", async () => {
    const name = prompt("Nom du nouveau salon :");
    if (!name || !name.trim()) return;

    const trimmed = name.trim().replace(/^#\s*/, "");
    if (!trimmed) return;

    // Vérifie si le salon existe déjà
    const exists = allChannels.some(
      (c) => c.name && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Un salon avec ce nom existe déjà.");
      return;
    }

    const { data: created, error } = await Data.createChannel(trimmed);
    if (error) {
      console.error("Erreur création salon :", error.message);
      alert("Erreur lors de la création du salon : " + error.message);
      return;
    }

    if (created && created.length > 0) {
      const newChannel = created[0];
      allChannels.push(newChannel);
      await selectChannel(newChannel);
    } else {
      // Recharger tous les salons depuis la base au cas où select() n'a rien retourné
      await loadChannels();
    }
  });
}


// --- Gestion des Messages ---

// Charge les messages du salon actif depuis Supabase
async function loadMessages() {
  const channelId = currentChannel ? currentChannel.id : null;

  if (!channelId) {
    divMessages.replaceChildren();
    showEmptyState("Sélectionnez ou créez un salon pour commencer.");
    return;
  }

  const { data: messages, error } = await Data.fetchMessages(channelId);

  if (error) {
    console.error("Impossible de charger les messages :", error.message);
    divMessages.replaceChildren();
    showEmptyState(`Erreur lors du chargement des messages : ${error.message}`);
    return;
  }

  divMessages.replaceChildren();

  if (!messages || messages.length === 0) {
    showEmptyState("Aucun message dans ce salon. Soyez le premier à écrire !");
  } else {
    messages.forEach((message) => {
      displayMessage(message);
    });
  }

  scrollMessages();
}

// Ajoute un message dans la boîte d'affichage
function appendMessage(message) {
  // Retire l'état vide si présent
  const emptyState = divMessages.querySelector(".chat-empty-state");
  if (emptyState) {
    emptyState.remove();
  }

  displayMessage(message);
  scrollMessages();
}

// Construit et insère l'élément HTML d'un message
function displayMessage(message) {
  // Évite d'afficher deux fois le même message
  if (message.id && divMessages.querySelector(`[data-id="${message.id}"]`)) {
    return;
  }

  // Vert si l'utilisateur connecté est l'auteur, gris si c'est quelqu'un d'autre
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

  // Nom de l'expéditeur pour les messages reçus
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

// Affiche un état vide lorsque le salon ne contient pas de message
function showEmptyState(text) {
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "chat-empty-state";

  const icon = document.createElement("div");
  icon.className = "chat-empty-icon";
  icon.textContent = "💬";

  const p = document.createElement("p");
  p.textContent = text || "Aucun message pour le moment.";

  emptyDiv.appendChild(icon);
  emptyDiv.appendChild(p);
  divMessages.appendChild(emptyDiv);
}

// Défilement automatique vers le bas
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


// --- Formulaire d'envoi de message ---

formMessage.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Vérifie si l'utilisateur est bien connecté
  if (!currentUser) {
    alert("Vous devez être connecté pour envoyer un message.");
    window.location.replace("../signin.html");
    return;
  }

  // Vérifie qu'un salon est bien sélectionné
  if (!currentChannel) {
    alert("Veuillez sélectionner un salon avant d'envoyer un message.");
    return;
  }

  // Vérifie que le message n'est pas vide
  const content = inputMessage.value.trim();
  if (!content) return;

  // Enregistrement du message dans Supabase lié au salon actif
  const { data, error } = await Data.sendMessage(
    currentChannel.id,
    content,
    currentUser.email
  );

  if (error) {
    console.error("Erreur d'envoi :", error.message);
    alert("Erreur lors de l'envoi du message : " + error.message);
    return;
  }

  // Affiche immédiatement le message envoyé
  if (data && data.length > 0) {
    appendMessage(data[0]);
  }

  // Vide la zone de texte
  inputMessage.value = "";
  inputMessage.focus();
});

// Envoi avec la touche Entrée (sans Shift)
inputMessage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formMessage.requestSubmit();
  }
});


// --- Authentification et Déconnexion ---

if (linkLogout) {
  linkLogout.addEventListener("click", async (event) => {
    event.preventDefault();
    await Auth.signOut();
    Local.clearSession();
    window.location.replace("../signin.html");
  });
}

Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("../signin.html");
});


// --- Initialisation de la page ---

async function init() {
  // Vérifie si l'utilisateur est connecté
  currentUser = (await Auth.getUser()).user;
  if (!currentUser) {
    alert("Vous devez être connecté pour accéder au chat.");
    window.location.replace("../signin.html");
    return;
  }

  // Affiche l'email de l'utilisateur connecté dans l'en-tête
  if (userStatus && currentUser.email) {
    userStatus.textContent = currentUser.email;
  }

  // Charge les salons et sélectionne le salon actif
  await loadChannels();

  // Charge les messages du salon sélectionné
  await loadMessages();

  // Écoute les nouveaux messages du salon en temps réel
  if (currentChannel) {
    unsubscribeMessages?.();
    unsubscribeMessages = Data.subscribeToMessages(currentChannel.id, appendMessage);
  }

  // Écoute l'ajout de nouveaux salons en temps réel par d'autres utilisateurs
  unsubscribeChannels?.();
  unsubscribeChannels = Data.subscribeToChannels(async () => {
    const { data: channels } = await Data.fetchChannels();
    if (channels) {
      allChannels = channels;
      renderChannelsList(getFilteredChannels());
    }
  });
}

init();
