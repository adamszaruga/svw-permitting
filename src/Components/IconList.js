import React, { Fragment } from 'react';

const IconList = ({
    items
}) => (
    <Fragment>
        { items.map((item, index) => (
            <div key={index} className="d-flex align-items-start ml-2">
                <item.Icon className="feather mr-2" style={{ marginTop: "0.16rem" }} />{item.text}
            </div>
        )) }
    </Fragment>
)

export default IconList;