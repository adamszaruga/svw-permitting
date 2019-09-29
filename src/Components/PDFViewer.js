import React, { Component } from 'react';
import { compose, onlyUpdateForPropTypes, setPropTypes, withState} from 'recompose';
import PropTypes from 'prop-types';
import { pdfjs, Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


const enhance = compose(
    withState('numPages', 'setNumPages', 0),
    withState('pageAnnotations', 'setPageAnnotations', {}),
    onlyUpdateForPropTypes,
    setPropTypes({
        url: PropTypes.string.isRequired,
        numPages: PropTypes.number.isRequired,
        handleInputFocus: PropTypes.func,
        handleAnnotationsLoaded: PropTypes.func
    })
)

class PDFViewer extends Component {
    
    handleLoadSuccess(numPages) {
        console.log('react-pdf loaded the pdf!')
        this.props.setNumPages(numPages)
    }

   
    setFocusListener(ref) {
        if (!ref) {
            return;
        }
        if (this.listener) {
            ref.removeEventListener(this.listener)
        }
        this.listener = ref.addEventListener('focusin', e => {
            if (e.target.parentNode && e.target.parentNode.dataset && e.target.parentNode.dataset.annotationId) {
                this.props.handleInputFocus(e.target.parentNode.dataset.annotationId)
            }
        })
            
    }

    render() {
        let { 
            url,
            numPages,
            handleAnnotationsLoaded
        } = this.props;
        return (
        <Document
            file={url}
            onLoadSuccess={({ numPages }) =>  this.handleLoadSuccess(numPages)}
            inputRef={ref => this.setFocusListener(ref)}
        >
            {[...Array(numPages)].map((a, index) => (
                <Page
                    key={index}
                    pageNumber={index+1}
                    renderAnnotationLayer={true}
                    renderInteractiveForms={true}
                    onGetAnnotationsSuccess={annotations => handleAnnotationsLoaded(annotations, index)}
                />
            ))}
        </Document>
        )
    }
}


export default enhance(PDFViewer);