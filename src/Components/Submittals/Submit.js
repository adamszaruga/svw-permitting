import React from 'react';
import { compose, withHandlers } from 'recompose';
import { Settings } from 'react-feather';
import { connect } from 'react-redux';
import { withFirebase } from 'react-redux-firebase';
const enhance = compose(
    connect(
        ({ submittal }) => ({
            submittal
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex })
        })
    ),
    withFirebase,
    withHandlers({
        clickHandler: ({ submittal, firebase }) => async e => {
            e.preventDefault();
            console.log("firebase:")

            console.log(firebase)
            let response = await firebase.functions().httpsCallable('generateSubmittal')(submittal.payload);
            console.log(response);
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