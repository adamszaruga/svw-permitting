const functions = require('firebase-functions');
const admin = require('firebase-admin');
const PDFParser = require('pdf2json');
const path = require('path');
const os = require('os')
const fs = require('fs')
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();



admin.initializeApp();


function pdfParsePromisified(filePath) {
    return new Promise((resolve, reject) => {
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => {
            console.error(errData.parserError)
            reject(errData.parserError)
        });
        pdfParser.on("pdfParser_dataReady", pdfData => {
            resolve({ pdfParser, pdfData });
        });
        pdfParser.loadPDF(filePath);
    }) 
}



exports.parsePDF = functions.storage.object().onFinalize( async ({
    bucket,
    name,
    contentType,
    metageneration
}) => {
    if (!contentType.startsWith('application/pdf')) {
        console.log('This is not a PDF');
        return null;
    }
    if (!name.startsWith('forms')) {
        console.log('This is not in the forms folder')
        return null;
    }

    const fileBucket = storage.bucket(bucket);
    const destination = path.join(os.tmpdir(), name.split('/')[1]);
    await fileBucket.file(name).download({ destination })
    console.log('PDF downloaded locally to', destination);
    let { pdfParser, pdfData } = await pdfParsePromisified(destination);

    let formName = name.split('/')[1].split('.')[0];
    await admin.firestore().collection('forms').doc(formName).set({
        name,
        metageneration,
        parsedFields: pdfParser.getAllFieldsTypes()
    })
    console.log('success! Metadata written to Firestore');

    fs.unlinkSync(destination)
    console.log('PDF destroyed at path', destination);

    return null;

})

exports.generateSubmittal = functions.https.onCall((payload, context) => {
    // This is it!!!
    // payload is the payload from the client side
    // payload.jurisdiction points to the jurisdiction
    // For each form in jurisdiction.submittals.commercial.forms:
    //     1) download the form
    //     2) fill the pdf using the mappings for that form and the payload
    // Generate a cover sheet
    // Combine all sheets
    // EITHER email the filled form
    // OR send the buffer for the form back in the response
    return {
        status: "OK",
        data
    }
})

exports.floridaNOC = functions.https.onRequest((req, res) => {
    res.json({foo:'bar'})
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
