const btnSignOut= document.getElementById("sign-out");
const main=document.getElementById("main-interface");

btnSignOut.onclick = async () => {
  await Auth.signOut();

  Auth.onSessionEnded(() => {
    sessionStorage.clear();
    window.location.replace("./signin.html");
  });

};