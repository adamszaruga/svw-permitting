import React from 'react';
import { Inbox, Trash2, Edit2, Bookmark } from 'react-feather';
import { compose, withHandlers, withState, withProps } from 'recompose';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import { connect } from 'react-redux';
import ActionModal from './ActionModal';
import FieldMapModal from './FieldMapModal';
import { Typeahead } from 'react-typeahead'
import { firestoreConnect, firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'

let DELETE_MODAL_ID = "deleteModal";
let FIELD_MAP_MODAL_ID = "mapFieldsModal";

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
    saveMappings,
    bookmarks,
    toggleBookmark,
    jurisdictions,
    firms,
    formRef,
    handleFileUpload
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
                            <label>Jurisdiction</label>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input 
                                            type="checkbox" 
                                            value={formData.isJurisdictionDoc}
                                            checked={formData.isJurisdictionDoc}
                                            disabled={!editMode}
                                            id="isJurisdictionDoc"
                                            name="isJurisdictionDoc"
                                            onChange={onChange}
                                             />
                                    </div>
                                </div>
                                {!isLoaded(jurisdictions) ? '' :
                                    <Typeahead
                                        name="jurisdictionId"
                                        customClasses={{
                                            input: "form-control",
                                        }}
                                        value={formData.jurisdictionId ? jurisdictions.find(({id}) => id === formData.jurisdictionId).name : null}
                                        disabled={!editMode}
                                        options={jurisdictions}
                                        maxVisible={3}
                                        filterOption={(inputValue, option) => {
                                            return !option.isArchived && option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                        }}
                                        displayOption={(option) => option.name}
                                        onOptionSelected={(option) => setFormData({ ...formData, jurisdictionId: option.id })}
                                    />
                                }
                                
                            </div>
                            {errors.street ? <div className="invalid-feedback">{errors.street}</div> : null}
                        </div>
                        <div className="form-group">
                            <label>Firm</label>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            type="checkbox"
                                            value={formData.isFirmDoc}
                                            checked={formData.isFirmDoc}
                                            disabled={!editMode}
                                            id="isFirmDoc"
                                            name="isFirmDoc"
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                                {!isLoaded(firms) ? '' :
                                    <Typeahead
                                        name="firmId"
                                        customClasses={{
                                            input: "form-control",
                                        }}
                                        value={formData.firmId ? firms.find(({ id }) => id === formData.firmId).name : null}
                                        disabled={!editMode}
                                        options={firms}
                                        maxVisible={3}
                                        filterOption={(inputValue, option) => {
                                            return !option.isArchived && option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                        }}
                                        displayOption={(option) => option.name}
                                        onOptionSelected={(option) => setFormData({ ...formData, firmId: option.id })}
                                    />
                                }

                            </div>
                            {errors.street ? <div className="invalid-feedback">{errors.street}</div> : null}
                        </div>
                        <div className="form-group">
                            <label>General</label>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <div className="input-group-text">
                                        <input
                                            type="checkbox"
                                            value={formData.isGeneralDoc}
                                            checked={formData.isGeneralDoc}
                                            disabled={!editMode}
                                            id="isGeneralDoc"
                                            name="isGeneralDoc"
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
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
                        <div className="custom-file">
                            <input ref={formRef} onChange={(e) => handleFileUpload(e)} type="file" className="custom-file-input" id="customFile" />
                            <label className="custom-file-label" htmlFor="customFile">{formData.fileName ? formData.fileName : "No file uploaded"}</label>
                        </div>
                        <button disabled={!formData.fileName} type="button" data-toggle="modal" data-target={"#" + FIELD_MAP_MODAL_ID} className='btn btn-outline-secondary w-100 mt-2'>Map Fields</button>

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
            <FieldMapModal
                modalId={FIELD_MAP_MODAL_ID}
                title={document.name}
                document={document}
                action={(newMappings) => saveMappings(newMappings)}
                actionText="Save Mappings" />
        </div>
    )

export default compose(
    firebaseConnect(),
    firestoreConnect([
        { collection: 'jurisdictions', orderBy: ['createdAt'] },
        { collection: 'firms', orderBy: ['createdAt'] }
    ]),
    withFormData('document'),
    withIsSubmitting,
    withError,
    withValidationErrors,
    withProps(() => ({
        formRef: React.createRef(),
        pageRef: React.createRef()
    })),
    connect(
        ({ bookmarks, firestore }) => ({ 
            bookmarks,
            jurisdictions: firestore.ordered.jurisdictions,
            firms: firestore.ordered.firms
        }),
        (dispatch) => ({
            toggleBookmark: (document) => dispatch({ type: "TOGGLE_BOOKMARK", document })
        })
    ),
    withState('editMode', 'setEditMode', ({ editMode }) => editMode),
    withState('parsedFields', 'setParsedFields', null),
    withState('fileId', 'setFileId', null),
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
        handleFileUpload: ({ firebase, firestore, formRef, setParsedFields, setFileId, document, updateDocument, formData, setFormData }) => e => {
            let file = formRef.current.files[0];
            if (file) {
                firebase.uploadFile('forms', file, undefined, { name: `formUpload${Date.now()}.pdf` }).then(({
                    uploadTaskSnapshot: {
                        metadata: {
                            bucket,
                            cacheControl,
                            contentDisposition,
                            contentEncoding,
                            contentLanguage,
                            contentType,
                            customMetadata,
                            fullPath,
                            generation,
                            md5Hash,
                            metageneration,
                            name: fileName,
                            size,
                            timeCreated,
                            type
                        }
                    }
                }) => {
               
                    updateDocument(document, { fileName, size, fullPath, timeCreated }).then(()=>setFormData({...formData, fileName}));
                    // console.log(fileId)
                    // let doc = firestore.collection('forms').doc(fileId);

                    // let stopListening = doc.onSnapshot(docSnapshot => {
                    //     console.dir(docSnapshot);
                    //     let data = docSnapshot.data();

                    //     if (data) {
                    //         console.dir(data)
                    //         setFileId(fileId);
                    //         setParsedFields(data.parsedFields);
                    //         stopListening();
                    //     }
                    // }, err => {
                    //     console.log(`Encountered error: ${err}`);
                    // });
                }).catch(err => {
                    console.log(err);
                });


            }
        },
        saveMappings: ({document, updateDocument}) => newMappings => {
            updateDocument(document, { fieldMappings: newMappings })
        }
    })
)(Document);