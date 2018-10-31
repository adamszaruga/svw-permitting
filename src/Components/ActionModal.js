import React from 'react';

let ActionModal = ({modalId, action, title, message, actionText}) => (
    <div className="modal fade" id={modalId} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button onClick={action} data-dismiss="modal" type="button" className="btn btn-primary">{actionText}</button>
                </div>
            </div>
        </div>
    </div>
)

export default ActionModal;