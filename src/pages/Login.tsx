import {
  CLIENT_ID,
  IDENTITY_SERVER_URL,
  CALLBACK_URL,
} from "../config/constant";

const openLogin = (message?: string) => {
  let redirectUrl =
    IDENTITY_SERVER_URL +
    "?callback_url=" +
    CALLBACK_URL +
    "&client_id=" +
    CLIENT_ID;

  window.location.href = redirectUrl;
};

const LoginPage = () => {
  return (
    <>
      <div>
        {/* @ts-ignore */}
        <button  id="loginButton" onClick={openLogin}></button>
      </div>
    </>
  );
};

export default LoginPage;

window.onload = () => {
  const button = document.querySelector("#loginButton");
  button?.click();
};