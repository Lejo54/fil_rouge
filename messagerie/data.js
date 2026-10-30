//Gestion des données Supabase pour le Chat
const Data = {

  //Recup tous les salons disponibles dans Supabase
  async fetchChannels() {
    return await _supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });
  },

  //Creer un nouveau salon
  async createChannel(name) {
    const { user } = await Auth.getUser();
    const payload = { name };
    if (user && user.id) {
      payload.created_by = user.id;
    }
    return await _supabase
      .from("channels")
      .insert([payload])
      .select();
  },

  // Ecoute en temps reel les changements sur la table 'channels'
  subscribeToChannels(callback) {
    const channel = _supabase
      .channel("public:channels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => {
      _supabase.removeChannel(channel);
    };
  },

  // Recup les messages d'un salon (ou tous les messages de la base)
  async fetchMessages(channelId) {
    let query = _supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (channelId) {
      query = query.eq("channel_id", channelId);
    }

    return await query;
  },

  // Enregistre un message dans la base de données Supabase
  async sendMessage(channelId, content, username) {
    const { user } = await Auth.getUser();
    if (!user) {
      return { data: null, error: new Error("Utilisateur non connecté") };
    }

    const payload = {
      content: content,
      username: username || user.email || "Anonyme",
      user_id: user.id
    };

    if (channelId) {
      payload.channel_id = channelId;
    }

    return await _supabase
      .from("messages")
      .insert([payload])
      .select();
  },

  // Ecoute en temps réel les nouveaux messages ajoutes a la table 'messages'
  subscribeToMessages(channelId, callback) {
    const channelName = channelId ? `realtime:messages:${channelId}` : "realtime:messages";

    const channel = _supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload) => {
          if (!channelId || payload.new.channel_id === channelId || payload.new.channel_id == channelId) {
            callback(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      _supabase.removeChannel(channel);
    };
  }
};

//Gestion du stockage local (localStorage) pour conserver le salon actif
const Local = {
  readCurrentChannel() {
    try {
      const data = localStorage.getItem("current_channel");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  writeCurrentChannel(channel) {
    try {
      localStorage.setItem("current_channel", JSON.stringify(channel));
    } catch (e) {
      console.error("Erreur de sauvegarde locale du salon :", e);
    }
  },

  deleteCurrentChannel() {
    localStorage.removeItem("current_channel");
  },

  clearSession() {
    localStorage.removeItem("current_channel");
  }
};

