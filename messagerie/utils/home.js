// Home page logic: adapts the navigation bar and welcome text
// depending on whether the user is logged in or not.
// Relies on the globals `_supabase` (supabaseClient.js) and `Auth` (auth.js).

// DOM references
const navSignin = document.getElementById("nav-signin");
const navSignup = document.getElementById("nav-signup");
const btnSignOut = document.getElementById("sign-out");
const mainText = document.getElementById("main-text");
const nav = document.getElementById("nav-bar");
const mainButtons = document.getElementById("conteneur-boutons");
const mainGif = document.getElementById("main-gif");

// Show/hide UI elements and update the welcome message based on the session.
// `session` is a Supabase session object, or a falsy value when logged out.
function updateNav(session) {
  const isConnected = Boolean(session);
  navSignin.hidden = isConnected;
  navSignup.hidden = isConnected;
  btnSignOut.parentElement.hidden = !isConnected;
  mainButtons.hidden = isConnected;
  mainGif.hidden = !isConnected;
  mainText.replaceChildren();

  // append() with plain strings inserts text nodes (no HTML parsing),
  // so the email cannot inject markup.
  if (isConnected) {
    mainText.append(
      "Welcome back !",document.createElement("br")
      ,`You are logged in as ${session.user.email}.`,
      document.createElement("br"),
      "You can chat with your friends and convert your money !"
    );
  } else {
    mainText.append("Please log in or create an account to access the email.");
  }
}

// Default to the logged-out view until the real session is known
updateNav(false);

// Initial check: is there already a stored session?
_supabase.auth.getSession().then(({ data }) => {
  updateNav(data.session);
});

// Keep the UI in sync on login / logout / token refresh
_supabase.auth.onAuthStateChange((event, session) => {
  updateNav(session);
});

// Sign out, then redirect to the sign-in page once the session has ended
btnSignOut.onclick = async () => {
  await Auth.signOut();

  Auth.onSessionEnded(() => {
    sessionStorage.clear();
    window.location.replace("./connection/signin.html");
  });

};