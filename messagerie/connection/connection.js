async function connect(accountId, accountPwd){
  //Verify data
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
  // Replace default action
  event.preventDefault(); 
  
  // Fetch form data
  const formData = new FormData(form);
  
  // Create an account
  let result=await connect(formData.get("login"),formData.get("pwd"));

  if (result){
    //change page to the home page
    window.location.href = "./index.html";
  }
});