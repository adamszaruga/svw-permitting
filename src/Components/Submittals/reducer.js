const defaultState = {
    sectionOrder: [
        "jurisdiction",
        "project",
        "contacts",
        "disclaimer",
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
    applicantExtras: {},
    contractorExtras: {},
    ownerExtras: {},
    architectExtras: {},
    contacts: {
        applicant: {
            id: null,
            name: null,
            company: null,
            title: null,
            street: null,
            city: null,
            state: null,
            zip: null,
            phone: null,
            email: null,
            isLicenseHolder: false
        },
        contractor: {
            id: null,
            name: null,
            company: null,
            street: null,
            city: null,
            state: null,
            zip: null,
            phone: null,
            email: null,
            licenseNumber: null,
            licenseExpiration: null
        }
    },
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
        contacts: {
            applicant: {}
        }
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
    if (action.type === 'LOAD_CONTACT') {

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