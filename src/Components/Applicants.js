import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import { withRouter, NavLink, Route } from 'react-router-dom';
import { Users, Briefcase, Map, Phone, Mail } from 'react-feather';
import { withHandlers, withState } from 'recompose';
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import Applicant from './Applicant';

const NEW_APPLICANT_NAME = 'New Applicant';

const enhance = compose(
    firestoreConnect([
        { collection: 'applicants', orderBy: ['createdAt'] }
    ]),
    connect(
        ({ firestore }) => ({
            applicants: firestore.ordered.applicants,
        })
    ),
    withRouter,
    withState('filter', 'setFilter', ''),
    withHandlers({
        addApplicant: props => () => {
            props.firestore.add('applicants', {
                name: NEW_APPLICANT_NAME,
                street: '',
                city: '',
                state: '',
                zip: '',
                email: '',
                phone: '',
                company: '',
                createdAt: props.firestore.FieldValue.serverTimestamp()
            }).then(({ id }) => {
                props.history.push(`/applicants/${id}`)
            })
        },
        updateApplicant: props => (applicant, updates) => {
            delete updates.id;
            return props.firestore.update({ collection: 'applicants', doc: applicant.id }, updates)
        },
        deleteApplicant: props => (applicant) => {
            props.history.push('/applicants');
            return props.firestore.update({ collection: 'applicants', doc: applicant.id }, { isArchived: true });
        },
        filterApplicants: props => () => {
            return props.applicants.filter((applicant) => {
                var keys = Object.keys(applicant);
                for (let i = 0; i < keys.length; i++) {
                    let value = String(applicant[keys[i]]).toLowerCase();
                    if (value.indexOf(props.filter) > -1) {
                        return true;
                    }
                }
                return false;
            })
        }
    }),
)

const Applicants = ({ match, applicants, addApplicant, deleteApplicant, updateApplicant, filter, setFilter, filterApplicants }) => (
    <div>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Applicants</h1>
            <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={addApplicant}>Add Applicant</button>
                    <button className="btn btn-sm btn-outline-secondary">Import</button>
                </div>
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle">
                    <span data-feather="calendar"></span>
                    This week
                </button>
            </div>
        </div>
        <div className="d-flex data-table">
            <div className="list-group list-group-flush w-100">
                <div className="list-group-item text-light" style={{ backgroundColor: "#4C5256" }}>
                    <input onInput={(e) => setFilter(e.target.value.toLowerCase())} className="form-control form-control-dark w-100" type="text" placeholder="Quick Search" aria-label="Search" />
                </div>
                {
                    !isLoaded(applicants)
                        ? (<div className="lds-default mx-auto my-5"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>)
                        : isEmpty(applicants)
                            ? 'No applicants to show'
                            : filterApplicants().map((applicant) => (
                                !applicant.isArchived ? <NavLink exact to={`${match.path}/${applicant.id}`} className="list-group-item list-group-item-action flex-column align-items-start" key={applicant.id}>
                                    <div className="d-flex w-100 justify-content-between align-items-baseline">
                                        <h5>{applicant.name}</h5>
                                    </div>
                                    <div className="row no-gutters justify-content-start align-items-start">
                                        <span className="col-12">
                                            <div className="d-flex align-items-start">
                                                <span><Map className="feather mr-2" style={{ marginTop: "0.16rem" }} />{applicant.street}</span>
                                                <span className="ml-3"><Phone className="feather mr-2" style={{ marginTop: "0.16rem" }} />{applicant.phone}</span>
                                                <span className="ml-4"><Mail className="feather mr-2" style={{ marginTop: "0.16rem" }} />{applicant.email}</span>
                                            </div>
                                        </span>
                                    </div>
                                    

                                </NavLink> : null
                            ))
                }
            </div>

            {
                !isLoaded(applicants)
                    ? ''
                    : <Route exact path={`${match.path}/:id`} render={({ match }) => {
                        let applicant = applicants.find(applicant => applicant.id === match.params.id);
                        return <Applicant key={applicant ? applicant.id : 'noapplicantfound'}
                            applicant={applicant}
                            deleteApplicant={deleteApplicant}
                            updateApplicant={updateApplicant}
                            editMode={applicant ? (applicant.name === NEW_APPLICANT_NAME ? true : false) : false} />
                    }} />
            }


        </div>
    </div>
)

export default enhance(Applicants)
