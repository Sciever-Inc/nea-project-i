import { BrowserRouter, Redirect, Route } from "react-router-dom";
import { routes } from "./routes";
import useLoginState from "./hooks/useLoginState";
import { useEffect } from "react";

const App = () => {
  const { isLoggedIn } = useLoginState();

  return (
    <BrowserRouter>
      {routes.map((route, index) => (
        <Route
          exact={route.exact}
          key={index}
          path={route.path}
          render={(props) => {
            if (route.path === "/callback") {
              return <route.component {...props} />;
            } else if (route.path === "/login") {
              return isLoggedIn ? (
                <Redirect to="/" />
              ) : (
                <route.component {...props} />
              );
            } else {
              return isLoggedIn ? (
                <route.component {...props} />
              ) : (
                <Redirect to="/login" />
              );
            }
          }}
        />
      ))}
    </BrowserRouter>
  );
};

export default App;
