import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map } from 'react-feather';
import {  withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Project from './Project';
import ProgressBar from './ProgressBar';

const NEW_PROJECT_NAME = 'New Project';
const COLOR_MAP = {
    review: "info",
    comments: "danger",
    approved: "success",
    cancelled: "dark",
    denied: "danger",
    new: "secondary"
}

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
    withState('filter', 'setFilter', ''),
    withState('includeArchived', 'setIncludeArchived', false),
    withHandlers({
        addProject: props => () => {
            let now = new Date();
            props.firestore.add('projects', { 
                name: NEW_PROJECT_NAME, 
                street: '',
                city: '',
                state: '',
                zip: '',
                scope: '',
                cost: 0,
                milestones: [{
                    status: 'new',
                    timestamp: now.toString(),
                    notes: []
                }],
                status: 'new',
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }).then(({id})=>{
                props.history.push(`/projects/${id}`)
            })
        },
        updateProject: props => (project, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'projects', doc: project.id }, updates)
        },
        deleteProject: props => (project) => {
            props.history.push('/projects');
            return props.firestore.update({ collection: 'projects', doc: project.id }, {isArchived: true});
        },
        filterProjects: props => () => {
            return props.projects.filter((project)=>{
                var keys = Object.keys(project);
                for (let i=0; i<keys.length; i++) {
                    let value = String(project[keys[i]]).toLowerCase();
                    if (value.indexOf(props.filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const Projects = ({match, location, projects, addProject, deleteProject, updateProject, filter, setFilter, filterProjects, setIncludeArchived, includeArchived}) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Projects</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-0">
                    <button className="btn btn-sm btn-outline-primary" onClick={addProject}>Add Project</button>
                </div>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{backgroundColor: "#4C5256"}}>
                    <input onInput={(e)=>setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                    <div className="form-check">
                        <input onChange={e => setIncludeArchived(!includeArchived)} value={includeArchived} className="form-check-input" type="checkbox" value="" id="archiveCheck"/> 
                        <label className="form-check-label" htmlFor="archiveCheck">
                            Include archived projects
                        </label>
                    </div>
                </div>
                {
                    !isLoaded(projects)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(projects)
                            ? 'No projects to show'
                            : filterProjects().map((project) => (
                                !project.isArchived || includeArchived ? <NavLink exact to={`${match.path}/${project.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={project.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{project.name}</h5>
                                        
                                        <div className="d-flex align-items-start ml-auto mr-2">
                                            <Map className="feather mr-2" style={{ marginTop: "0.16rem" }} />{project.street}
                                        </div>
                                        <div className="d-flex align-items-start ml-2">
                                            <Users className="feather mr-2" style={{ marginTop: "0.16rem" }} />Adam Szaruga
                                        </div>
                                    </div>
                                    <div>
                                        <ProgressBar active={location.pathname === `${match.path}/${project.id}`} project={project} />
                                    </div>
                                </NavLink> : null
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
