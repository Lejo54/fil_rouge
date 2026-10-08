function connect(accountId, accountPwd){
  //Verify types
  if ( typeof accountId !== 'string' || typeof accountPwd !== 'string'){
    alert("Wrong type !")
    return false;
  }

  //Verify data
  //TODO: faire la vérification avec la BDD
  
}

const form = document.getElementById('Connect');

form.addEventListener('submit', function(event) {
  // Replace default action
  event.preventDefault(); 
  
  // Fetch form data
  const formData = new FormData(form);
  
  // Create an account
  let result=connect(formData.get("login"),formData.get("pwd"));

  if (result){
    alert(result.id + result.pwd);
    //change page to the home page
    window.location.href = "../index.html";
  }
});