import React, { Component } from 'react';
import { connect } from 'react-redux'
import { compose, withHandlers, withState } from 'recompose';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../../HOC/forms';
import { CornerRightDown } from 'react-feather';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { Edit2 } from 'react-feather';

const enhance = compose(
    firestoreConnect([
        { collection: 'jurisdictions', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore, submittal }) => ({
            jurisdictions: firestore.ordered.jurisdictions,
            submittal,
            jurisdiction: submittal.payload.jurisdiction
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection:  (newIndex) => dispatch({type: 'SET_SECTION_INDEX', newIndex}),
            loadJurisdiction: (jurisdiction) => dispatch({type: "LOAD_JURISDICTION", jurisdiction})
        })
    ),
    withFormData('jurisdiction'),
    withError,
    withValidationErrors,
    withState('editMode', 'setEditMode', ({ submittal }) => submittal.currentSectionIndex === 0),
    withHandlers({
        submitHandler: ({
            nextSection,
            formData,
            setValidationErrors,
            setEditMode,
            submittal,
            jurisdictions,
            loadJurisdiction,
        }) => e => {
            e.preventDefault();
            if (formData.id === "choose" || formData.id === null || formData.id === undefined) {
                setValidationErrors({
                    id: "Please select a jurisdiction"
                });
                return;
            }
            setValidationErrors({});
        
            // need to make the submittal redux state have the correct payload
            let jurisdiction = jurisdictions.find(j => j.id === formData.id);
            
            loadJurisdiction(jurisdiction);
            nextSection();
            setEditMode(false);
        }
    })
);

const Jurisdiction = ({
    submittal,
    jurisdictions,
    jurisdictionStart,
    editMode,
    setEditMode,
    onChange,
    submitHandler,
    setSection,
    errors
}) => (
        <form noValidate>
        {editMode ?
            <div className="row border-bottom border-light bg-light">
                <div className="col-3">
                        <div className="h6">Confirm your Jurisdiction</div>
                        <div className=" text-muted">Make sure to call the local permit office to confirm that your project is in their jurisdiction</div>
                </div>
                <div className="col-7">
                    <div className="form-group">
                        <label htmlFor="id">Choose a Jurisdiction</label>
                        { !isLoaded(jurisdictions) ? 'loading' :
                            isEmpty(jurisdictions) ? 'empty' :
                            <select
                                required
                                defaultValue="choose"
                                className={`form-control ${errors.id ? 'is-invalid' : ''}`}
                                name="id"
                                onChange={onChange}
                                >
                                {
                                    jurisdictions.map((j, i)=>(
                                        <option key={i} value={j.id}>{j.name}</option>
                                    ))
                                } 
                                <option value="choose">Chose a jurisdiction...</option>
                            </select>
                        }
                        { errors.id ? <div className="invalid-feedback">{errors.id}</div> : null}
                    </div>
                    <button onClick={submitHandler} className="btn btn-outline-primary w-100">Next<CornerRightDown className="feather ml-2" /> </button>

                </div>
                
            </div>
            :
            <div className="row bg-light">
                <div className="col-9 ml-auto">
                    <div className="d-flex align-items-baseline">
                        <h1>{submittal.payload.jurisdiction.name}</h1>
                        <div>
                            { jurisdictionStart ? null : 
                                <a href="#" onClick={() => {setEditMode(true); setSection(0);}} className="ml-4">Change jurisdiction?</a>
                            }
                        </div>
                    </div>
                    
                    
                    <b>Some subtitle that makes sense</b>
                </div>
            </div>
        }
        
    </form>
)
 
export default enhance(Jurisdiction);