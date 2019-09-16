import React from 'react';
import moment from 'moment';
import { Inbox, Trash2, Edit2, Bookmark } from 'react-feather';
import { compose, withHandlers, withState } from 'recompose';
import { Link } from 'react-router-dom';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import { connect } from 'react-redux';
import ActionModal from './ActionModal';
import AddFormModal from './AddFormModal';
import { Typeahead } from 'react-typeahead'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'

let DELETE_MODAL_ID = "deleteModal";
let ADD_FORM_MODAL_ID = "addFormModal";

const Document = ({
    document,
    deleteDocument,
    editMode,
    error,
    errors,
    setEditMode,
    onSubmit,
    onChange,
    isSubmitting,
    setFormData,
    formData,
    addForm,
    bookmarks,
    toggleBookmark,
    jurisdictions
}) => (
        <div className="w-75 bg-light ml-2 position-relative item" style={{ minHeight: "620px" }}>
            <div className="position-fixed w-100 m-2">
                <div className="pl-3 py-1 w-30">
                    <form onSubmit={onSubmit} className="pt-3">
                        <div className="h2 w-100 d-flex">
                            <Inbox className={"feather mr-2 text-primary align-self-center " + (editMode ? 'mb-3' : '')} />
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
                                        placeholder="Document Name"
                                        onChange={onChange} />
                                    {errors.street ? <div class="invalid-feedback">{errors.street}</div> : null}
                                </div>
                            ) : formData.name}
                            <a href="#" onClick={(e) => { e.preventDefault(); toggleBookmark(document) }} className={`ml-auto mr-2 ${bookmarks.find(({ id }) => id === document.id) ? 'text-bookmark' : 'text-secondary'}`}  ><Bookmark className="feather" /></a>
                            <a href="#" onClick={() => setEditMode(true)} className="text-secondary  mr-2"  ><Edit2 className="feather" /></a>
                            <a href="#" className="text-secondary" data-toggle="modal" data-target={"#" + DELETE_MODAL_ID}><Trash2 className="feather " /></a>
                        </div>

                        <div className="form-group">
                            <label htmlFor="street">Street Address</label>
                            {/* <input
                                required
                                readOnly={!editMode}
                                value={formData.street}
                                type="text"
                                className="form-control"
                                name="street"
                                id="street"
                                placeholder="Street Address"
                                onChange={onChange} /> */}
                            {!isLoaded(jurisdictions)? '' : 
                                <Typeahead
                                    options={jurisdictions}
                                    maxVisible={2}
                                    filterOption={(inputValue, option)=>{
                                        return option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                    }}
                                    displayOption={(option)=>option.name}
                                    onOptionSelected={(option)=>setFormData({...formData, jurisdictionId: option.id})}
                                />
                            }
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1" />
                                    <label className="form-check-label" htmlFor="inlineCheckbox1">1</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="checkbox" id="inlineCheckbox2" value="option2" />
                                    <label className="form-check-label" htmlFor="inlineCheckbox2">2</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="checkbox" id="inlineCheckbox3" value="option3" disabled />
                                    <label className="form-check-label" htmlFor="inlineCheckbox3">3 (disabled)</label>
                                </div>
                            {errors.street ? <div className="invalid-feedback">{errors.street}</div> : null}
                        </div>
                        
                        {editMode ? (
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary mr-2">{isSubmitting ? "Saving..." : "Save Changes"}</button>
                                <button type="button" onClick={() => {
                                    setFormData(document);
                                    setEditMode(false);
                                }} className="btn btn-secondary">Cancel</button>
                            </div>
                        ) : null}
                        <div className="form-group">
                            {error ? <div className="invalid-feedback">{error}</div> : null}
                        </div>
                    </form>

                </div>

            </div>
            <ActionModal
                modalId={DELETE_MODAL_ID}
                action={() => deleteDocument(document)}
                title={document.name}
                message="Are you sure you want to delete this document?"
                actionText="Delete" />
            <AddFormModal
                modalId={ADD_FORM_MODAL_ID}
                title={document.name}
                action={(fileId) => addForm(fileId)}
                actionText="Add Form" />
        </div>
    )

export default compose(
    withFormData('document'),
    withIsSubmitting,
    withError,
    withValidationErrors,
    firestoreConnect([
        { collection: 'jurisdictions', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ bookmarks, firestore }) => ({ 
            bookmarks,
            jurisdictions: firestore.ordered.jurisdictions
        }),
        (dispatch) => ({
            toggleBookmark: (document) => dispatch({ type: "TOGGLE_BOOKMARK", document })
        })
    ),
    withState('editMode', 'setEditMode', ({ editMode }) => editMode),
    withState('note', 'setNote', ''),
    withHandlers({
        onSubmit: ({
            formData,
            setValidationErrors,
            setIsSubmitting,
            setEditMode,
            setError,
            setFormData,
            setOutput,
            updateDocument,
            document
        }) => event => {
            event.preventDefault();
            // validate however
            if (formData.name.length === 0) {
                return setValidationErrors({ name: 'Name is required' });
            }
            setValidationErrors({});
            setIsSubmitting(true);

            let updates = { ...formData }

            if (document.status !== formData.status) {
                let milestones = document.milestones || [];
                let now = new Date();
                let newMilestone = {
                    timestamp: now.toString(),
                    status: formData.status,
                    notes: []
                }
                updates.milestones = milestones.concat(newMilestone);
            }

            updateDocument(document, updates).then(() => {
                setEditMode(false);
                setIsSubmitting(false);
                setError(null);
            });

        },
        addForm: ({
            document,
            updateDocument,
            note,
            setNote
        }) => async fileId => {
            // the form was just uploaded and its fields have been mapped
            // now you need to update this Document object with a pointer to the form

            let oldForms = document.submittals.commercial.forms;

            let newForms = oldForms.concat({
                formId: fileId
            })

            let updates = {
                submittals: {
                    commercial: {
                        forms: newForms
                    }
                }
            }
            await updateDocument(document, updates);
            console.log('jurisdition updated too!')
        },
        lastNote: ({ document }) => () => {
            let lastNote = 'No notes for this document';
            if (!document.milestones) return lastNote;
            document.milestones.forEach(milestone => {
                if (milestone.notes && milestone.notes.length > 0) {
                    let { timestamp, text } = milestone.notes[milestone.notes.length - 1];
                    lastNote = `${moment(timestamp).format('MMM D, h:mm a')} - ${text}`;
                }
            })
            return lastNote
        }
    })
)(Document);