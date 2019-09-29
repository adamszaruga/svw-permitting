import React from 'react';
import { Inbox, Trash2, Edit2, Bookmark, Target, Briefcase } from 'react-feather';
import { compose, withHandlers, withState } from 'recompose';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import { connect } from 'react-redux';
import PacketGeneratorModal from './PacketGeneratorModal'
import ActionModal from './ActionModal';
import { Typeahead } from 'react-typeahead'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'

let DELETE_MODAL_ID = "deleteModal";
let PACKET_GENERATOR_MODAL_ID = "generatePacket";
let LABEL_GENERATOR_MODAL_ID = "generateLabel";
let DOCUMENT_REQUEST_MODAL_ID = "documentRequest";

const ENTITY_TYPES = [
    'project',
    'owner',
    'applicant',
    'contractor',
    'econtractor',
    'pcontractor',
    'mcontractor',
    'architect',
    'engineer'
]


const Submittal = ({
    submittal,
    deleteSubmittal,
    updateSubmittal,
    editMode,
    error,
    errors,
    setEditMode,
    onSubmit,
    onChange,
    isSubmitting,
    setFormData,
    formData,
    bookmarks,
    toggleBookmark,
    addEntity,
    selectEntity,
    removeEntity,
    projects,
    jurisdictions,
    firms,
    savePackets
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
                                        placeholder="Submittal Name"
                                        onChange={onChange} />
                                    {errors.street ? <div class="invalid-feedback">{errors.street}</div> : null}
                                </div>
                            ) : formData.name}
                            <a href="#" onClick={(e) => { e.preventDefault(); toggleBookmark(submittal) }} className={`ml-auto mr-2 ${bookmarks.find(({ id }) => id === submittal.id) ? 'text-bookmark' : 'text-secondary'}`}  ><Bookmark className="feather" /></a>
                            <a href="#" onClick={() => setEditMode(true)} className="text-secondary  mr-2"  ><Edit2 className="feather" /></a>
                            <a href="#" className="text-secondary" data-toggle="modal" data-target={"#" + DELETE_MODAL_ID}><Trash2 className="feather " /></a>
                        </div>
                        
                        
                        <div className="dropdown my-4">
                            <button disabled={submittal.entities.length === ENTITY_TYPES.length} className="btn btn-secondary dropdown-toggle w-100" type="button" id="entitySelectionDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Add an Entity
                            </button>
                            <div className="dropdown-menu" aria-labelledby="entitySelectionDropdown">
                                { ENTITY_TYPES.filter(entity => !submittal.entities.some(e => e.type === entity)).map((entity, i) => (
                                    <a key={i} onClick={ (e) => addEntity(entity, e) } className="dropdown-item" href="#">{entity}</a>
                                )) }
                            </div>
                        </div>
                         
                        { submittal.entities.length === 0 ? 
                            <h6 className="text-secondary my-4"> No assigned entities </h6>
                        : submittal.entities.map((entity, i) => (
                            <div key={i} className="form-group w-100 m-0">
                                <div className="input-group w-100 m-0">
                                    <div className="input-group-prepend w-25">
                                        <div className="input-group-text w-100">
                                            {entity.type}
                                        </div>
                                    </div>
                                    {!isLoaded(firms) || !isLoaded(projects) || !isLoaded(jurisdictions) ? '' :
                                        <div className="d-flex align-items-center">
                                            <Typeahead
                                                name={entity.type}
                                                customClasses={{
                                                    input: "form-control w-100",
                                                    typeahead: "w-100"
                                                }}
                                                value={entity.type === 'project' && projects.find(p => p.id === entity.id) ? projects.find(p => p.id === entity.id).name :
                                                              entity.type === 'jurisdiction' && jurisdictions.find(j => j.id === entity.id) ? jurisdictions.find(j => j.id === entity.id).name :
                                                              firms.find(f => f.id === entity.id) ? firms.find(f => f.id === entity.id).name : 
                                                              undefined}
                                                options={entity.type === 'project' ? projects : entity.type === 'jurisdiction' ? jurisdictions : firms}
                                                maxVisible={3}
                                                filterOption={(inputValue, option) => {
                                                    return !option.isArchived && option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                                }}
                                                displayOption={(option) => option.name}
                                                onOptionSelected={(option) => selectEntity(entity.type, option.id)}
                                                inputDisplayOption={(option) => option.name}
                                                formInputOption={(option) => option.name}
                                            />
                                            <button className="btn btn-secondary" onClick={(e) => removeEntity(entity.type, e)}>X</button>
                                        </div>
                                    }

                                </div>
                            </div>
                        ))}
                       
                        {editMode ? (
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary mr-2">{isSubmitting ? "Saving..." : "Save Changes"}</button>
                                <button type="button" onClick={() => {
                                    setFormData(submittal);
                                    setEditMode(false);
                                }} className="btn btn-secondary">Cancel</button>
                            </div>
                        ) : null}

                        <button disabled={submittal.entities.length === 0} type="button" data-toggle="modal" data-target={"#" + PACKET_GENERATOR_MODAL_ID} className='btn btn-outline-secondary w-100 mt-2'>Build a Packet</button>
                        <button disabled={submittal.entities.length === 0} type="button" data-toggle="modal" data-target={"#" + LABEL_GENERATOR_MODAL_ID} className='btn btn-outline-secondary w-100 mt-2'>Purchase a Shipping Label</button>
                        <button disabled={submittal.entities.length === 0} type="button" data-toggle="modal" data-target={"#" + DOCUMENT_REQUEST_MODAL_ID} className='btn btn-outline-secondary w-100 mt-2'>Request Documents</button>

                        <div className="form-group">
                            {error ? <div className="invalid-feedback">{error}</div> : null}
                        </div>
                    </form>

                </div>

            </div>
            <ActionModal
                modalId={DELETE_MODAL_ID}
                action={() => deleteSubmittal(submittal)}
                title={submittal.name}
                message="Are you sure you want to delete this submittal?"
                actionText="Delete" />
            <PacketGeneratorModal
                modalId={PACKET_GENERATOR_MODAL_ID}
                title={submittal.name}
                submittal={submittal}
                updateSubmittal={updateSubmittal}
                action={(newPackets) => savePackets(newPackets)}
                actionText="Save Packets" />
        </div>
    )

export default compose(
    firestoreConnect([
        { collection: 'jurisdictions', orderBy: ['createdAt'] },
        { collection: 'firms', orderBy: ['createdAt'] },
        { collection: 'projects', orderBy: ['createdAt'] },
    ]),
    withFormData('submittal'),
    withIsSubmitting,
    withError,
    withValidationErrors,
    connect(
        ({ bookmarks, firestore }) => ({
            bookmarks,
            projects: firestore.ordered.projects,
            jurisdictions: firestore.ordered.jurisdictions,
            firms: firestore.ordered.firms
        }),
        (dispatch) => ({
            toggleBookmark: (submittal) => dispatch({ type: "TOGGLE_BOOKMARK", submittal })
        })
    ),
    withState('editMode', 'setEditMode', ({ editMode }) => editMode),
    withHandlers({
        onSubmit: ({
            formData,
            setValidationErrors,
            setIsSubmitting,
            setEditMode,
            setError,
            updateSubmittal,
            submittal
        }) => event => {
            event.preventDefault();
            // validate however
            if (formData.name.length === 0) {
                return setValidationErrors({ name: 'Name is required' });
            }
            setValidationErrors({});
            setIsSubmitting(true);

            let updates = { ...formData }

            updateSubmittal(submittal, updates).then(() => {
                setEditMode(false);
                setIsSubmitting(false);
                setError(null);
            });

        },
        addEntity: ({submittal, updateSubmittal}) => (entityType, e) => {
            e.preventDefault()
            console.log('hello')
            if (submittal.entities.some(entity => entity.type === entityType)) {
                return;
            } 
            console.log('hi')
            let newEntities = submittal.entities.concat({
                type: entityType,
                id: null
            })

            let updates = {
                entities: newEntities
            }
            console.log(updates)
            updateSubmittal(submittal, updates)
        },
        removeEntity: ({submittal, updateSubmittal}) => (entityType, e) => {
            e.preventDefault();
            let newEntities = submittal.entities.filter(entity => entity.type !== entityType)
            let updates = {
                entities: newEntities
            }
            updateSubmittal(submittal, updates)
        },
        selectEntity: ({submittal, updateSubmittal}) => (entityType, id) => {
            let newEntities = submittal.entities.map(entity => {
                if (entity.type === entityType) {
                    return {
                        ...entity,
                        id
                    }
                }
                return entity;
            })
            let updates = {
                entities: newEntities
            }
            updateSubmittal(submittal, updates)
        },
        savePackets: props => newPackets => {

        }
    })
)(Submittal);