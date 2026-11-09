// Sign-in page logic: validates the form, signs the user in with Supabase
// and redirects to the home page. Relies on the global `Auth` (auth.js).

async function connect(accountId, accountPwd){
  // Validate input
  if ( typeof accountId !== 'string' || typeof accountPwd !== 'string'){
    alert("Wrong type !");
    return false;
  }
  if(!accountId, !accountPwd){
    alert("Email or password not filled !");
    return false;
  }

  const { error } = await Auth.signIn(accountId, accountPwd);
  if (error) {
    console.log(error);
    return false;
  }
  return true;
  
}

const form = document.getElementById('Connect');

form.addEventListener('submit', async function(event) {
  // Prevent the browser's default form submission (page reload)
  event.preventDefault(); 
  
  // Fetch form data
  const formData = new FormData(form);
  
  // Try to sign in
  let result=await connect(formData.get("login"),formData.get("pwd"));

  if (result){
    // Redirect to the home page as soon as a session with a user is available
    Auth.onSessionChange((event, session) => {
      if (session?.user) {
        window.location.replace("../index.html");
      }
    });
  }
  else{
    alert("Wrong login or password !")
  }
});