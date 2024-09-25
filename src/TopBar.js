import React, { useState, useEffect } from 'react';
import './TopBar.css';

const TopBar = ({ tasks }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [upcomingTasks, setUpcomingTasks] = useState([]);

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

    return (
        <div className="top-bar">
            <h1>Panel Pracownika</h1>
            <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                🛎️
                {upcomingTasks.length > 0 && <span className="notification-count">{upcomingTasks.length}</span>}
            </div>
            {showNotifications && (
                <div className="notifications">
                    <icon className="close-icon" onClick={() => setShowNotifications(false)}>❌</icon>
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
