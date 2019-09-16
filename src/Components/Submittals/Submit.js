import React from 'react';
import { compose, withHandlers } from 'recompose';
import { Settings } from 'react-feather';
import { connect } from 'react-redux';
import { withFirebase, firestoreConnect } from 'react-redux-firebase';

const enhance = compose(
    firestoreConnect([
        { collection: 'submittals', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ submittal, firestore }) => ({
            submittal,
            submittals: firestore.ordered.submittals
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex })
        })
    ),
    // withFirebase,
    withHandlers({
        clickHandler: ({ submittal, submittals, firestore }) => async e => {
            e.preventDefault();
            console.log("submittals:")
            console.log(submittals);
            console.log('submittal:')
            console.log(submittal)
            // let response = await firebase.functions().httpsCallable('generateSubmittal')(submittal.payload);
            firestore.add('submittals', {
                ...submittal.payload,
                createdAt: firestore.FieldValue.serverTimestamp()
            }).then(({ id }) => {
                console.log(`Submittal Created: ${id}`)
            })
            
        }
    })
)

const Submit = ({
    clickHandler
}) => (
    <div className="row border-bottom border-light bg-light">
        <div className="col-3">
            Generate!
        </div>
        <div className="col-7">
                <button className="btn btn-outline-primary w-100" onClick={(e) => clickHandler(e)}><Settings className="feather ml-2" />Generate</button>
        </div>
    </div>
)


export default enhance(Submit);