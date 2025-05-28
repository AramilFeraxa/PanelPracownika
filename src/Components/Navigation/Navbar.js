import React from "react";
import { NavLink } from 'react-router-dom';
import { FaClock, FaClipboardList, FaChartBar } from 'react-icons/fa';

const Navbar = () => {
    return (
        <nav className="sidebar">
            <ul>
                <li>
                    <NavLink to="/czas-pracy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaClock /> Czas pracy
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/todo" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaClipboardList /> Todo List
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/statystyki" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaChartBar /> Statystyki
                    </NavLink>
                </li>

            </ul>
        </nav>
    )
}

export default Navbar;
