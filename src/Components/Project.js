import React, { Component } from 'react';
import { Box, Trash2, Edit2 } from 'react-feather';
import { compose, withHandlers, withState } from 'recompose';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import ActionModal from './ActionModal';

let DELETE_MODAL_ID = "deleteModal";
let state = {
    editMode: false
}

const Project = ({
    project, 
    deleteProject,
    editMode,
    error,
    errors,
    setEditMode,
    onSubmit,
    onChange,
    isSubmitting,
    setFormData,
    formData
})=> (
    <div className="w-75 bg-light ml-2 position-relative item" style={{ minHeight: "500px" }}>
        <div className="position-fixed w-100 m-2">
            <div className="pl-3 py-1 w-30"> 
                    <form onSubmit={onSubmit} className="pt-3">
                    <div className="h2 w-100 d-flex">
                        <Box className={"feather mr-2 text-primary align-self-center "+(editMode ? 'mb-3' : '')} />
                        {editMode ? (
                            <div className="form-group ">
                                <input
                                    readOnly={!editMode}
                                    value={formData.name}
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    id="name"
                                    placeholder="Project Name"
                                    onChange={onChange} />
                                {errors.street ? <div class="invalid-feedback">{errors.street}</div> : null}
                            </div>
                        ) : formData.name}
                        <a href="#" onClick={()=>setEditMode(true)}className="text-secondary ml-auto mr-2"  ><Edit2 className="feather" /></a>
                        <a href="#" className="text-secondary" data-toggle="modal" data-target={"#"+DELETE_MODAL_ID}><Trash2 className="feather " /></a>
                    </div>
                
                    <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <input 
                            readOnly={!editMode} 
                            value={formData.street} 
                            type="text" 
                            className="form-control" 
                            name="street" 
                            id="street" 
                            placeholder="Street Address" 
                            onChange={onChange}/>
                        {errors.street ? <div class="invalid-feedback">{errors.street}</div> : null}  
                    </div>
                    <div className="form-row">
                        <div className="form-group col-6">
                            <label htmlFor="city">City</label>
                            <input 
                                readOnly={!editMode} 
                                value={formData.city} 
                                type="text" 
                                className="form-control" 
                                name="city" 
                                id="city"
                                onChange={onChange} />
                            {errors.city ? <div class="invalid-feedback">{errors.city}</div> : null} 
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="state">State</label>
                            <select 
                                readOnly={!editMode} 
                                name="state" 
                                id="state" 
                                className="form-control"
                                onChange={onChange}>
                                <option defaultValue>Choose...</option>
                                <option>...</option>
                            </select>
                            {errors.state ? <div class="invalid-feedback">{errors.state}</div> : null} 
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="zip">Zip</label>
                            <input 
                                readOnly={!editMode} 
                                value={formData.zip} 
                                type="text" 
                                className="form-control" 
                                id="zip" 
                                name="zip"
                                onChange={onChange} />
                            {errors.zip ? <div class="invalid-feedback">{errors.zip}</div> : null} 
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="cost">Cost of construction</label>
                        <input 
                            readOnly={!editMode} 
                            value={formData.cost} 
                            type="number" 
                            className="form-control" 
                            id="cost" 
                            name="cost" 
                            placeholder="Cost of Construction" 
                            onChange={onChange}/>
                        {errors.cost ? <div class="invalid-feedback">{errors.cost}</div> : null} 
                    </div>
                    <div className="form-group">
                        <label htmlFor="scope">Scope of Work</label>
                        <textarea 
                            readOnly={!editMode} 
                            value={formData.scope} 
                            className="form-control" 
                            id="scope" 
                            name="scope" 
                            rows="3"
                            onChange={onChange}></textarea>
                        {errors.scope ? <div class="invalid-feedback">{errors.scope}</div> : null} 
                    </div>
                    {editMode ? (
                        <div className="form-group">
                            <button type="submit" className="btn btn-primary mr-2">Save Changes</button>
                            <button type="button" onClick={()=>{
                                setFormData(project);
                                setEditMode(false);
                            }}className="btn btn-secondary">Cancel</button>
                        </div> 
                    ): null}
                    <div className="form-group">
                        {error ? <div className="invalid-feedback">{error}</div> : null }
                    </div>
                </form>
            </div>

        </div>
            <ActionModal 
                modalId={DELETE_MODAL_ID} 
                action={() => deleteProject(project)} 
                title={project.name}
                message="Are you sure you want to delete this project?"
                actionText="Delete" />
    </div>
)
    
const initialFormState = {
    name: 'name',
    street: 'street',
    city: 'city',
    state: 'state',
    zip: 'zip',
    cost: 0,
    scope: 'scope'
};

export default compose(
    withFormData('project'),
    withIsSubmitting,
    withError,
    withValidationErrors,
    withState('editMode', 'setEditMode', ({editMode})=>editMode),
    withHandlers({
        onSubmit: ({
            formData,
            setValidationErrors,
            setIsSubmitting,
            setEditMode,
            setError,
            setFormData,
            setOutput,
            updateProject,
            project
        }) => event => {
            event.preventDefault();
            // validate however
            if (formData.name.length === 0) {
                return setValidationErrors({ name: 'Name is required' });
            }
            setValidationErrors({});

            setIsSubmitting(true);

            updateProject(project, {...formData}).then(()=>{
                setEditMode(false);
                setIsSubmitting(false);
                setError(null);
            });
            
        },
    })
)(Project);