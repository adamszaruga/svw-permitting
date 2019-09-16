import React from 'react';
import moment from 'moment';
import { Box, Trash2, Edit2, Bookmark } from 'react-feather';
import { compose, withHandlers, withState } from 'recompose';
import { Link } from 'react-router-dom';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import ActionModal from './ActionModal';


let DELETE_MODAL_ID = "deleteModal";

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
    formData,
    note,
    setNote,
    saveNote,
    lastNote,
    bookmarks,
    toggleBookmark,
    submittals
})=> (
    <div className="w-75 bg-light ml-2 position-relative item" style={{ minHeight: "620px" }}>
        <div className="position-fixed w-100 m-2">
            <div className="pl-3 py-1 w-30"> 
                    <form onSubmit={onSubmit} className="pt-3">
                    <div className="h2 w-100 d-flex">
                        <Box className={"feather mr-2 text-primary align-self-center "+(editMode ? 'mb-3' : '')} />
                        {editMode ? (
                            <div className="form-group ">
                                <input
                                    required
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
                        <a href="#" onClick={(e)=>{e.preventDefault();toggleBookmark(project)}} className={`ml-auto mr-2 ${bookmarks.find(({id})=>id===project.id) ? 'text-bookmark' : 'text-secondary'}`}  ><Bookmark className="feather" /></a>
                        <a href="#" onClick={()=>setEditMode(true)}className="text-secondary  mr-2"  ><Edit2 className="feather" /></a>
                        <a href="#" className="text-secondary" data-toggle="modal" data-target={"#"+DELETE_MODAL_ID}><Trash2 className="feather " /></a>
                    </div>
                
                    <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <input
                            required 
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
                                required
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
                                required
                                readOnly={!editMode} 
                                name="state"
                                value={formData.state} 
                                id="state" 
                                className="form-control"
                                onChange={onChange}>
                                <option value="GA" defaultValue>GA</option>
                                <option value="NC" >NC</option>
                                <option value="SC" >SC</option>
                                <option value="VA" >VA</option>
                                <option value="PA" >PA</option>
                                <option value="MD" >MD</option>
                                <option value="WV" >WV</option>
                            </select>
                            {errors.state ? <div class="invalid-feedback">{errors.state}</div> : null} 
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="zip">Zip</label>
                            <input 
                                required
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
                        <label htmlFor="status">Status</label>
                        <select
                            required
                            disabled={!editMode}
                            value={formData.status || "new"}
                            className="form-control"
                            name="status"
                            id="status"
                            onChange={onChange}>
                            <option value="review">In Review</option>
                            <option value="comments">Comments Issued</option>
                            <option value="approved">Approved</option>
                            <option value="denied">Denied</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="new">New Project</option>
                        </select>
                        {errors.status ? <div className="invalid-feedback">{errors.status}</div> : null}
                    </div>
                    {!editMode ? (
                        <form onSubmit={saveNote}>
                            <div className="form-group">
                                <label htmlFor="note">Add Note</label>
                                <div className="input-group mb-3">
                                        <input value={note} name="note" onChange={(e)=>setNote(e.currentTarget.value)} type="text" className="form-control" />
                                    <div className="input-group-append">
                                        <button className="btn btn-outline-primary" type="submit">Add</button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="latest-note">Last Note</label>
                                <textarea disabled value={lastNote()} name="latest-note" onChange={(e) => setNote(e.currentTarget.value)} type="text" className="form-control" />      
                            </div>
                        </form>
                    ) : null}
                    {!editMode ? (
                        <form onSubmit={(e) => {e.preventDefault();e.stopPropagation();}}>
                            <div className="form-group">
                                <label htmlFor="latest-note">Submittals</label>
                                {!isLoaded(submittals) ? 'error' : isEmpty(submittals) ? 'No submittals' : submittals.filter(({project: { id }}) => id === project.id).map(({id, createdAt}, index)=>(
                                    <Link key={index} to={`/submittals/${id}`} className="btn btn-outline-primary w-100">{createdAt.toString()}</Link>
                                ))}
                            </div>
                        </form>
                    ) : null}
                    {editMode ? (
                        <div className="form-group">
                            <button type="submit" className="btn btn-primary mr-2">{isSubmitting ? "Saving..." : "Save Changes"}</button>
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

export default compose(
    withFormData('project'),
    withIsSubmitting,
    withError,
    withValidationErrors,
    firestoreConnect([
        { collection: 'submittals', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ bookmarks, firestore }) => ({ 
            bookmarks,
            submittals: firestore.ordered.submittals
         }),
        (dispatch) => ({
            toggleBookmark: (project) => dispatch({type: "TOGGLE_BOOKMARK", project})
        })
    ),
    withState('editMode', 'setEditMode', ({editMode})=>editMode),
    withState('note', 'setNote', '' ),
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

            let updates = {...formData}

            if (project.status !== formData.status) {
                let milestones = project.milestones || [];
                let now = new Date();
                let newMilestone = {
                    timestamp: now.toString(),
                    status: formData.status,
                    notes: []
                }
                updates.milestones = milestones.concat(newMilestone);
            }

            updateProject(project, updates).then(()=>{
                setEditMode(false);
                setIsSubmitting(false);
                setError(null);
            });
            
        },
        saveNote: ({
            project, 
            updateProject,
            note,
            setNote
        }) => event => {
            event.preventDefault();
            event.stopPropagation();
            let now = new Date();

            let milestones = project.milestones || [{
                status: 'new',
                timestamp: now.toString(),
                notes: []
            }]

            let newMilestones = milestones.map((milestone, index) => {
                if (index === milestones.length-1) {
                    return {
                        ...milestone,
                        notes: milestone.notes.concat({
                            timestamp: now.toString(),
                            text: note
                        })
                    }
                }
                return milestone;
            })

            updateProject(project, { milestones: newMilestones }).then(() => {
                setNote('');
            });
        },
        lastNote: ({project}) => () => {
           let lastNote = 'No notes for this project';
           if (!project.milestones) return lastNote;
           project.milestones.forEach(milestone => {
               if (milestone.notes && milestone.notes.length > 0) {
                   let {timestamp, text} = milestone.notes[milestone.notes.length -1];
                   lastNote = `${moment(timestamp).format('MMM D, h:mm a')} - ${text}`;
               }
           })
           return lastNote
        }
    })
)(Project);