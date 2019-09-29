import React from 'react';
import { compose, withHandlers, withProps, withState, withReducer } from 'recompose';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';
import { connect } from 'react-redux'
import { Typeahead } from 'react-typeahead'
import { FileText } from 'react-feather';
import axios from 'axios';

const enhance = compose(
    firestoreConnect([
        { collection: 'documents', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            documents: firestore.ordered.documents
        })
    ),
    withState('deleteIndex', 'setDeleteIndex', undefined),
    withState('documentRemoveIndeces', 'setDocumentRemoveIndeces', [undefined, undefined]),
    withState('typeaheadValues', 'setTypeaheadValues', []),
    withHandlers({
        createPacket: ({submittal, updateSubmittal}) => e => {
            e.preventDefault()
            let newPackets = submittal.packets.concat({})
            updateSubmittal(submittal, { packets: newPackets}).then( () => console.log('packet added'))
        },
        confirmDeletePacket: ({setDeleteIndex}) => packetIndex => {
            setDeleteIndex(packetIndex);
        },
        cancelDeletePacket: ({ setDeleteIndex }) => e => {
            setDeleteIndex(undefined);
        },
        deletePacket: ({updateSubmittal, submittal, deleteIndex, setDeleteIndex}) => e => {
            let newPackets = submittal.packets.filter((packet, i) => i !== deleteIndex)
            updateSubmittal(submittal, { packets: newPackets }).then(() => setDeleteIndex(undefined))
        },
        addDocument: ({submittal, updateSubmittal}) => (document, packetIndex) => {
            let newPackets = submittal.packets.map((packet, i) => {
                if (i === packetIndex) {
                    return {
                        ...packet,
                        [document.id]: {
                            documentId: document.id,
                            documentName: document.name
                        }
                    }
                }
                return packet;
            })
            updateSubmittal(submittal, { packets: newPackets }).then(() => console.log('doc added'))
        },
        confirmRemoveDocument: ({setDocumentRemoveIndeces}) => (indeces) => {
            setDocumentRemoveIndeces(indeces)
        },
        cancelRemoveDocument: ({setDocumentRemoveIndeces}) => e => {
            setDocumentRemoveIndeces([undefined, undefined])
        },
        removeDocument: ({ submittal, updateSubmittal, documentRemoveIndeces, setDocumentRemoveIndeces}) => e => {
            let newPacket = { 
                ...submittal.packets[documentRemoveIndeces[0]]
            }
            delete newPacket[documentRemoveIndeces[1]]

            let newPackets = submittal.packets.map((p, i) => i === documentRemoveIndeces[0] ? newPacket : p);
            
            updateSubmittal(submittal, { packets: newPackets }).then(() => setDocumentRemoveIndeces([undefined, undefined]))
            
        },
        downloadPacket: ({firebase }) => async e => {
            let response = await axios.post('https://us-central1-svw-permitting.cloudfunctions.net/fillDocuments', {
                'contractor:name': 'Alan Derkyshert'
            });
            console.log(response)
        },
        done: ({ action }) => e => {
            action();
        }
    })
);

let PacketGeneratorModal = ({
    modalId,
    title,
    actionText,
    submittal,
    done,
    createPacket,
    confirmDeletePacket,
    cancelDeletePacket,
    deletePacket,
    deleteIndex,
    documents,
    addDocument,
    confirmRemoveDocument,
    cancelRemoveDocument,
    removeDocument,
    documentRemoveIndeces,
    downloadPacket
}) => (
        <div className="modal fade" id={modalId} tabIndex="-1" role="dialog">
            <div className="modal-dialog" style={{ maxWidth: 1000 }} role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul className="list-group list-group-flush">
                            {submittal.packets.map((packet, i) => (
                                <li key={i} className="list-group-item">
                                    <div className='d-flex justify-content-between'>
                                        <h3>Packet #{i+1}</h3>
                                        {
                                            !isLoaded(documents) ? '' :
                                            <div className="mx-2" style={{flexGrow: 1}}>
                                                <Typeahead
                                                    name={'packet' + i}
                                                    customClasses={{
                                                        input: "form-control w-100",
                                                        typeahead: "w-100"
                                                    }}
                                                    placeholder="Add a document"
                                                    options={documents}
                                                    maxVisible={3}
                                                    filterOption={(inputValue, option) => {
                                                        return !option.isArchived && option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                                    }}
                                                    displayOption={(option) => option.name}
                                                    onOptionSelected={(option) => addDocument(option, i)}
                                                    inputDisplayOption={(option) => option.name}
                                                    formInputOption={(option) => option.name}    
                                                />
                                            </div>
                                        }
                                        
                                        {
                                            deleteIndex !== undefined && i === deleteIndex 
                                            ? 
                                            <div className="d-flex align-items-baseline">
                                                <label className="mr-3">are you sure?</label>
                                                <div className="btn-group" role="group" aria-label="Basic example">

                                                    <button onClick={(e) => cancelDeletePacket(e)} type="button" className="btn btn-secondary">Cancel</button>
                                                    <button onClick={(e) => deletePacket(i)} type="button" className="btn btn-danger">Delete</button>
                                                </div>
                                            </div>
                                            : 
                                            <button onClick={(e) => confirmDeletePacket(i)} type="button" className="close" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        }
                                        
                                    </div>
                                    <div className="d-flex mt-1">
                                        {
                                            Object.keys(packet).map((key, j) => (
                                                <div key={j} className="btn-group mr-1">
                                                    <button className="btn btn-outline-primary d-flex align-items-start">
                                                        <FileText className="feather mr-1" />
                                                    {packet[key].documentName}
                                                    </button>

                                                    {
                                                        documentRemoveIndeces[1] !== key ?
                                                            <button onClick={e => confirmRemoveDocument([i, key])} type="button" className="btn btn-outline-secondary" aria-label="Close">
                                                                <span aria-hidden="true">&times;</span>
                                                            </button>
                                                        :
                                                            <div>
                                                                <label className="mr-3">are you sure?</label>
                                                                <div className="btn-group" role="group" aria-label="Basic example">

                                                                    <button onClick={(e) => cancelRemoveDocument()} type="button" className="btn btn-secondary">Cancel</button>
                                                                    <button onClick={(e) => removeDocument()} type="button" className="btn btn-danger">Delete</button>
                                                                </div>
                                                            </div>
                                                    }
                                                   
                                                </div>
                                            ))
                                        }
                                        {
                                            Object.keys(packet).length > 0 ?
                                                <button onClick={(e) => downloadPacket()} className="btn btn-primary d-flex align-items-start">
                                                    <FileText className="feather mr-1" />
                                                    Download Packet
                                                </button>
                                            : ''
                                        }
                                    </div>
                                </li>
                            ))}
                            
                            <li key="-20" className="list-group-item">
                                <button onClick={(e) => createPacket(e)}>Create new Packet</button>
                            </li>
                        </ul>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button onClick={e => done(e)} data-dismiss="modal" type="button" className="btn btn-primary">Done</button>
                    </div>
                </div>
            </div>
        </div>
    )

export default enhance(PacketGeneratorModal);