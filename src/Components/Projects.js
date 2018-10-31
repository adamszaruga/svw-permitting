import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map } from 'react-feather';
import {  withHandlers } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Project from './Project';

const NEW_PROJECT_NAME = 'New Project';

const enhance = compose(
    firestoreConnect([
        { collection: 'projects', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            projects: firestore.ordered.projects,
        })
    ),
    withRouter,
    withHandlers({
        addProject: props => () =>
            props.firestore.add('projects', { 
                name: NEW_PROJECT_NAME, 
                street: '',
                city: '',
                state: '',
                zip: '',
                scope: '',
                cost: 0,
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }),
        updateProject: props => (project, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'projects', doc: project.id }, updates)
        },
        deleteProject: props => (project) => {
            props.history.push('/projects');
            return props.firestore.update({ collection: 'projects', doc: project.id }, {isArchived: true});
        }
    })
)

const Projects = ({match, projects, addProject, deleteProject, updateProject}) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Projects</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={addProject}>Add Project</button>
                    <button className="btn btn-sm btn-outline-secondary">Import</button>
                </div>
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle">
                    <span data-feather="calendar"></span>
                    This week
                </button>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{backgroundColor: "#4C5256"}}>
                    <b>Project Name</b>
                </div>
                {
                    !isLoaded(projects)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(projects)
                            ? 'No projects to show'
                            : projects.map((project) => (
                                <NavLink exact to={`${match.path}/${project.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={project.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{project.name}</h5>
                                        <span className="badge badge-warning">In Review</span>
                                    </div>
                                    <div className="row no-gutters justify-content-start align-items-start">
                                        <span className="col-4 mr-5"><Map className="feather mr-2" />{project.street}</span>
                                        <span className="col-4 mr-5"><Users className="feather mr-2" />Adam Szaruga</span>
                                        
                                    </div>
                                    <div className="row no-gutters justify-content-start align-items-start">
                                        <span className="col-4 mr-5"><Briefcase className="feather mr-2" />USAA</span>
                                        <span className="col-4 mr-5"><Map className="feather mr-2" />{project.street}</span>
                                    </div>
                                    
                                </NavLink>
                            ))
                }
            </div>
            
            {
                !isLoaded(projects)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let project = projects.find(project => project.id === match.params.id);
                        return <Project key={project ? project.id : 'noprojectfound'} 
                                        project={project} 
                                        deleteProject={deleteProject} 
                                        updateProject={updateProject}
                                        editMode={project ? (project.name === NEW_PROJECT_NAME ? true : false) : false}/>
                    }} />
            }
            

        </div>
    </div>
)

export default enhance(Projects)
