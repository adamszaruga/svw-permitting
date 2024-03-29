import { createStore, compose } from 'redux'
import rootReducer from './reducer'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore' // make sure you add this for firestore
import 'firebase/storage'
import 'firebase/functions' // <- needed if using httpsCallable

import { reactReduxFirebase } from 'react-redux-firebase'
import { reduxFirestore } from 'redux-firestore'

const fbConfig = {
    apiKey: "AIzaSyDGhLlToCCJeYeh92iefsNyGE-dfkHCr5k",
    authDomain: "svw-permitting.firebaseapp.com",
    databaseURL: "https://svw-permitting.firebaseio.com",
    projectId: "svw-permitting",
    storageBucket: "svw-permitting.appspot.com",
    messagingSenderId: "695668797889"
};


export default function configureStore(initialState, history) {
    // Initialize Firebase instance
    firebase.initializeApp(fbConfig)
    // Initialize Firestore with timeshot settings
    firebase.firestore().settings({ timestampsInSnapshots: true })
    // Initialize Functions for httpsCallable
    let functions = firebase.functions();

    const createStoreWithMiddleware = compose(
        reactReduxFirebase(firebase,
            {
                userProfile: 'users',
                useFirestoreForProfile: true, // Store in Firestore instead of Real Time DB
                enableLogging: false
            }
        ),
        reduxFirestore(firebase),
        typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )(createStore)

    const store = createStoreWithMiddleware(rootReducer)

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducer', () => {
            const nextRootReducer = require('./reducer')
            store.replaceReducer(nextRootReducer)
        })
    }

    return store
}