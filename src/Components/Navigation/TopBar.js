import React, { useState, useEffect } from 'react';
import './TopBar.css';
import { FaBell, FaTimes, FaHome, FaBars } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ tasks, onToggleSidebar }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const currentDate = new Date();
        const nextDay = new Date();
        nextDay.setDate(currentDate.getDate() + 1);

        const filteredTasks = tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate >= currentDate && dueDate <= nextDay && !task.completed;
        });

        setUpcomingTasks(filteredTasks);
    }, [tasks]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="top-bar">
            <div className="topbar-actions">
                <button className="sidebar-toggle" onClick={onToggleSidebar}>
                    <FaBars />
                </button>
                <button className="mainpage-button" onClick={() => navigate('/')}>
                    <FaHome />
                </button>
            </div>
            <h1>Panel Pracownika</h1>

            <div className="topbar-actions">
                <button className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                    <FaBell />
                    {upcomingTasks.length > 0 && <span className="notification-count">{upcomingTasks.length}</span>}
                </button>
                <button className="logout-button" onClick={handleLogout}>Wyloguj</button>
            </div>


            {showNotifications && (
                <div className="notifications">
                    <FaTimes className="close-icon" onClick={() => setShowNotifications(false)} />
                    <h3>Powiadomienia</h3>
                    {upcomingTasks.length > 0 ? (
                        upcomingTasks.map(task => (
                            <div key={task.id} className="notification-item">
                                Zadania do wykonania na jutro:<br /><br />
                                <a href="/todo-list">
                                    ▪️ {task.text} - termin: {new Date(task.dueDate).toLocaleDateString()}
                                </a>
                            </div>
                        ))
                    ) : (
                        <div>Brak zadań do wykonania w ciągu następnego dnia.</div>
                    )}
                </div>
            )}
        </div>
    );
};


export default TopBar;
