import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Document from './Document';

const NEW_DOCUMENT_NAME = 'New Document'

const enhance = compose(
    firestoreConnect([
        { collection: 'documents', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            documents: firestore.ordered.documents,
        })
    ),
    withRouter,
    withState('filter', 'setFilter', ''),
    withHandlers({
        addDocument: props => () => {
            props.firestore.add('documents', {
                name: NEW_DOCUMENT_NAME,
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }).then(({ id }) => {
                props.history.push(`/documents/${id}`)
            })
        },
        updateDocument: props => (document, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'documents', doc: document.id }, updates)
        },
        deleteDocument: props => (document) => {
            props.history.push('/documents');
            return props.firestore.update({ collection: 'documents', doc: document.id }, { isArchived: true });
        },
        filterDocuments: props => () => {
            return props.documents.filter((document) => {
                var keys = Object.keys(document);
                for (let i = 0; i < keys.length; i++) {
                    let value = String(document[keys[i]]).toLowerCase();
                    if (value.indexOf(props.filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const Documents = ({ match, location, documents, addDocument, deleteDocument, updateDocument, filter, setFilter, filterDocuments }) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Documents</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-0">
                    <button className="btn btn-sm btn-outline-primary" onClick={addDocument}>Add Document</button>
                </div>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
                    <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                </div>
                {
                    !isLoaded(documents)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(documents)
                            ? 'No documents to show'
                            : filterDocuments().map((document) => (
                                !document.isArchived ? <NavLink exact to={`${match.path}/${document.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={document.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{document.name}</h5>
                                    </div>
                                </NavLink> : null
                            ))
                }
            </div>
            {
                !isLoaded(documents)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let document = documents.find(document => document.id === match.params.id);
                        return <Document key={document ? document.id : 'nodocumentfound'}
                            document={document}
                            deleteDocument={deleteDocument}
                            updateDocument={updateDocument}
                            editMode={document ? (document.name === NEW_DOCUMENT_NAME ? true : false) : false} />
                    }} />
            }

        </div>
        
    </div>
)

export default enhance(Documents)
