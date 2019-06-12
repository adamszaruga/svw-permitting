import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map } from 'react-feather';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Jurisdiction from './Jurisdiction';

const NEW_JURISDICTION_NAME = 'New Jurisdiction';
const COLOR_MAP = {
    review: "info",
    comments: "danger",
    approved: "success",
    cancelled: "dark",
    denied: "danger",
    new: "secondary"
}

const enhance = compose(
    firestoreConnect([
        { collection: 'jurisdictions', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            jurisdictions: firestore.ordered.jurisdictions,
        })
    ),
    withRouter,
    withState('filter', 'setFilter', ''),
    withHandlers({
        addJurisdiction: props => () => {
            let now = new Date();
            props.firestore.add('jurisdictions', {
                name: NEW_JURISDICTION_NAME,
                street: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                email: '',
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }).then(({ id }) => {
                props.history.push(`/jurisdictions/${id}`)
            })
        },
        updateJurisdiction: props => (jurisdiction, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'jurisdictions', doc: jurisdiction.id }, updates)
        },
        deleteJurisdiction: props => (jurisdiction) => {
            props.history.push('/jurisdictions');
            return props.firestore.update({ collection: 'jurisdictions', doc: jurisdiction.id }, { isArchived: true });
        },
        filterJurisdictions: props => () => {
            return props.jurisdictions.filter((jurisdiction) => {
                var keys = Object.keys(jurisdiction);
                for (let i = 0; i < keys.length; i++) {
                    let value = String(jurisdiction[keys[i]]).toLowerCase();
                    if (value.indexOf(props.filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const Jurisdictions = ({ match, location, jurisdictions, addJurisdiction, deleteJurisdiction, updateJurisdiction, filter, setFilter, filterJurisdictions }) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Jurisdictions</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-0">
                    <button className="btn btn-sm btn-outline-primary" onClick={addJurisdiction}>Add Jurisdiction</button>
                </div>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
                    <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                </div>
                {
                    !isLoaded(jurisdictions)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(jurisdictions)
                            ? 'No jurisdictions to show'
                            : filterJurisdictions().map((jurisdiction) => (
                                !jurisdiction.isArchived ? <NavLink exact to={`${match.path}/${jurisdiction.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={jurisdiction.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{jurisdiction.name}</h5>

                                        <div className="d-flex align-items-start ml-auto mr-2">
                                            <Map className="feather mr-2" style={{ marginTop: "0.16rem" }} />{jurisdiction.street}
                                        </div>
                                        <div className="d-flex align-items-start ml-2">
                                            <Users className="feather mr-2" style={{ marginTop: "0.16rem" }} />Adam Szaruga
                                        </div>
                                    </div>
                                </NavLink> : null
                            ))
                }
            </div>

            {
                !isLoaded(jurisdictions)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let jurisdiction = jurisdictions.find(jurisdiction => jurisdiction.id === match.params.id);
                        return <Jurisdiction key={jurisdiction ? jurisdiction.id : 'nojurisdictionfound'}
                            jurisdiction={jurisdiction}
                            deleteJurisdiction={deleteJurisdiction}
                            updateJurisdiction={updateJurisdiction}
                            editMode={jurisdiction ? (jurisdiction.name === NEW_JURISDICTION_NAME ? true : false) : false} />
                    }} />
            }


        </div>
    </div>
)

export default enhance(Jurisdictions)
