import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect } from 'react-redux-firebase'


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
    withState('filter', 'setFilter', ''),
    withHandlers({
        updateProject: props => (project, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'projects', doc: project.id }, updates)
        }
    }),
)

let Dashboard = ({
    projects
}) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                    <button className="btn btn-sm btn-outline-secondary">Share</button>
                    <button className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle">
                    <span data-feather="calendar"></span>
                    This week
                </button>
            </div>
        </div>
        <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
                <a className="nav-link active" id="permits-tab" data-toggle="tab" href="#permits" role="tab" aria-controls="permits" aria-selected="false">Permits</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" id="metrics-tab" data-toggle="tab" href="#metrics" role="tab" aria-controls="metrics" aria-selected="true">Metrics</a>
            </li>
        </ul>
        <div className="tab-content" id="myTabContent">
            
            <div className="tab-pane fade show active" id="permits" role="tabpanel" aria-labelledby="permits-tab">
        
            </div>
            <div className="tab-pane fade " id="metrics" role="tabpanel" aria-labelledby="metrics-tab">...</div>
        </div>
    </div>
);

export default enhance(Dashboard);

