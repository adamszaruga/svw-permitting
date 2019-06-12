import React, { Component } from 'react';
import { User, Save, Edit2, Box, Briefcase, Map, CornerRightDown } from 'react-feather';
import { compose, withState, withHandlers, withProps, lifecycle } from 'recompose';
import { withFormData, withError, withValidationErrors } from '../../HOC/forms';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { connect } from 'react-redux';

const enhance = compose(
    firestoreConnect([
        { collection: 'firms', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore, submittal }) => ({
            firms: firestore.ordered.firms,
            submittal,
            requiredContacts: submittal.payload.jurisdiction.submittals.commercial.requiredContacts,
            contacts: submittal.payload.contacts
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex }),
            loadContacts: (contacts) => dispatch({ type: "LOAD_CONTACTS", contacts })
        })
    ),
    withFormData('contacts'),
    withError,
    withValidationErrors,
    withState('editMode', 'setEditMode', true),
    withHandlers({
        submitHandler: ({
            nextSection,
            formData,
            setValidationErrors,
            loadContacts,
            setEditMode,
            submittal,
            requiredContacts
        }) => e => {
            e.preventDefault();
            e.stopPropagation();
            // if (formData.id === "choose" || formData.id === null) {
            //     setValidationErrors({
            //         id: "Please select a project"
            //     });
            //     return;
            // }

            let contactsSplit = Object.keys(formData).reduce( (acc, key) => {
                let [ type, field ] = key.split(':');
                if (!acc[type]) acc[type] = {};
                acc[type][field] = formData[key]
                return acc;
            }, {})
            // console.log(formData)

            let types = ['applicant', 'contractor', 'architect', 'engineer', 'owner']
            let errors = [];
            types.filter(t=>requiredContacts.indexOf(t)>-1).forEach(type => {
                let contactToValidate = contactsSplit[type] || {};
                // console.log(contactToValidate);
                let { error, value } = submittal.schemas.contact.validate(contactToValidate);
                // console.log(error)
                if (error) {
                    let { details } = error;
                    let validationErrors = details.reduce((acc, detail) => {
                        acc[`${type}:${detail.path[0]}`] = detail.message;
                        return acc;
                    }, {})
                    errors.push(validationErrors);
                    return;
                }
            });
            console.log(errors)
            if (errors.length > 0) {
                setValidationErrors(Object.assign({}, ...errors));
                return
            }
        

            // need to make the submittal redux state have the correct payload
            loadContacts(formData);
            setEditMode(false);
            nextSection();
        },
        loadContactHandler: ({ setFormData, formData }) => (e, contact, type) => {
            e.preventDefault();
            let contactCopy = Object.keys(contact).reduce((acc, key) => {
                if (contact[key]) acc[`${type}:${key}`] = contact[key]
                return acc;
            }, {})
            setFormData({
                ...formData,
                ...contactCopy
            });
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
    refProp,
    requiredContacts,
    loadContactHandler,
    firms,
    formData
}) => (
    <form noValidate ref={refProp}>
        <div className="row py-4 border-bottom border-light bg-light">
            <div className="col-3 ">
                <div className="h6">Contacts</div>
                <div className=" text-muted">Fill out general information about the people and firms involved in your project</div>
            </div>
            <div className="col-7">
                {
                    requiredContacts.map((contact, index) => {
                        return (
                            <div key={index} className="card mb-3">
                                <div className="card-header bg-white d-flex justify-content-between align-items-baseline">
                                    <div className="h6 text-capitalize">{contact}</div>
                                    {
                                        !isLoaded(firms) ? '' : isEmpty(firms) ? '' :
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    {contact === "applicant" ? <User className="feather" /> : <Briefcase className="feather" />} Auto Fill
                                                </button>
                                                <div className="dropdown-menu">
                                                    {firms.filter(f => f.type === contact).map((item, index) => {
                                                        return (
                                                            <a key={index} onClick={(e) => loadContactHandler(e, item, contact)} className="dropdown-item" href="#">{item.name}</a>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                    }
                                    
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
                                                    className={`form-control ${errors[`${contact}:name`] ? 'is-invalid' : ''}`}                                                    
                                                    value={formData[`${contact}:name`] || ""}
                                                    name={`${contact}:name`}
                                                    onChange={onChange} />
                                            </div>
                                            {errors && errors[`${contact}:name`] ? <div className="invalid-feedback">{errors[`${contact}:name`]}</div> : null}
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
                                                    className={`form-control ${errors[`${contact}:company`] ? 'is-invalid' : ''}`}                                                    
                                                    value={formData[`${contact}:company`] || ""}
                                                    name={`${contact}:company`}
                                                    onChange={onChange} />
                                            </div>
                                            {errors && errors[`${contact}:company`] ? <div className="invalid-feedback">{errors[`${contact}:company`]}</div> : null}
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
                                                    className={`form-control ${errors[`${contact}:city`] ? 'is-invalid' : ''}`}                                                    
                                                    value={formData[`${contact}:city`] || ""}
                                                    name={`${contact}:city`}
                                                    onChange={onChange} />
                                                {errors && errors[`${contact}:city`] ? <div className="invalid-feedback">{errors[`${contact}:city`]}</div> : null}
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
                                                    value={formData[`${contact}:state`] || ""}
                                                    name={`${contact}:state`}
                                                    className={`form-control custom-select ${errors[`${contact}:state`] ? 'is-invalid' : ''}`} 
                                                    onChange={onChange}>
                                                    <option value="GA" defaultValue>GA</option>

                                                </select>
                                            </div>
                                            {errors && errors[`${contact}:state`] ? <div className="invalid-feedback">{errors[`${contact}:state`]}</div> : null}
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
                                                    className={`form-control ${errors[`${contact}:zip`] ? 'is-invalid' : ''}`}                                                    
                                                    value={formData[`${contact}:zip`] || ""}
                                                    name={`${contact}:zip`}
                                                    onChange={onChange} />
                                            </div>
                                            {errors && errors[`${contact}:zip`] ? <div className="invalid-feedback">{errors[`${contact}:zip`]}</div> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
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