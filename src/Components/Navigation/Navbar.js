import React, { useEffect, useState, useContext } from "react";
import { NavLink } from 'react-router-dom';
import { FaClock, FaClipboardList, FaChartBar, FaUserCircle, FaCog, FaCalendarAlt, FaCoins } from 'react-icons/fa';
import { useAuth } from "../../context/AuthContext";
import './Navbar.css';

const Navbar = ({ visible, onLinkClick }) => {
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
        <nav className={`sidebar ${visible ? 'visible' : 'hidden'}`}>
            <div className="user-profile">
                <FaUserCircle size={48} />
                <div className="user-name">{profile.name} {profile.surname}</div>
            </div>

            <ul>
                {user?.isAdmin ? (
                    <>
                        <li>
                            <NavLink to="/admin/uzytkownicy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                                <FaUserCircle /> Zarządzaj użytkownikami
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/zadania" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                                <FaClipboardList /> Zarządzaj zadaniami
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/wynagrodzenia" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                                <FaCoins /> Zarządzaj wynagrodzeniami
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/czas-pracy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                                <FaClock /> Przeglądaj czas pracy
                            </NavLink>
                        </li>
                    </>
                ) : (<>
                    <li>
                        <NavLink to="/czas-pracy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                            <FaClock /> Czas pracy
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/todo" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                            <FaClipboardList /> Lista zadań
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/statystyki" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                            <FaChartBar /> Statystyki
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/kalendarz" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                            <FaCalendarAlt /> Kalendarz
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/wynagrodzenie" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                            <FaCoins /> Wynagrodzenie
                        </NavLink>
                    </li>
                </>)}
                <li><br /></li>
                <li className="bottom-link">
                    <NavLink to="/ustawienia" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onLinkClick}>
                        <FaCog /> Ustawienia
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
