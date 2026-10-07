document.addEventListener("DOMContentLoaded", () => { // Pour pas que des trucs se passe avant le chargement entier de la page

    // Recherche des éléments comme la boite de discu, la zone de saisie et le bouton d'envoi
    const displayBox = document.getElementById("chat-display-box") || document.querySelector(".chat-display-box, [class*='chat-display-box']");
    const messageInput = document.getElementById("message-input") || document.querySelector(".aligne-en-bas textarea, .aligne-en-bas input[type='text']");
    const sendBtn = document.getElementById("btn-send") || document.querySelector(".btn-send, .aligne-en-bas button");

    if (!displayBox || !messageInput || !sendBtn) {
        console.warn("�l�ments du chat introuvables :", { displayBox, messageInput, sendBtn });
        return;
    }

    // Fonction pour mettre l'heure actuelle (ex: transforme 14:5 en 14:05)
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    // Fonction pour ajouter un message dans la boite blanche du milieu
    function displayMessage(text, isSent = true, time = null) {
        // Supprimer l'état vide si présent
        const emptyState = displayBox.querySelector(".chat-empty-state");
        if (emptyState) {
            emptyState.remove();
        }

        // DVérifie si le message est envoyé ou reçu pour bien l'afficher
        const msgElement = document.createElement("div");
        msgElement.className = `message ${isSent ? "sent" : "received"}`;

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = text;

        const timeSpan = document.createElement("span");
        timeSpan.className = "time";
        timeSpan.textContent = time || getCurrentTime();

        msgElement.appendChild(bubble);
        msgElement.appendChild(timeSpan);
        displayBox.appendChild(msgElement);

        // Défilement automatique vers le bas pour voir le dernier message envoyé
        displayBox.scrollTop = displayBox.scrollHeight;
    }

    // Message d'accueil
    function loadSavedMessages() {
        displayMessage("Bonjour ! Tapez votre message dans la zone en bas puis cliquez sur le bouton ou appuyez sur Entrée pour l'envoyer.", false);
    }

    // Fonction principale d'envoi du message
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") {
            return;
        }

        const time = getCurrentTime();

        // Afficher le message de l'utilisateur avec la bonne heure
        displayMessage(text, true, time);

        // Vider la boite de texte en bas et redonne le focus
        messageInput.value = "";
        messageInput.focus();
    }

    // Envoi lors du clic sur le bouton d'envoi
    sendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sendMessage();
    });

    // Envoie lorsqu'on appuie sur la touche 'Entrée' dans la zone de texte
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Emp�che le saut de ligne
            sendMessage();
        }
    });

    // Affiche le message d'accueil au chargement
    loadSavedMessages();

});
