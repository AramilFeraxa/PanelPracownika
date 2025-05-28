import React, { useEffect, useState, useContext } from "react";
import { NavLink } from 'react-router-dom';
import { FaClock, FaClipboardList, FaChartBar, FaUserCircle, FaCog, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from "../../context/AuthContext";
import './Navbar.css';

const Navbar = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState({ name: '', surname: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('https://localhost:7289/api/User/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error('Błąd pobierania profilu:', err);
            }
        };
        fetchProfile();
    }, [token]);

    return (
        <nav className="sidebar">
            <div className="user-profile">
                <FaUserCircle size={48} />
                <div className="user-name">{profile.name} {profile.surname}</div>
            </div>

            <ul>
                <li>
                    <NavLink to="/czas-pracy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaClock /> Czas pracy
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/todo" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaClipboardList /> Lista zadań
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/statystyki" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaChartBar /> Statystyki
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/delegacje" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaCalendarAlt /> Delegacje
                    </NavLink>
                </li>

                <li><br /></li>
                <li className="bottom-link">
                    <NavLink to="/ustawienia" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaCog /> Ustawienia
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
