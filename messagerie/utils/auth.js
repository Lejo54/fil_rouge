// Authentication helper wrapping Supabase Auth.
// Relies on the global `_supabase` (supabaseClient.js).
const Auth = {
  // Log in with email + password
  async signIn(email, password) {
    return await _supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
  },
  
  // Create an account with email + password
  async signUp(email, password) {
    return await _supabase.auth.signUp({ 
      email, 
      password 
    });
  },
  
  // Log out (the promise is not returned, so callers cannot await completion)
  signOut() {
    _supabase.auth.signOut();  
  },
  
  // Returns { user, error }. `user` is null when no session exists.
  async getUser() {
    const { data, error } = await _supabase.auth.getSession();
    if (error || !data.session) {
      return { user: null, error: error ?? new Error("Aucune session") };
    }
    return { user: data.session.user, error: null };
  },
  
  // Subscribe to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, ...)
  onSessionChange(callback) {
    _supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  // Fire the callback when the session is over: explicit sign-out,
  // or no session found at startup (INITIAL_SESSION with null session)
  onSessionEnded(callback) {
    return Auth.onSessionChange((event, session) => {
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        callback();
      }
    });
  },
}