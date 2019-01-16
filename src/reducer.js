import { combineReducers } from 'redux'
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'
import submittalsReducer from './Components/Submittals/reducer';


const rootReducer = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    bookmarks: (state = localStorage.getItem('bookmarks') ? JSON.parse(localStorage.getItem('bookmarks')) : [], action) => {
        if (action.type === 'TOGGLE_BOOKMARK') {
            let { id, name } = action.project;
            let newBookmarks = state.filter(bookmark => bookmark.id !== id);
            if (newBookmarks.length === state.length) newBookmarks.push({ id, name })
            localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
            return newBookmarks;
        }
        return state;
    },
    submittal: submittalsReducer
})

export default rootReducer