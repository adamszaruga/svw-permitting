import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';

import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import Projects from './Components/Projects';
import Applicants from './Components/Applicants';
import Owners from './Components/Owners';
import Documents from './Components/Documents';

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="container-fluid">
          <div className="row">
            <Sidebar />

            <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
              <Switch>
                <Route exact path="/" render={()=><Dashboard />} /> 
                <Route path="/projects" render={() => <Projects />} /> 
                <Route path="/applicants" render={() => <Applicants />} /> 
                <Route path="/owners" render={() => <Owners />} /> 
                <Route path="/documents" render={() => <Documents />} /> 
              </Switch>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
