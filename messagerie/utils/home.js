const navSignin = document.getElementById("nav-signin");
const navSignup = document.getElementById("nav-signup");
const btnSignOut = document.getElementById("sign-out");
const mainText = document.getElementById("main-text");
const nav = document.getElementById("nav-bar");
const mainButtons = document.getElementById("conteneur-boutons");

function updateNav(session) {
  const isConnected = Boolean(session);
  navSignin.hidden = isConnected;
  navSignup.hidden = isConnected;
  btnSignOut.parentElement.hidden = !isConnected;
  mainButtons.hidden = isConnected;
  mainText.replaceChildren();

  if (isConnected) {
    mainText.append(
      `Welcome back ! You are logged in as ${session.user.email}.`,
      document.createElement("br"),
      "You can chat with your friends and convert your money"
    );
  } else {
    mainText.append("Please log in or create an account to access the email.");
  }
}
updateNav(false);

_supabase.auth.getSession().then(({ data }) => {
  updateNav(data.session);
});

_supabase.auth.onAuthStateChange((event, session) => {
  updateNav(session);
});

btnSignOut.onclick = async () => {
  await Auth.signOut();

  Auth.onSessionEnded(() => {
    sessionStorage.clear();
    window.location.replace("./signin.html");
  });

};