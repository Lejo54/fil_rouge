// Page state variables
let currentChannel = Local.readCurrentChannel();
let currentUser = null;
let allChannels = [];
let unsubscribeMessages = null;
let unsubscribeChannels = null;

// DOM elements
const inputMessage = document.getElementById("message-input");
const divMessages = document.getElementById("chat-display-box");
const formMessage = document.getElementById("form-message");
const spanChannelTitle = document.getElementById("span-channel-title");
const userStatus = document.getElementById("user-status");
const linkLogout = document.getElementById("link-logout");
const channelsList = document.getElementById("channels-list");
const channelsSearchInput = document.getElementById("channels-search-input");
const btnAddChannel = document.getElementById("btn-add-channel");


// --- Channel management ---

// Load all channels from Supabase, make sure a default one exists, and restore the saved one
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

  // If the database has no channel yet, create the default "Général" channel
  if (allChannels.length === 0) {
    const { data: created, error: createError } = await Data.createChannel("Général");
    if (!createError && created && created.length > 0) {
      allChannels = created;
    } else if (createError) {
      console.warn("Impossible de créer le salon par défaut Général :", createError.message);
    }
  }

  // Check that the channel saved in localStorage still exists (otherwise fall back to the first one)
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

// Return the channels filtered by the search box
function getFilteredChannels() {
  const query = channelsSearchInput ? channelsSearchInput.value.toLowerCase().trim() : "";
  if (!query) return allChannels;
  return allChannels.filter((c) => c.name && c.name.toLowerCase().includes(query));
}

// Render the channel list in the left sidebar (built with textContent, so names are never parsed as HTML)
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

// Switch to a channel and load its messages
async function selectChannel(channel) {
  if (currentChannel && currentChannel.id === channel.id) {
    return;
  }

  currentChannel = channel;
  Local.writeCurrentChannel(channel);
  showChannelTitle(channel.name);

  // Refresh the sidebar to highlight the active channel
  renderChannelsList(getFilteredChannels());

  // Re-subscribe to realtime messages for the new channel (unsubscribing from the old one first)
  unsubscribeMessages?.();
  unsubscribeMessages = Data.subscribeToMessages(channel.id, appendMessage);

  // Load the messages of the selected channel
  await loadMessages();
}

// Update the channel title in the header
function showChannelTitle(title) {
  if (spanChannelTitle) {
    spanChannelTitle.textContent = title ? "# " + title : "# Aucun salon";
  }
}

// Filter channels as the user types in the search field
if (channelsSearchInput) {
  channelsSearchInput.addEventListener("input", () => {
    renderChannelsList(getFilteredChannels());
  });
}

// Create a new channel via the + button
if (btnAddChannel) {
  btnAddChannel.addEventListener("click", async () => {
    const name = prompt("Nom du nouveau salon :");
    if (!name || !name.trim()) return;

    const trimmed = name.trim().replace(/^#\s*/, "");
    if (!trimmed) return;

    // Reject duplicate channel names (case-insensitive)
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
      // Reload all channels from the database in case select() returned nothing
      await loadChannels();
    }
  });
}


// --- Message management ---

// Load the active channel's messages from Supabase
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

// Append a message to the display box (used for realtime events and for our own sent messages)
function appendMessage(message) {
  // Remove the empty-state placeholder if present
  const emptyState = divMessages.querySelector(".chat-empty-state");
  if (emptyState) {
    emptyState.remove();
  }

  displayMessage(message);
  scrollMessages();
}

// Build and insert the HTML element of a message
function displayMessage(message) {
  // Avoid displaying the same message twice (realtime event + local append)
  if (message.id && divMessages.querySelector(`[data-id="${message.id}"]`)) {
    return;
  }

  // Green if the logged-in user is the author, gray if it is someone else
  const isSent = currentUser && (
    message.user_id == currentUser.id ||
    (message.username && currentUser.email && message.username === currentUser.email)
  );

  // Message container (sent = green on the right, received = gray on the left)
  const msgElement = document.createElement("div");
  msgElement.className = `message ${isSent ? "sent" : "received"}`;
  if (message.id) {
    msgElement.setAttribute("data-id", message.id);
  }

  // Sender name, only shown on received messages
  if (!isSent && message.username) {
    const authorSpan = document.createElement("span");
    authorSpan.className = "author";
    authorSpan.textContent = message.username;
    msgElement.appendChild(authorSpan);
  }

  // Text bubble (textContent prevents HTML injection)
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message.content;

  // Message time
  const timeSpan = document.createElement("span");
  timeSpan.className = "time";
  timeSpan.textContent = formatTime(message.created_at);

  msgElement.appendChild(bubble);
  msgElement.appendChild(timeSpan);
  divMessages.appendChild(msgElement);
}

// Show a placeholder when the channel has no message
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

// Auto-scroll to the bottom
function scrollMessages() {
  divMessages.scrollTop = divMessages.scrollHeight;
}

// Convert a Supabase timestamp to a readable time (e.g. "14:05")
function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}


// --- Message sending form ---

formMessage.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Make sure the user is logged in
  if (!currentUser) {
    alert("Vous devez être connecté pour envoyer un message.");
    window.location.replace("../connection/signin.html");
    return;
  }

  // Make sure a channel is selected
  if (!currentChannel) {
    alert("Veuillez sélectionner un salon avant d'envoyer un message.");
    return;
  }

  // Ignore empty messages
  const content = inputMessage.value.trim();
  if (!content) return;

  // Save the message in Supabase, linked to the active channel
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

  // Display the sent message immediately
  if (data && data.length > 0) {
    appendMessage(data[0]);
  }

  // Clear the text area
  inputMessage.value = "";
  inputMessage.focus();
});

// Send with Enter (Shift+Enter inserts a new line)
inputMessage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formMessage.requestSubmit();
  }
});


// --- Authentication and logout ---

if (linkLogout) {
  linkLogout.addEventListener("click", async (event) => {
    event.preventDefault();
    await Auth.signOut();
    Local.clearSession();
    window.location.replace("../connection/signin.html");
  });
}

// Safety net: if the session ends (expired, or signed out from another tab), clean up and leave
Auth.onSessionEnded(() => {
  Local.clearSession();
  window.location.replace("../connection/signin.html");
});


// --- Page initialization ---

async function init() {
  // Check that the user is logged in, otherwise redirect
  currentUser = (await Auth.getUser()).user;
  if (!currentUser) {
    alert("Vous devez être connecté pour accéder au chat.");
    window.location.replace("../connection/signin.html");
    return;
  }

  // Show the logged-in user's email in the header
  if (userStatus && currentUser.email) {
    userStatus.textContent = currentUser.email;
  }

  // Load channels and select the active one
  await loadChannels();

  // Load the messages of the selected channel
  await loadMessages();

  // Listen to new messages of the channel in real time
  if (currentChannel) {
    unsubscribeMessages?.();
    unsubscribeMessages = Data.subscribeToMessages(currentChannel.id, appendMessage);
  }

  // Listen to channels added/changed by other users in real time
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