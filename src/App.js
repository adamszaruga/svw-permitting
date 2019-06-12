import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';

import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import Projects from './Components/Projects';
import Firms from './Components/Firms';
import Documents from './Components/Documents';
import Submittals from './Components/Submittals/Submittals';
import Jurisdictions from './Components/Jurisdictions';
import SubmittalsContainer from './Components/SubmittalsContainer';
class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div className="container-fluid">
          <div className="row">
            <Sidebar />

            <main role="main" className="col-md-10 ml-sm-auto col-lg-10 px-4" >
              <Switch>
                <Route exact path="/" render={()=><Dashboard />} /> 
                <Route path="/projects" render={() => <Projects />} /> 
                <Route path="/firms" render={() => <Firms />} /> 
                <Route path="/documents" render={() => <Documents />} /> 
                <Route path="/submittals/:id" render={({match: {params}}) => {
                  let { id } = params;
                  return (<SubmittalsContainer projectId={id}/>)
                }} /> 
                <Route exact path="/submittals" render={() => <Submittals />
               } /> 
                <Route path="/jurisdictions" render={() => <Jurisdictions />} /> 
              </Switch>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
