import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map, Phone, Mail } from 'react-feather';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Firm from './Firm';

const NEW_FIRM_NAME = 'New Firm';
const COLOR_MAP = {
    contractor: "primary",
    owner: "dark",
    architect: "light",
    engineer: "warning",
    applicant: "success"
}

const enhance = compose(
    firestoreConnect([
        { collection: 'firms', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            firms: firestore.ordered.firms,
        })
    ),
    withRouter,
    withState('filter', 'setFilter', ''),
    withHandlers({
        addFirm: props => () => {
            props.firestore.add('firms', {
                name: NEW_FIRM_NAME,
                street: '',
                city: '',
                state: '',
                zip: '',
                email: '',
                phone: '',
                type: '',
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }).then(({ id }) => {
                props.history.push(`/firms/${id}`)
            })
        },
        updateFirm: props => (firm, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'firms', doc: firm.id }, updates)
        },
        deleteFirm: props => (firm) => {
            props.history.push('/firms');
            return props.firestore.update({ collection: 'firms', doc: firm.id }, { isArchived: true });
        },
        filterFirms: props => () => {
            return props.firms.filter((firm) => {
                console.log(firm)
                var keys = Object.keys(firm);
                for (let i = 0; i < keys.length; i++) {
                    let value = String(firm[keys[i]]).toLowerCase();
                    if (value.indexOf(props.filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const Firms = ({ match, firms, addFirm, deleteFirm, updateFirm, filter, setFilter, filterFirms }) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Firms</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={addFirm}>Add Firm or Applicant</button>            
                </div>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
                    <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                </div>
                {
                    !isLoaded(firms)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(firms)
                            ? 'No firms to show'
                            : filterFirms().map((firm) => (
                                !firm.isArchived ? <NavLink exact to={`${match.path}/${firm.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={firm.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{firm.name}</h5>
                                        {firm.type ? <span className={`px-3 py-1 badge badge-pill badge-${COLOR_MAP[firm.type]}`}>{firm.type}</span> : null}
                                    </div>
                                    <div className="row no-gutters justify-content-start align-items-start">
                                        <span className="col-12">
                                            <div className="d-flex align-items-start">
                                                <span><Map className="feather mr-2" style={{ marginTop: "0.16rem" }} />{firm.street}</span>
                                                <span className="ml-3"><Phone className="feather mr-2" style={{ marginTop: "0.16rem" }} />{firm.phone}</span>
                                                <span className="ml-4"><Mail className="feather mr-2" style={{ marginTop: "0.16rem" }} />{firm.email}</span>
                                            </div>
                                        </span>
                                    </div>
                                  
                                </NavLink> : null
                            ))
                }
            </div>

            {
                !isLoaded(firms)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let firm = firms.find(firm => firm.id === match.params.id);
                        return <Firm key={firm ? firm.id : 'nofirmfound'}
                            firm={firm}
                            deleteFirm={deleteFirm}
                            updateFirm={updateFirm}
                            editMode={firm ? (firm.name === NEW_FIRM_NAME ? true : false) : false} />
                    }} />
            }


        </div>
    </div>
)

export default enhance(Firms)
