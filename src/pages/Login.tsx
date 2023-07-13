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
        <h2>This is a demo website for GPS Features</h2>
        {/* @ts-ignore */}
        <button type="button" className="btn btn-primary" onClick={openLogin}>
          Login
        </button>
      </div>
    </>
  );
};

export default LoginPage;
