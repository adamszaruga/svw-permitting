import Joi from 'joi';

const defaultState = {
    sectionOrder: [
        "jurisdiction",
        "project",
        "contacts",
        // "disclaimer",
        "submit"
    ],
    currentSectionIndex: 0,
    jurisdictionExtras: {},
    projectExtras: {
        constructionType: {
            field: 'dropdown',
            options: ['IB', 'IIB', 'IIIB'],
            default: 'IIB'
        }
    },
    schemas: {
        project: Joi.object().options({abortEarly: false}).keys({
            name: Joi.string().min(1).required().error(() => 'Required'),
            street: Joi.string().min(1).required().error(() => 'Required'),
            city: Joi.string().min(1).required().error(() => 'Required'),
            state: Joi.string().min(1).error(() => 'Required'),
            zip: Joi.number().min(1).required().error(() => 'Enter a valid 5 digit Zip Code'),
            scope: Joi.string().min(1).required().error(() => 'Required'),
            cost: Joi.string().min(1).required().error(() => 'Required'),
            projectType: Joi.any().valid(['residential', 'commercial']).error(() => 'Required')
        }).unknown(true),
        contact: Joi.object().options({ abortEarly: false }).keys({
            name: Joi.string().min(1).required().error(() => 'Required'),
            street: Joi.string().min(1).required().error(() => 'Required'),
            city: Joi.string().min(1).required().error(() => 'Required'),
            state: Joi.string().min(1).error(() => 'Required'),
            zip: Joi.number().min(1).required().error(() => 'Enter a valid 5 digit Zip Code'),
            type: Joi.any().valid(['applicant', 'contractor', 'architect', 'engineer', 'owner']).error(() => 'Required')
        }).unknown(true),
    },
    applicantExtras: {},
    contractorExtras: {},
    ownerExtras: {},
    architectExtras: {},
    disclaimer: {
        agreements: [
            {
                name: "generic agreement",
                hasAgreed: false
            }
        ]
    },
    submit: {
        downloadOption: "email"
    },
    payload: {
        jurisdiction: {},
        project: {},
        contacts: {}
    }
}

export default (state = defaultState, action) => {
    
    if (action.type === 'CLEAR') {
        return defaultState;
    }

    if (action.type === 'LOAD') {
        let { initialPayload } = action;
        let { sectionOrder } = state;
        let newSectionIndex = 0;
        for (let i=0; i<sectionOrder.length; i++) {
            let section = [sectionOrder[i]];
            if (!initialPayload[section]){
                newSectionIndex = i;
                break;
            }
            if (i === sectionOrder.length-1) {
                newSectionIndex = i;
            }
        }
        let newState = {
            ...state,
            currentSectionIndex: newSectionIndex,
            payload: {
                ...state.payload,
                ...initialPayload
            }
        }
        return newState;
    }
    if (action.type === 'LOAD_JURISDICTION') {
        let { jurisdiction } = action;
        let newJurisdiction = {
            ...jurisdiction
        }
        let newState = {
            ...state,
            payload: {
                ...state.payload,
                jurisdiction: newJurisdiction
            }
            
        }
        console.log(newState)
        return newState;
    }
    if (action.type === 'LOAD_PROJECT') {
        let { project } = action;
        let newProject = {
            ...project
        }
        let newState = {
            ...state,
            payload: {
                ...state.payload,
                project: newProject
            }

        }
        console.log(newState);
        return newState;
    }
    if (action.type === 'LOAD_CONTACTS') {
        let { contacts } = action;
        let newContacts = {
            ...contacts
        }
        let newState = {
            ...state,
            payload: {
                ...state.payload,
                contacts: newContacts
            }

        }
        console.log(newState);
        return newState;
    }
    if (action.type === 'NEXT') {
        let newState = {
            ...state,
            currentSectionIndex: state.currentSectionIndex + 1
        }
        return newState;
    }

    if (action.type === 'SET_SECTION_INDEX') {
        let newState = {
            ...state,
            currentSectionIndex: action.newIndex
        }
        return newState;
    }
    
    if (action.type === 'SUBMIT') {

    }

    return state;
}