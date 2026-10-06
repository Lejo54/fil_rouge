function createAccount(accountId, accountPwd, confirmPwd){
  //Verify types
  if ( typeof accountId !== 'string' || typeof accountPwd !== 'string' || typeof confirmPwd !==  'string'){
    alert("Wrong type !")
    return false;
  }

  //Verify password
  if(accountPwd !== confirmPwd){
    alert("Password don't match !")
    return false
  } 

  let account = {
    id: accountId,
    pwd: accountPwd
  }

  return account
}

const form = document.getElementById('CreateAccount');

form.addEventListener('submit', function(event) {
  // Replace default action
  event.preventDefault(); 
  
  // Fetch form data
  const formData = new FormData(form);
  
  // Create an account
  let result=createAccount(formData.get("login"),formData.get("pwd"),formData.get("pwd2"));

  if (result){
    alert(result.id + result.pwd);
    //change page to the signin page
    window.location.href = "../signin.html";
  }
});