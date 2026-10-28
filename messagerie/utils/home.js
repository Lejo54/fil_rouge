const btnSignOut= document.getElementById("sign-out");
const main=document.getElementById("main-interface");

btnSignOut.onclick = async () => {
  await Auth.signOut();

  Auth.onSessionEnded(() => {
    sessionStorage.clear();
    window.location.replace("./signin.html");
  });

};

const username= sessionStorage.getItem("user");
if(username){
  main.textContent="You are signin with the email "+username+" !"
  let p =document.createElement("p");
  p.textContent = "You can chat with your friends, check your contact and convert your money !";
  main.appendChild(p)
}
