import React from "react";
import { Link } from 'react-router-dom';
import { FaClock, FaClipboardList } from 'react-icons/fa';

const Navbar = () => {
    return (
        <nav className="sidebar">
            <ul>
                <li>
                    <Link to="/time-tracker">
                        <FaClock /> Czas pracy
                    </Link>
                </li>
                <li>
                    <Link to="/todo-list">
                        <FaClipboardList /> Todo List
                    </Link>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar;