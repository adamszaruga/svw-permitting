import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux'
import Jurisdiction from './Jurisdiction';
import Project from './Project';
import Contacts from './Contacts';
import Disclaimer from './Disclaimer';
import Submit from './Submit';


const enhance = compose(
    connect(
        ({ submittal }) => ({
            submittal
        }),
        (dispatch) => ({
            load: (initialPayload)=>dispatch({type: "LOAD", initialPayload})
        })
    )
)


class Submittals extends Component {

    constructor(props) {
        super(props);
        let { initialPayload, load } = props;
        if(initialPayload) load(initialPayload);
    }
    
    render() {
        let { submittal } = this.props;
        return (
            <div className="bg-light p-5">
                {submittal.sectionOrder.map((section, index) => {
                    let { currentSectionIndex } = submittal;

                    // only render the sections so far
                    if (index > currentSectionIndex) {
                        return null;
                    }

                    if (section === "jurisdiction") {
                        return <Jurisdiction key={index} jurisdictionStart={true}
                        />
                    } else if (section === "project") {
                        return <Project key={index} />
                    } else if (section === "contacts") {
                        return <Contacts key={index} />
                    // } else if (section === "disclaimer") {
                    //     return <Disclaimer key={index} />
                    } else if (section === "submit") {
                        return <Submit key={index} />
                    }
                })}
            </div>
        )
    }
}

export default enhance(Submittals)
