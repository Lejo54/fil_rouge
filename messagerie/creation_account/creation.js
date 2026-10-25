async function createAccount(accountId, accountPwd, confirmPwd) {
  //Verify data
  if (typeof accountId !== 'string' || typeof accountPwd !== 'string' || typeof confirmPwd !== 'string') {
    alert("Wrong type !")
    return false;
  }
  if (!accountId || !accountPwd || !confirmPwd) {
    alert("At least one field is not filled !");
    return false;
  }

  //Verify password
  if (accountPwd !== confirmPwd) {
    alert("Password don't match !")
    return false;
  }

  const { error } = await Auth.signUp(accountId, accountPwd);
  if (error) {
    console.log(error);
  } else {
    alert("Account created.Please verify your email to confirm sign up.");
    return true;
  }

}

const form = document.getElementById("create-account");

form.addEventListener('submit', async (event) => {
  // Replace default action
  event.preventDefault();

  // Fetch form data
  const formData = new FormData(form);

  // Create an account
  let result = await createAccount(formData.get("login"), formData.get("pwd"), formData.get("pwd2"));

  if (result) {
    //change page to the signin page
    window.location.href = "../signin.html";
  }
});