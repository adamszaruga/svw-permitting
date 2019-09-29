import React from 'react';
import { compose, withHandlers, withProps, withState, withReducer } from 'recompose';
import { firestoreConnect } from 'react-redux-firebase';
import PDFViewer from './PDFViewer'

const NORMALIZED_FIELDS = [
    'project:legaldescription',
    'project:cost',
    'project:scope',
    'project:name',
    'project:street',
    'project:city',
    'project:state',
    'project:zip',
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

const MAPPING_TREE = NORMALIZED_FIELDS.reduce((acc, item) => {
    let parts = item.split(':');

    if (!acc[parts[0]]) acc[parts[0]] = []
    acc[parts[0]].push(parts[1])

    return acc;

}, {});

const enhance = compose(
    firestoreConnect([]),
    withReducer('mappingGrid', 'gridDispatch', (state, action) => {
        if (action.type === "CHANGE_COLUMN_BY_ARROW") { // LEFT AND RIGHT
            return {...state, activeColumn: (state.activeColumn+1)%2}
        } else if (action.type === "CHANGE_SLUG_BY_ARROW") { // UP AND DOWN
            if (!state.annotation || !state.mappings[state.annotation.fieldName]) {
                return state;
            }
            if (state.activeColumn === 0) {
                let newSelection = Math.max(0, Math.min(state.colSelections[0] + action.direction, state.colOptions[0].length-1))
                let newCol1 = MAPPING_TREE[Object.keys(MAPPING_TREE)[newSelection]]
                let newCol1Selection = Math.min(state.colSelections[1], newCol1.length-1)
                let newMappings = {
                    ...state.mappings,
                    [state.annotation.fieldName]: `${state.colOptions[0][state.colSelections[0]]}:${newCol1[newCol1Selection]}`
                }
                return {
                    ...state,
                    colSelections: [newSelection, newCol1Selection],
                    colOptions: [state.colOptions[0], newCol1],
                    mappings: newMappings
                }
            } else if (state.activeColumn === 1) {
                let newSelection = Math.max(0, Math.min(state.colSelections[1] + action.direction, state.colOptions[1].length-1))
                let newMappings = {
                    ...state.mappings,
                    [state.annotation.fieldName]: `${state.colOptions[0][state.colSelections[0]]}:${state.colOptions[1][newSelection]}`
                }
                return {
                    ...state,
                    colSelections: [state.colSelections[0], newSelection],
                    mappings: newMappings
                }
            }
        } else if (action.type === "SELECT_ANNOTATION") {
            let { annotation } = action;
            let currentMapping = state.mappings[annotation.fieldName];
            if (currentMapping) {
                var newCol0Selection = state.colOptions[0].indexOf(currentMapping.split(':')[0])
                var newCol1Options = MAPPING_TREE[currentMapping.split(':')[0]];
                var newCol1Selection = newCol1Options.indexOf(currentMapping.split(':')[1])
            }
            
            return {
                ...state,
                annotation,
                colSelections: currentMapping ? [newCol0Selection, newCol1Selection] : state.colSelections,
                colOptions: currentMapping ? [state.colOptions[0], newCol1Options] : state.colOptions
            }
        } else if (action.type === "TOGGLE_MAPPING") {
            if (!state.annotation) {
                return state;
            }
            let newMappings = {
                ...state.mappings,
                [state.annotation.fieldName]: state.mappings[state.annotation.fieldName] ? undefined : `${state.colOptions[0][state.colSelections[0]]}:${state.colOptions[1][state.colSelections[1]]}`
            }
            return {
                ...state,
                mappings: newMappings
            }
        }
        return state
    }, ({document}) =>({
        mappings: document.fieldMappings || {}, activeColumn: 0, colSelections: [0,0], colOptions: [
        Object.keys(MAPPING_TREE),
        MAPPING_TREE['project']
    ]})),
    withState('downloadUrl', 'setDownloadUrl', null),
    withState('annotations', 'setAnnotations', { }),
    withHandlers({
        handleKeyDown: ({ gridDispatch }) => e => {
            if (e.keyCode === 37 || e.keyCode === 39) { // LEFT AND RIGHT ARROWS
                e.preventDefault()
                gridDispatch({type: "CHANGE_COLUMN_BY_ARROW"})
            }
            if (e.keyCode === 38 ) { // UP ARROW
                e.preventDefault()
                gridDispatch({ type: "CHANGE_SLUG_BY_ARROW", direction: -1 })
            }
            if (e.keyCode === 40) { // DOWN ARROW
                e.preventDefault()
                gridDispatch({ type: "CHANGE_SLUG_BY_ARROW", direction: 1 })
            }
            if (e.keyCode === 32) { // SPACE BAR
                // make it save the mapping for this field only
                gridDispatch({ type: "TOGGLE_MAPPING" })
            }
        },
        downloadDocument: ({firebase, setDownloadUrl, document}) => e => {
            e.preventDefault();
            e.stopPropagation();
            firebase.storage()
                .ref()
                .child(document.fullPath)
                .getDownloadURL()
                .then(url => setDownloadUrl(url));
        },
        handleInputFocus: ({ annotations, gridDispatch }) => annotationId => {
            if (!annotations) { return }
            let newAnnotation = Object.keys(annotations).flatMap(pageNum => annotations[pageNum]).find(a => a.id === annotationId);
            gridDispatch({ type: "SELECT_ANNOTATION", annotation: newAnnotation })
        },
        handleAnnotationsLoaded: ({ setAnnotations, annotations }) => (newAnnotations, pageNum) => {
            setAnnotations({
                ...annotations,
                [pageNum]: newAnnotations
            });
        },
        done: ({ action, mappingGrid }) => e => {
            action(mappingGrid.mappings);
        }
    })
);

let FieldMapModal = ({ 
    document, 
    modalId, 
    title, 
    actionText, 
    downloadDocument, 
    downloadUrl, 
    handleAnnotationsLoaded,
    handleKeyDown,
    handleInputFocus,
    done,
    mappingGrid
}) => (
    <div className="modal fade" id={modalId} tabIndex="-1" role="dialog">
        <div className="modal-dialog" style={{maxWidth: 1000}} role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body" onKeyDown={handleKeyDown}>
                    { downloadUrl ? '' : <button onClick={e => downloadDocument(e)} className='btn btn-outline-secondary w-100'>Begin mapping {document.name}</button> }
                    <div className="d-flex justify-content-start">
                        <div style={{flex: 1, maxHeight: '500px', overflowY: 'scroll'}}>
                            {downloadUrl ? <PDFViewer 
                                                url={downloadUrl} 
                                                handleInputFocus={handleInputFocus} 
                                                handleAnnotationsLoaded={handleAnnotationsLoaded} /> 
                            : '' }
                        </div>
                        <div>
                            {mappingGrid.annotation ?
                            <div className="mr-2">
                                <h3>{mappingGrid.annotation.fieldName}</h3>
                                <p>Field Type: {mappingGrid.annotation.fieldType}</p>
                                { !mappingGrid.mappings[mappingGrid.annotation.fieldName] ?
                                    <h1>
                                        <span className="badge badge-secondary">
                                            Press space to map
                                        </span>
                                    </h1>
                                      : 
                                    <div>
                                        <h1>
                                            <span className="badge badge-primary">
                                                {`${mappingGrid.mappings[mappingGrid.annotation.fieldName]}`}
                                            </span>
                                        </h1>
                                        <div className="d-flex justify-content-center align-items-start">
                                            <div className="btn-group-vertical">
                                                {mappingGrid.colOptions[0].map((entity, index) => (
                                                    <button key={entity} type="button" className={`btn btn-${mappingGrid.colSelections[0] === index ? '' : 'outline-'}${mappingGrid.activeColumn === 0 ? 'primary' : 'secondary'}`}>{entity}</button>
                                                ))}
                                            </div>
                                            <div className="btn-group-vertical">
                                                {mappingGrid.colOptions[1].map((field, index) => (
                                                    <button key={field} type="button" className={`btn btn-${mappingGrid.colSelections[1] === index ? '' : 'outline-'}${mappingGrid.activeColumn === 1 ? 'primary' : 'secondary'}`}>{field}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                            
                            : downloadUrl ? <h3 className="text-muted mr-5">Select a field</h3> : ''}
                            
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button onClick={e => done(e)} data-dismiss="modal" type="button" className="btn btn-primary">{actionText}</button>
                </div>
            </div>
        </div>
    </div>
)

export default enhance(FieldMapModal);