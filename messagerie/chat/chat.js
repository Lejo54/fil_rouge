document.addEventListener("DOMContentLoaded", () => { //Pour pas que des trucs se passe avant le chargement entier de la page

    // Recherche les éléments comme la boite de discu, la zone de saisie et le bouton d envoie
    const displayBox = document.getElementById("chat-display-box") || document.querySelector(".chat-display-box, [class*='chat-display-box']");
    const messageInput = document.getElementById("message-input") || document.querySelector(".aligne-en-bas textarea, .aligne-en-bas input[type='text']");
    const sendBtn = document.getElementById("btn-send") || document.querySelector(".btn-send, .aligne-en-bas button");

    
    if (!displayBox || !messageInput || !sendBtn) {
        console.warn("Éléments du chat introuvables :", { displayBox, messageInput, sendBtn });
        return;
    }



    // Fonction pour ajouter un message dans la boîte blanche du milieu
    function displayMessage(text, isSent = true, time = null) {
        // Supprimer l'état vide s'il est présent
        const emptyState = displayBox.querySelector(".chat-empty-state");
        if (emptyState) {
            emptyState.remove();
        }

        // Cette partie va permettre de voir si le message est envoyé par l'utilisateur ou reçu, et de bien l'afficher
        const msgElement = document.createElement("div");
        msgElement.className = `message ${isSent ? "sent" : "received"}`;

        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.textContent = text;

        const timeSpan = document.createElement("span");
        timeSpan.className = "time";
        timeSpan.textContent = time;

        msgElement.appendChild(bubble);
        msgElement.appendChild(timeSpan);
        displayBox.appendChild(msgElement);

        // Défilement automatique vers le bas pour voir le dernier message envoyé
        displayBox.scrollTop = displayBox.scrollHeight;
    }

 

    // Fonction principale d'envoi du message
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") {
            return;
        }


        // Afficher le message de l'utilisateur dans la boîte blanche au milieu (marche pas pour le moment)
        displayMessage(text, true, time);

        // Vider la boîte de texte en bas et redonner le focus
        messageInput.value = "";
        messageInput.focus();
    }

    // Événement lors du clic pour le bouton d'envoi
    sendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sendMessage();
    });

    // Événement lorsqu'on appuie sur la touche 'Entrée' dans la zone de texte
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Empêche le saut de ligne
            sendMessage();
        }
    });

    // Initialise les messages au chargement

});
