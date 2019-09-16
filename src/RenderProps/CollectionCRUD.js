import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map } from 'react-feather';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'


// TODO - This is currently implemented to only allow CRUD on the first provided collection. 
//        Make it iterate through collections and build CRUD methods for all the collections

const enhance = compose(
    firestoreConnect(
        ({collections}) => collections.map((collection) => ({
            collection, orderBy: ['createdAt'] 
        }))
    ),
    connect(
        ({ firestore }, { collections }) => collections.reduce((acc, collection)=> ({...acc, [collection]: firestore.ordered[collection]}), {})
    ),
    withRouter,
    withState('filter', 'setFilter', ''),
    withState('includeArchived', 'setIncludeArchived', false),
    withHandlers({
        addItem: ({
            firestore,
            collections,
            itemDefaults,
            history
        }) => () => {
            let now = new Date();
            firestore.add(collections[0], {
                name: `New ${collections[0].slice(0,-1)}`,
                createdAt: firestore.FieldValue.serverTimestamp(),
                ...itemDefaults
            }).then(({ id }) => {
                history.push(`/${collections[0]}/${id}`)
            })
        },
        updateItem: ({ 
            firestore,
            collections 
        }) => (item, updates) => {
            delete updates.id;
            return firestore.update({ collection: collections[0], doc: item.id }, updates)
        },
        deleteItem: ({
            firestore,
            collections,
            history
        }) => (item) => {
            history.push(`/${collections[0]}`);
            return firestore.update({ collection: collections[0], doc: item.id }, { isArchived: true });
        },
        filterItems: props => () => {
            let { collections, filter } = props;
            let items = props[collections[0]];

            return items.filter((item) => {
                var keys = Object.keys(item);
                for (let i = 0; i < keys.length; i++) {
                    let value = String(item[keys[i]]).toLowerCase();
                    if (value.indexOf(filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const CollectionCRUD = props => {
    let { 
        match, 
        location, 
        collections, 
        addItem, 
        deleteItem, 
        updateItem, 
        filter, 
        setFilter, 
        filterItems,
        renderTopRight,
        renderMain,
        renderItem,
        itemDefaults,
        includeArchived,
        setIncludeArchived
    } = props;

    let primaryCollectionName = collections.length > 0 ? collections[0] : 'items'
    let capitalPlural = primaryCollectionName[0].toUpperCase() + primaryCollectionName.slice(1);
    let lowerPlural = primaryCollectionName;
    let capitalSingular = capitalPlural.slice(0,-1);
    let lowerSingular = lowerPlural.slice(0, -1)
    return (
       <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">{capitalPlural}</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-0">
                    { itemDefaults ? <button className="btn btn-sm btn-outline-primary" onClick={addItem}>Add {capitalSingular}</button> : null }
                </div>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
                    <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                    <div className="form-check">
                        <input onChange={e => setIncludeArchived(!includeArchived)} value={includeArchived} className="form-check-input" type="checkbox" value="" id="archiveCheck"/> 
                        <label className="form-check-label" htmlFor="archiveCheck">
                            Include archived {lowerPlural}
                        </label>
                    </div>
                </div>
                {
                    !collections.reduce((acc, collection) => acc && isLoaded(props[collection]), true)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(props[collections[0]])
                            ? `No ${lowerPlural} to show`
                            : filterItems().map((item) => (
                                !item.isArchived || includeArchived ? <NavLink exact to={`${match.path}/${item.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={item.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{item.name}</h5>
                                        { renderTopRight(item) }
                                    </div>
                                    <div>
                                        { renderMain(item) }
                                    </div>
                                </NavLink> : null
                            ))
                }
            </div>
            {
                !collections.reduce((acc, collection) => acc && isLoaded(props[collection]), true)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let primaryCollection = props[collections[0]];
                        let item = primaryCollection.find(item => item.id === match.params.id);
                        return renderItem(item, deleteItem, updateItem) 
                    }} />
            }
        </div>
    </div>
    )
}

export default enhance(CollectionCRUD)