import React, { useEffect, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context/AuthContext';

const AdminTasks = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ text: '', dueDate: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) fetchTasks();
    }, [selectedUserId]);

    const fetchUsers = async () => {
        const res = await fetch('https://panel-pracownika-api.onrender.com/api/Admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
        setSelectedUserId(data.length > 0 ? data[0].id : null);
    };

    const fetchTasks = async () => {
        const res = await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/tasks/${selectedUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            setTasks(data);
        } catch (e) {
            console.error("Niepoprawny JSON:", text);
        }
    };

    const addTask = async () => {
        const res = await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/users/${selectedUserId}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newTask)
        });

        if (res.ok) {
            setNewTask({ text: '', dueDate: '' });
            fetchTasks();
        }
    };

    const deleteTask = async (id) => {
        await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/tasks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
    };

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="admin-panel">
            <h2>Zadania użytkowników</h2>

            <label>Wybierz użytkownika:
                <select value={selectedUserId || ''} onChange={e => setSelectedUserId(parseInt(e.target.value))}>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
                    ))}
                </select>
            </label>

            <div className="task-form">
                <input
                    type="text"
                    placeholder="Treść zadania"
                    value={newTask.text}
                    onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                />
                <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <button onClick={addTask}>Dodaj</button>
            </div>

            <h3>Aktywne zadania</h3>
            <ul className="task-list">
                {activeTasks.map(t => (
                    <li key={t.id}>
                        <span>{t.text} ({t.dueDate})</span>
                        <button onClick={() => deleteTask(t.id)}>Usuń</button>
                    </li>
                ))}
            </ul>
            {activeTasks.length === 0 && <p className="empty-message">Brak aktywnych zadań.</p>}

            <h3>Archiwum zadań ukończonych</h3>
            <ul className="task-list archived">
                {completedTasks.map(t => (
                    <li key={t.id} className="completed-task">
                        <span>{t.text} ({t.dueDate})</span>
                        <button onClick={() => deleteTask(t.id)}>Usuń</button>
                    </li>
                ))}
            </ul>
            {completedTasks.length === 0 && <p className="empty-message">Brak zadań ukończonych.</p>}
        </div>
    );
};

export default AdminTasks;
