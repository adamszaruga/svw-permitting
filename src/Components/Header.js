import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <Link className="navbar-brand col-sm-3 col-md-2 mr-0" to="/">
                    Security Vault Works
                </Link>
                <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" />
                <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap">
                        <Link to="signout" className="nav-link">Sign out</Link>
                    </li>
                </ul>
            </nav>
        );
    }
}

export default Header;
