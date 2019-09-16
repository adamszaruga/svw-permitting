import React from 'react';
import { compose, withHandlers, withProps, withState } from 'recompose';
import { firestoreConnect } from 'react-redux-firebase';
import { withFormData, withIsSubmitting, withError, withValidationErrors } from '../HOC/forms';
import { pdfjs, Document, Page } from 'react-pdf'
import { connect } from 'react-redux';
import 'react-pdf/dist/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

let pageRef = null;

const NORMALIZED_FIELDS = [
    'noc:state',
    'noc:county',
    'project:legal:description',
    'project:street',
    'project:scope',
    'contractor:name',
    'contractor:address',
    'contractor:phone',
    'project:name',
    'project:street',
    'project:city',
    'project:state',
    'project:zip',
    'scope',
    'cost',
    'type',
    'contractor:name',
    'contractor:street',
    'contractor:city',
    'contractor:state',
    'contractor:zip',
    'contractor:phone',
    'contractor:email',
    'contractor:license',
    'contractor:expiration',
    'owner:name',
    'owner:street',
    'owner:city',
    'owner:state',
    'owner:zip',
    'owner:phone',
    'owner:email',
    'applicant:name',
    'applicant:street',
    'applicant:city',
    'applicant:state',
    'applicant:zip',
    'applicant:phone',
    'applicant:email',
    'architect:name',
    'architect:street',
    'architect:city',
    'architect:state',
    'architect:zip',
    'architect:phone',
    'architect:email'
]

const enhance = compose(
    firestoreConnect([]),
    withProps(() => ({
        formRef: React.createRef(),
        pageRef: React.createRef()
    })),
    withState('parsedFields', 'setParsedFields', null),
    withState('fileId', 'setFileId', null),
    withState('pages', 'setPages', { total: null, current: 1}),
    withState('currentFormInput', 'setCurrentFormInput', null),
    withState('reactPDFAnnotations', 'setReactPDFAnnotations', null),
    withState('listenersAttached', 'setListenersAttached', false),
    withProps(() => ({
        mappings: {}
    })),
    withFormData('mappings'),
    withHandlers({
        handleFileUpload: ({firebase, firestore, formRef, uploadedFiles, setParsedFields, setFileId}) => e => {
            let file = formRef.current.files[0];
            console.log(file);
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
                            name,
                            size,
                            timeCreated,
                            type
                        }
                    }
                }) => {
                    let fileId = name.split('.')[0];
                    console.log(fileId)
                    // let form = uploadedFiles.find(({id}) => id === fileId);
                    let doc = firestore.collection('forms').doc(fileId);

                    let stopListening = doc.onSnapshot(docSnapshot => {
                        console.dir(docSnapshot);
                        let data = docSnapshot.data();

                        if (data) {
                            console.dir(data)
                            setFileId(fileId);
                            setParsedFields(data.parsedFields);
                            stopListening();
                        }
                    }, err => {
                        console.log(`Encountered error: ${err}`);
                    });
                    // EXTRA - You can maybe add a EXTRA option in each dropdown
                    //         Each EXTRA option will modify the jurisdiction EXTRAS keys
                }).catch(err => {
                    console.log(err);
                    console.log(uploadedFiles)
                });
            
            
            }
        },
        updateMappings: ({formData, fileId, firestore, parsedFields}) => async e => {
            e.preventDefault();
            e.stopPropagation();
            // form data at this points maps the parsedField ID to your normalized field names
            // you need to update the firestore for this form to include the normalized name on each parsedField
            // It should also slice() out the parsedFields that don't map to anything
            let doc = firestore.collection('forms').doc(fileId);
            
            let mappedFields = Object.keys(formData);
            let newParsedFields = parsedFields.filter(({id}) => mappedFields.includes(id))

            newParsedFields.forEach(field => {
                field.mapping = formData[field.id];
            });

            await doc.set({
                parsedFields: newParsedFields
            }, {merge: true});

            console.log("fields mapped!")
        },
        done: ({action, fileId}) => e => {
            action(fileId);
        }
    })
);

let AddFormModal = ({ modalId, title, onChange, formData, actionText, pages, setPages, handleFileUpload, formRef, pageRef, currentFormInput, setCurrentFormInput, reactPDFAnnotations, setReactPDFAnnotations, listenersAttached, setListenersAttached, parsedFields, updateMappings, done }) => (
    <div className="modal fade" id={modalId} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    
                    <div className="custom-file">
                        <input ref={ formRef } onChange={(e)=>handleFileUpload(e)} type="file" className="custom-file-input" id="customFile" />
                        <label className="custom-file-label" htmlFor="customFile">Choose file</label>
                    </div>
                    { currentFormInput ?  
                        <div>Selected Form Field ID: {currentFormInput}</div>
                        : null}
                    { reactPDFAnnotations && currentFormInput ? 
                        <div>
                            <div>Field Name: {reactPDFAnnotations.find(a => a.id === currentFormInput).fieldName}</div>
                            <div>Field Type: {reactPDFAnnotations.find(a => a.id === currentFormInput).fieldType}</div>
                            <div>Field Value: {reactPDFAnnotations.find(a => a.id === currentFormInput).fieldValue}</div>
                            <select className="form-control">
                                <option value="none" key={-100}>none</option>
                                {NORMALIZED_FIELDS.map((mapping, i) => (
                                    <option value={mapping} key={i}>{mapping}</option>
                                ))}
                            </select>
                        </div>
                        : null}
                    {pages.total ? `page ${pages.current} of ${pages.total}` : ''}
                    {pages.total > 1 
                        ?   <div>
                                {pages.current > 1 ? <button onClick={() => setPages({total: pages.total, current: pages.current-1})}> {`<`} </button> : ''}
                                {pages.current < pages.total ? <button onClick={() => setPages({ total: pages.total, current: pages.current + 1 })}> {`>`} </button> : ''}
                            </div> 
                        : ''}
                    { formRef.current && formRef.current.files && formRef.current.files[0] ?
                        <Document
                            file={formRef.current.files[0]}
                            onLoadSuccess={({numPages}) => {
                                console.log('react-pdf loaded the pdf!')
                                setPages({total: numPages, current: 1})
                            }}
                        >
                            <Page 
                                pageNumber={pages.current} 
                                ref={pageRef}
                                inputRef={ref => {
                                    let clickListener = (e) => {
                                        if (e.target.parentNode && e.target.parentNode.dataset && e.target.parentNode.dataset.annotationId) {
                                            setCurrentFormInput(e.target.parentNode.dataset.annotationId)
                                        }
                                    }
                                    if (ref && !listenersAttached) {
                                        ref.addEventListener('click', clickListener)
                                        setListenersAttached(true);
                                    }
                                    
                                }}
                                renderAnnotationLayer={true}
                                renderInteractiveForms={true}
                                onGetAnnotationsSuccess={annotations => {
                                    console.log(annotations);
                                    setReactPDFAnnotations(annotations);
                                }}
                               
                                
                            />
                        </Document>
                    : ''}
                    
                    <form>
                        <button onClick={e => updateMappings(e)} className='btn btn-outline-secondary w-100'>Update Mappings</button>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button onClick={e => done(e)} data-dismiss="modal" type="button" className="btn btn-primary">{actionText}</button>
                </div>
            </div>
        </div>
    </div>
)

export default enhance(AddFormModal);