import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminWorkTime = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [workTimes, setWorkTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch('https://panel-pracownika-api.onrender.com/api/Admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
    };

    const formatDate = (isoDate) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString('pl-PL');
    };

    const calculateTotalHours = () => {
        return workTimes.reduce((total, entry) => {
            if (entry.startTime && entry.endTime) {
                const start = new Date(`${entry.date}T${entry.startTime}`);
                const end = new Date(`${entry.date}T${entry.endTime}`);
                const diff = (end - start) / 3600000;
                return total + (isNaN(diff) ? 0 : diff);
            }
            return total;
        }, 0).toFixed(2);
    };

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchWorkTime = async () => {
        if (!selectedUserId) return;

        setLoading(true);
        setMessage('');
        setWorkTimes([]);

        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();

        const res = await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/users/${selectedUserId}/worktimes?startDate=${startDate}&endDate=${endDate}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setWorkTimes(data);
        } else {
            const err = await res.text();
            setMessage(`Błąd: ${err}`);
        }

        setLoading(false);
        setLoaded(true);
    };

    return (
        <div className="admin-panel">
            <h2>Podgląd czasu pracy</h2>

            <div className="field-row">
                <div>
                    <label>Użytkownik:</label>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                        <option value="">-- wybierz --</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} {user.surname}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Wybierz miesiąc:</label>
                    <select onChange={(e) => setSelectedMonth(parseInt(e.target.value))} value={selectedMonth}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>
                                {new Date(0, i).toLocaleString('pl-PL', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Wybierz rok:</label>
                    <select onChange={(e) => setSelectedYear(parseInt(e.target.value))} value={selectedYear}>
                        {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={new Date().getFullYear() - 5 + i}>
                                {new Date().getFullYear() - 5 + i}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={fetchWorkTime} disabled={!selectedUserId || loading}>
                    {loading ? 'Ładowanie...' : 'Pokaż czas pracy'}
                </button>
            </div>

            {message && <p className="status-msg">{message}</p>}
            {workTimes.length > 0 && (
                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Od</th>
                                <th>Do</th>
                                <th>Łącznie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workTimes.map((entry, index) => (
                                <tr key={index} className={entry.total === 0 ? 'empty' : ''}>
                                    <td>{formatDate(entry.date)}</td>
                                    <td>{entry.startTime}</td>
                                    <td>{entry.endTime}</td>
                                    <td>{entry.total ? entry.total.toFixed(2) : '0'}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3">Suma godzin:</td>
                                <td>{calculateTotalHours()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {workTimes.length === 0 && !loading && loaded && (
                <p className="empty-message">Brak danych w wybranym miesiącu.</p>
            )}
        </div>
    );
};

export default AdminWorkTime;
