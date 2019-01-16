import React from 'react';
import { isLoaded, isEmpty } from 'react-redux-firebase';
import { NavLink } from 'react-router-dom';
import { compose } from 'redux';
import { withHandlers, withState } from 'recompose';
import Permit from './Permit';

const enhance = compose(
    withState('filter', 'setFilter', ''),
    withHandlers({
        filterProjects: props => () => {
            return props.projects.filter((project) => {
                var keys = Object.keys(project);
                for (let i = 0; i < keys.length; i++) {
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
let Permits = ({
    projects,
    setFilter,
    filterProjects
}) => (
    <div className="list-group list-group-flush w-100">
        <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
            <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
        </div>
        {
            !isLoaded(projects)
                ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                : isEmpty(projects)
                    ? 'No projects to show'
                    : filterProjects().map((project) => (
                        !project.isArchived ? <Permit project={project} key={project.id}/> : null
                    ))
        }
    </div>
)

export default enhance(Permits);

/*
Start off with a row with Project Name in an H1, and a greyed out "start new permit +"

Starting a new permit tiggers a modal where you select applicant, jurisdiction, owner

Once started, the row has Project name with an H1, the applicant, juris, owner as small text (with an edit pencil icon)

Below that, there should be a progress bar, color blocked for each phase of the permit, with date timestamps for each block

Notes should be marked on the timeline, hover over for full note text

Action buttons go on the bottom: "Add Note", "Print application", and "Update Status"
*/