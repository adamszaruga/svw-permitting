import React from 'react';
import { compose } from 'recompose';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';
import { connect } from 'react-redux';
import Submittals from './Submittals/Submittals';

const enhance = compose(
    firestoreConnect(({projectId}) => {
        return [
            `projects/${projectId}`
        ]
    }),
    connect(
        ({ firestore }) => {
            return {projects: firestore.ordered.projects}
        }
    ),
);

let SubmittalsContainer = ({
    projectId,
    projects
}) => {
    if (!isLoaded(projects)) return 'loading';
    if (projectId) {
        let project = projects.find(p => p.id === projectId);
        if (project && project.submittals && project.submittals.length > 0) {
            return <Submittals initialPayload={project.submittals[project.submittals.length - 1]}/>
        } else {
            return <Submittals initialPayload={{
                project: {
                    ...project
                }}} />
        }

    }
    return <Submittals />
}
export default enhance(SubmittalsContainer);

