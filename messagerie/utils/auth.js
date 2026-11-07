const Auth = {
  async signIn(email, password) {
    return await _supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
  },
  
  async signUp(email, password) {
    return await _supabase.auth.signUp({ 
      email, 
      password 
    });
  },
  
  signOut() {
    _supabase.auth.signOut();  
  },
  
  async getUser() {
    const { data, error } = await _supabase.auth.getSession();
    if (error || !data.session) {
      return { user: null, error: error ?? new Error("Aucune session") };
    }
    return { user: data.session.user, error: null };
  },
  
  onSessionChange(callback) {
    _supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  onSessionEnded(callback) {
    return Auth.onSessionChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        callback();
      }
    });
  },
}