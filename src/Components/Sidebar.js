import React, { Component } from 'react';
import { BarChart, Users, PlusCircle, FileText, Briefcase, Box, AlertTriangle } from 'react-feather';
import { NavLink } from 'react-router-dom';
import Bookmarks from './Bookmarks';
class Sidebar extends Component {
    render() {
        return (
            <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                <div className="sidebar-sticky">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <NavLink exact className="nav-link" to="/">
                                <BarChart className="feather" />
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
                            <NavLink className="nav-link" to="/firms">
                                <Briefcase className="feather" />
                                Firms
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/documents">
                                <FileText className="feather" />
                                Documents
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/submittals">
                                <AlertTriangle className="feather" />
                                Submittal Generator
                            </NavLink>
                        </li>
                    </ul>

                    <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                        <span>Bookmarked Projects</span>
                    </h6>
                    <Bookmarks />
                </div>
            </nav>           
        );
    }
}

export default Sidebar;
