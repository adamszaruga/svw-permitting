import React from 'react';
import { compose } from 'recompose';
import { Box } from 'react-feather';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'

const enhance = compose(
    connect(
        ({bookmarks}) => ({ bookmarks }),
        (dispatch) => ({
            toggleBookmark: (project) => dispatch({ type: "TOGGLE_BOOKMARK", project })
        })
    )
)

const Bookmarks = ({
    bookmarks,
    toggleBookmark
}) => (
    <ul className="nav flex-column mb-2">
        {bookmarks.map(bookmark => (
            <li className="nav-item" key={bookmark.id}>
                <Link className="nav-link" to={`/projects/${bookmark.id}`}>
                    <Box className="feather" />
                    {bookmark.name}
                    <button type="button" className="close" aria-label="Close" onClick={()=>toggleBookmark(bookmark)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </Link>
            </li>
        ))}
    </ul>
)



export default enhance(Bookmarks);
