import React, { useEffect, useState, useContext } from "react";
import { NavLink } from 'react-router-dom';
import { FaClock, FaClipboardList, FaChartBar, FaUserCircle, FaCog, FaCalendarAlt, FaCoins } from 'react-icons/fa';
import { useAuth } from "../../context/AuthContext";
import './Navbar.css';

const Navbar = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState({ name: '', surname: '' });
    const { user } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('https://panel-pracownika-api.onrender.com/api/User/profile', {
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
                {user?.isAdmin ? (
                    <>
                        <li>
                            <NavLink to="/admin/uzytkownicy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <FaUserCircle /> Zarządzaj użytkownikami
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/zadania" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <FaClipboardList /> Zarządzaj zadaniami
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/wynagrodzenia" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                                <FaCoins /> Zarządzaj wynagrodzeniami
                            </NavLink>
                        </li>
                    </>
                ) : (<>
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
                        <NavLink to="/kalendarz" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <FaCalendarAlt /> Kalendarz
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/wynagrodzenie" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <FaCoins /> Wynagrodzenie
                        </NavLink>
                    </li>
                </>)}
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
