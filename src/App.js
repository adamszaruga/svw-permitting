import React, { Component, Fragment } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import './App.css';

import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import Project from './Components/Project';
import ProgressBar from './Components/ProgressBar';
import Firm from './Components/Firm';
import Document from './Components/Document';
import Submittals from './Components/Submittals/Submittals';
import Jurisdiction from './Components/Jurisdiction';
import SubmittalsContainer from './Components/SubmittalsContainer';
import ActionCenter from './Components/ActionCenter';
import CollectionCRUD from './RenderProps/CollectionCRUD';
import { Users, Briefcase, Map, Phone, Mail } from 'react-feather';
import IconList from './Components/IconList';

const FIRM_COLOR_MAP = {
  contractor: "primary",
  owner: "dark",
  architect: "light",
  engineer: "warning",
  applicant: "success"
}

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
                <Route path="/projects" render={() => {
                  return <CollectionCRUD
                    collections={['projects']}
                    renderTopRight={({ street, city, state, zip }) => <IconList items={[{ Icon: Map, text: `${street}, ${city}, ${state} ${zip}` }]} /> }
                    renderMain={(project) => <ProgressBar active={this.props.location.pathname === `/projects/${project.id}`} project={project} /> }
                    renderItem={(project, deleteProject, updateProject) => {
                      return <Project key={project ? project.id : 'noprojectfound'}
                        project={project}
                        deleteProject={deleteProject}
                        updateProject={updateProject}
                        editMode={project ? (project.name === 'New project' ? true : false) : false} />
                    }}
                    itemDefaults={{
                      street: '',
                      city: '',
                      state: '',
                      zip: '',
                      scope: '',
                      cost: 0,
                      milestones: [{
                        status: 'new',
                        timestamp: (new Date()).toString(),
                        notes: []
                      }],
                      status: 'new',
                    }}
                  />
                }} />
                <Route path="/firms" render={() => {
                  return <CollectionCRUD
                    collections={['firms']}
                    renderTopRight={({type}) => (type ? <span className={`px-3 py-1 badge badge-pill badge-${FIRM_COLOR_MAP[type]}`}>{type}</span> : null )}
                    renderMain={({ street, city, state, zip, phone, email }) => <IconList items={[{ Icon: Map, text: `${street} ${city}, ${state} ${zip}` },
                    { Icon: Phone, text: `${phone}` },
                    { Icon: Mail, text: `${email}` }]} />}
                    renderItem={(firm, deleteFirm, updateFirm) => {
                      return <Firm key={firm ? firm.id : 'nofirmfound'}
                        firm={firm}
                        deleteFirm={deleteFirm}
                        updateFirm={updateFirm}
                        editMode={firm ? (firm.name === 'New firm' ? true : false) : false} />
                    }}
                    itemDefaults={{
                      street: '',
                      city: '',
                      state: '',
                      zip: '',
                      email: '',
                      phone: '',
                      type: ''
                    }}
                  />
                }} />
                <Route path="/documents" render={() => {
                  return <CollectionCRUD
                    collections={['documents']}
                    renderTopRight={(document) => null}
                    renderMain={(document) => null}
                    renderItem={(document, deleteDocument, updateDocument) => {
                      return <Document key={document ? document.id : 'nodocumentfound'}
                        document={document}
                        deleteDocument={deleteDocument}
                        updateDocument={updateDocument}
                        editMode={document ? (document.name === 'New document' ? true : false) : false} />
                    }}
                    itemDefaults={{}}
                  />
                }} />
                <Route exact path="/submittals/:id" render={({match: {params}}) => {
                  let { id } = params;
                  return (<ActionCenter submittalId={id}/>)
                }} /> 
                <Route path="/submittals" render={() => {
                  return <CollectionCRUD
                    collections={['submittals']}
                    renderTopRight={(submittal) => null}
                    renderMain={({project, jurisdiction, createdAt}) => (<h6>{createdAt.toDate().toString()}</h6>)}
                    renderItem={(submittal, deleteSubmittal, updateSubmittal) => 'submittal'}
                  />
                }} />
                <Route exact path="/generator" render={() => <Submittals /> } /> 
                <Route path="/jurisdictions" render={() => {
                  return <CollectionCRUD 
                            collections={['jurisdictions']}
                            renderTopRight={({city, state}) => (<IconList items={[{ Icon: Map, text: `${city}, ${state}` }]} />)}
                            renderMain={(jurisdiction) => null}
                            renderItem={(jurisdiction, deleteJurisdiction, updateJurisdiction) => {
                              return <Jurisdiction key={jurisdiction ? jurisdiction.id : 'nojurisdictionfound'}
                                                   jurisdiction={jurisdiction} 
                                                   deleteJurisdiction={deleteJurisdiction} 
                                                   updateJurisdiction={updateJurisdiction}
                                                   editMode={jurisdiction ? (jurisdiction.name === 'New jurisdiction' ? true : false) : false} />
                            }}
                            itemDefaults={{
                              street: '',
                              city: '',
                              state: '',
                              zip: '',
                              phone: '',
                              email: ''
                            }}
                        />
                }} /> 
              </Switch>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
