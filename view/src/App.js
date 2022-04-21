import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import login from "./pages/login";
import signup from "./pages/signup";
import home from "./pages/home";
import addTeam from "./pages/addTeam";
import Session from "./pages/session";

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/login" component={login} />
          <Route exact path="/signup" component={signup} />
          <Route exact path="/" component={home} />
          <Route exact path="/add/team" component={addTeam} />
          <Route exact path="/alignment/:sessionId" component={Session} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
