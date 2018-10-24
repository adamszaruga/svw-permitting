import React, { Component } from 'react';
import { Home, Users, PlusCircle, FileText, Briefcase, Box } from 'react-feather';
import { NavLink } from 'react-router-dom';

class Sidebar extends Component {
    render() {
        return (
            <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                <div className="sidebar-sticky">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/">
                                <Home className="feather" />
                                Dashboard <span className="sr-only">(current)</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/projects">
                                <Box className="feather" />
                                Projects
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/applicants">
                                <Users className="feather" />
                                Applicants
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/owners">
                                <Briefcase className="feather" />
                                Owners
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/documents">
                                <FileText className="feather" />
                                Documents
                            </NavLink>
                        </li>
                    </ul>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                        <span>Bookmarked Projects</span>
                        <a className="d-flex align-items-center text-muted" href="#">
                            <PlusCircle className="feather" />
                        </a>
                    </h6>
                    <ul className="nav flex-column mb-2">
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <Box className="feather" />
                                Victory
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <Box className="feather" />
                                Sandy Springs
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <Box className="feather" />
                                Powers Ferry
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <Box className="feather" />
                                Cumberland
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>           
        );
    }
}

export default Sidebar;
