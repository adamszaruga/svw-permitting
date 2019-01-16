import React, { Component } from 'react';
import { User, Save, Edit2, Box, Briefcase, Map, CornerRightDown } from 'react-feather';
import { compose, withState, withHandlers, withProps, lifecycle } from 'recompose';
import { firestoreConnect } from 'react-redux-firebase';
import { connect } from 'react-redux';

const enhance = compose(
    firestoreConnect([
        { collection: 'contacts', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore, submittal }) => ({
            contacts: firestore.ordered.contacts,
            submittal,
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex }),
            loadProject: (project) => dispatch({ type: "LOAD_PROJECT", project })
        })
    ),
    withState('editMode', 'setEditMode', true),
    withHandlers({
        submitHandler: ({
            nextSection,
            formData,
            setValidationErrors,
            contacts,
            loadProject,
            editMode,
            setEditMode
        }) => e => {
            e.preventDefault();
            e.stopPropagation();
            // if (formData.id === "choose" || formData.id === null) {
            //     setValidationErrors({
            //         id: "Please select a project"
            //     });
            //     return;
            // }
            setValidationErrors({});

            // need to make the submittal redux state have the correct payload
            loadProject(formData);
            setEditMode(false);
            nextSection();
        }
    }),
    withProps(() => ({
        refProp: React.createRef()
    })),
    lifecycle({
        componentDidMount() {
            setTimeout(() => {
                window.scrollTo({
                    top: this.props.refProp.current.offsetTop,
                    behavior: 'smooth'
                })
            }, 200);

        }
    })
);

const Contacts = ({
    onChange,
    errors,
    editMode,
    setEditMode,
    submitHandler,
    submittal,
    refProp
}) => (
    <form noValidate ref={refProp}>
        <div className="row py-4 border-bottom border-light bg-light">
            <div className="col-3 ">
                <div className="h6">Contacts</div>
                <div className=" text-muted">Fill out general information about the people and firms involved in your project</div>
            </div>
            <div className="col-7">
                <div className="card mb-3">
                    <div className="card-header bg-white d-flex justify-content-between align-items-baseline">
                        <div className="h6">Applicant</div>
                        <div className="btn-group">
                            <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <User className="feather" /> Auto Fill
                            </button>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="#">Action</a>
                                <a className="dropdown-item" href="#">Another action</a>
                                <a className="dropdown-item" href="#">Something else here</a>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">Separated link</a>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group col-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Name</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        id="name"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                            </div>
                            <div className="form-group col-md-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Company</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        id="company"
                                        name="company"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.company ? <div className="invalid-feedback">{errors.company}</div> : null}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">City</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        name="city"
                                        id="city"
                                        onChange={onChange} />
                                    {errors && errors.city ? <div className="invalid-feedback">{errors.city}</div> : null}
                                </div>
                            </div>
                            <div className="form-group col-md-3">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">State</span>
                                    </div>
                                    <select
                                        required
                                        readOnly={!editMode}
                                        name="state"
                                        id="state"
                                        className="form-control custom-select"
                                        onChange={onChange}>
                                        <option value="GA" defaultValue>GA</option>

                                    </select>
                                </div>
                                {errors && errors.state ? <div className="invalid-feedback">{errors.state}</div> : null}
                            </div>
                            <div className="form-group col-md-3">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Zip</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        id="zip"
                                        name="zip"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.zip ? <div className="invalid-feedback">{errors.zip}</div> : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card mb-3">
                    <div className="card-header bg-white d-flex justify-content-between align-items-baseline">
                        <div className="h6">Contractor</div>
                        <div className="btn-group">
                            <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <User className="feather" /> Auto Fill
                            </button>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="#">Action</a>
                                <a className="dropdown-item" href="#">Another action</a>
                                <a className="dropdown-item" href="#">Something else here</a>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">Separated link</a>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group col-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Name</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        id="name"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                            </div>
                            <div className="form-group col-md-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Company</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        id="company"
                                        name="company"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.company ? <div className="invalid-feedback">{errors.company}</div> : null}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-6">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">City</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        name="city"
                                        id="city"
                                        onChange={onChange} />
                                    {errors && errors.city ? <div className="invalid-feedback">{errors.city}</div> : null}
                                </div>
                            </div>
                            <div className="form-group col-md-3">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">State</span>
                                    </div>
                                    <select
                                        required
                                        readOnly={!editMode}
                                        name="state"
                                        id="state"
                                        className="form-control custom-select"
                                        onChange={onChange}>
                                        <option value="GA" defaultValue>GA</option>

                                    </select>
                                </div>
                                {errors && errors.state ? <div className="invalid-feedback">{errors.state}</div> : null}
                            </div>
                            <div className="form-group col-md-3">
                                <div className="input-group input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text bg-light">Zip</span>
                                    </div>
                                    <input
                                        required
                                        readOnly={!editMode}
                                        type="text"
                                        className="form-control"
                                        id="zip"
                                        name="zip"
                                        onChange={onChange} />
                                </div>
                                {errors && errors.zip ? <div className="invalid-feedback">{errors.zip}</div> : null}
                            </div>
                        </div>
                    </div>
                </div>
                {submittal.currentSectionIndex <= submittal.sectionOrder.indexOf('contacts') ?
                    <button onClick={submitHandler} className="btn btn-outline-primary w-100">
                        Next<CornerRightDown className="feather ml-2" />
                    </button>
                    : editMode ?
                        <button onClick={submitHandler} className="btn btn-outline-primary w-100">
                            Save<Save className="feather ml-2" />
                        </button>
                        :
                        <button onClick={e => { e.preventDefault(); setEditMode(true) }} className="btn btn-outline-secondary w-100">
                            Edit<Edit2 className="feather ml-2" />
                        </button>
                }
            </div>
        </div>
    </form>
)

export default enhance(Contacts);