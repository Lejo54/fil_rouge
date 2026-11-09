// Sign-up page logic: validates the form, creates the account with Supabase
// and redirects to the sign-in page. Relies on the global `Auth` (auth.js).

async function createAccount(accountId, accountPwd, confirmPwd) {
  // Validate input
  if (typeof accountId !== 'string' || typeof accountPwd !== 'string' || typeof confirmPwd !== 'string') {
    alert("Wrong type !")
    return false;
  }
  if (!accountId || !accountPwd || !confirmPwd) {
    alert("At least one field is not filled !");
    return false;
  }

  // Check that both passwords match
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
    // Go to the sign-in page after a successful sign-up
    window.location.replace("../connection/signin.html");
  }
});