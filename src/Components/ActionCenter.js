import React from 'react';
import { compose, withHandlers } from 'recompose';
import { Settings } from 'react-feather';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

const enhance = compose(
    firestoreConnect(({submittalId})=> [
        { collection: 'submittals', doc: submittalId }
    ]),
    connect(
        ({ firestore }) => ({
            submittal: firestore.ordered.submittals ? firestore.ordered.submittals[0] : null,
            submittals: firestore.ordered.submittals
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex })
        })
    )
)

const ActionCenter = ({
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


export default enhance(ActionCenter);