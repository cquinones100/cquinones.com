import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Home from './Home.js';
import BlogEntry from './blog/BlogEntry.js';
import Bio from './Bio.js';
import './App.css';

const App = () => (
  <Router>
    <div className='bio'>
      <h1><Link to='/'>Carlos Quinones</Link></h1>
      <Bio />
    </div>
    <div className='app-container'>
      <Switch>
        <Route exact path='/'><Home /></Route>
        <Route path='/blog/:id' children={<BlogEntry />} />
      </Switch>
    </div>
  </Router>
);

export default App;
