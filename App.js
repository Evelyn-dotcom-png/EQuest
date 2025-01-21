import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import ProductPage from './components/ProductPage';

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/product/:id" component={ProductPage} />
      </Switch>
    </Router>
  );
}

export default App;