import { BrowserRouter, Route } from "react-router-dom";
import { routes } from "./routes";

const App = () => {
  return (
    <BrowserRouter>
      {routes.map((route, index) => (
        <Route
          exact={route.exact}
          key={index}
          path={route.path}
          component={route.component}
        />
      ))}
    </BrowserRouter>
  );
};

export default App;
