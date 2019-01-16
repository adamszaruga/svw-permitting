import React, { Component } from 'react';
import { User, Box, Edit2, Briefcase, Map, CornerRightDown, Save } from 'react-feather';
import { compose, withHandlers, withState, withProps, lifecycle } from 'recompose';
import { withFormData, withError, withValidationErrors } from '../../HOC/forms';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { isError } from 'util';

let REF;

const enhance = compose(
    firestoreConnect([
        { collection: 'projects', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore, submittal }) => ({
            projects: firestore.ordered.projects,
            submittal,
            project: submittal.payload.project
        }),
        (dispatch) => ({
            nextSection: () => dispatch({ type: "NEXT" }),
            setSection: (newIndex) => dispatch({ type: 'SET_SECTION_INDEX', newIndex }),
            loadProject: (project) => dispatch({ type: "LOAD_PROJECT", project })
        })
    ),
    withFormData('project'),
    withError,
    withValidationErrors,
    withState('editMode', 'setEditMode', true),
    withHandlers({
        submitHandler: ({
            nextSection,
            formData,
            setValidationErrors,
            projects,
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
        },
        loadProjectHandler: ({setFormData}) => (e, project) => {
            e.preventDefault();
            setFormData(project);
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


const Project = ({ 
    submittal,
    formData,
    onChange, 
    errors,
    submitHandler,
    projects,
    loadProjectHandler,
    editMode,
    setEditMode,
    refProp
}) => (
<form noValidate ref={refProp}>
    <div className="row py-4 border-bottom bg-light">
        <div className="col-3 ">
            <div className="h6">Project Information</div>
            <div className=" text-muted">Provide information about your project to the best of your ability</div>
        </div>
        <div className="col-7">
            <div className="card mb-3">
                <div className="card-header bg-white d-flex justify-content-between align-items-baseline">
                    <div className="h6">General Information</div>
                    <div className="btn-group">
                        { !isLoaded(projects) ? '' : isEmpty(projects) ? '' :
                            <span>
                                        <button disabled={!editMode} type="button" className="btn btn-outline-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <Box className="feather" /> Auto Fill
                                </button>
                                <div className="dropdown-menu">
                                    { projects.filter(p => !p.isArchived).map((project, i) => (
                                        <a onClick={(e)=>loadProjectHandler(e, project)} key={i} className="dropdown-item" href="#">{project.name}</a>
                                    ))}
                                </div>
                            </span>
                        }
                        
                        
                    </div>
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-12">
                            <div className="input-group input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-light">Project Name</span>
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={onChange} />
                            </div>
                            {errors && errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                        </div>
                        
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-12">
                            <div className="input-group input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-light">Street</span>
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={onChange} />
                            </div>
                            {errors && errors.street ? <div className="invalid-feedback">{errors.street}</div> : null}
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
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    name="city"
                                    id="city"
                                    value={formData.city}
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
                                    name="state"
                                    id="state"
                                    className="form-control custom-select"
                                    value={formData.state}
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
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    id="zip"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={onChange} />
                            </div>
                            {errors && errors.zip ? <div className="invalid-feedback">{errors.zip}</div> : null}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-header bg-white">
                    <div className="h6 m-0">Scope of Work</div>
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-12">
                            <div className="custom-control custom-radio custom-control-inline">
                                <input value={"residential"} checked={formData.projectType === "residential"} onChange={onChange} type="radio" name="projectType" className="custom-control-input" id="projectType1" />
                                        <label className="custom-control-label" htmlFor="projectType1">Residential</label>
                            </div>
                            <div className="custom-control custom-radio custom-control-inline">
                                        <input value={"commercial"} checked={formData.projectType === "commercial"} onChange={onChange} type="radio" name="projectType" id="projectType2" className="custom-control-input" />
                                        <label className="custom-control-label" htmlFor="projectType2">Commercial</label>
                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-12">
                            <div className="input-group input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-light">Estimated Cost</span>
                                </div>
                                <input
                                    required
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    name="cost"
                                    id="cost"
                                    onChange={onChange} />
                            </div>
                            {errors && errors.cost ? <div className="invalid-feedback">{errors.cost}</div> : null}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-12">
                            <div className="input-group input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text bg-light">Short Description</span>
                                </div>

                                <textarea
                                    required
                                    type="text"
                                    className="form-control"
                                    readOnly={!editMode} 
                                    name="scope"
                                    id="scope"
                                    onChange={onChange}></textarea>
                                {errors && errors.scope ? <div className="invalid-feedback">{errors.scope}</div> : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {  submittal.currentSectionIndex <= submittal.sectionOrder.indexOf('project')  ? 
                <button onClick={submitHandler} className="btn btn-outline-primary w-100">
                    Next<CornerRightDown className="feather ml-2" /> 
                </button> 
                : editMode ? 
                    <button onClick={submitHandler} className="btn btn-outline-primary w-100">
                    Save<Save className="feather ml-2" />
                </button> 
                :
                <button onClick={e=>{e.preventDefault();setEditMode(true)}} className="btn btn-outline-secondary w-100">
                    Edit<Edit2 className="feather ml-2" />
                </button> 
            }
            

        </div>
    </div>
</form>
)


export default enhance(Project);