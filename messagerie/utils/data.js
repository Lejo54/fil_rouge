// Supabase data layer for the chat (channels and messages).
// Relies on the globals `_supabase` (supabaseClient.js) and `Auth` (auth.js).
const Data = {

  // Fetch all available channels, oldest first
  async fetchChannels() {
    return await _supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });
  },

  // Create a new channel; the creator's id is attached when a session exists
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

  // Listen in real time to any change (insert/update/delete) on 'channels'.
  // Returns an unsubscribe function to call when the listener is no longer needed.
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

  // Fetch the messages of one channel (strictly filtered by channel), oldest first
  async fetchMessages(channelId) {
    // No channel selected: return an empty result in the same shape as Supabase
    if (!channelId) {
      return { data: [], error: null };
    }

    return await _supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });
  },

  // Save a message in the database, linked to a channel.
  // Requires a logged-in user. The display name falls back to the email, then "Anonyme".
  async sendMessage(channelId, content, username) {
    const { user } = await Auth.getUser();
    if (!user) {
      return { data: null, error: new Error("Utilisateur non connecté") };
    }

    if (!channelId) {
      return { data: null, error: new Error("Aucun salon sélectionné") };
    }

    const payload = {
      content: content,
      username: username || user.email || "Anonyme",
      user_id: user.id,
      channel_id: channelId
    };

    return await _supabase
      .from("messages")
      .insert([payload])
      .select();
  },

  // Listen in real time to new messages inserted in 'messages'.
  // The realtime filter is not applied server-side here, so messages are
  // filtered client-side by channel before calling the callback.
  // Returns an unsubscribe function.
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
          // Loose comparison (==) tolerates number vs string ids
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

// Local storage helper (localStorage) to remember the active channel
const Local = {
  // Returns the saved channel object, or null if absent/corrupted
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

  // Called on logout to wipe the stored channel
  clearSession() {
    localStorage.removeItem("current_channel");
  }
};