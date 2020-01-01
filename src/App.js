import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './Home.js';
import BlogEntry from './blog/BlogEntry.js';
import './App.css';

const App = () => (
  <Router>
    <Switch>
      <Route exact path='/'><Home /></Route>
      <Route path='/blog/:id' children={<BlogEntry />} />
    </Switch>
  </Router>
);

export default App;
