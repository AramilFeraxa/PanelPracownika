import React, { useEffect, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context/AuthContext';

const AdminSalary = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        const res = await fetch('https://panel-pracownika-api.onrender.com/api/Admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(data);
    };

    const updateSalary = async (id, salary) => {
        setMessage('');
        const res = await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/users/${id}/salary`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(salary)
        });

        if (res.ok) {
            setMessage('Zaktualizowano wynagrodzenie.');
            fetchUsers();
        } else {
            setMessage('Błąd aktualizacji.');
        }
    };

    return (
        <div className="admin-panel">
            <h2>Zarządzanie wynagrodzeniami</h2>
            {message && <p className="status-msg">{message}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Użytkownik</th>
                        <th>Typ umowy</th>
                        <th>Stawka</th>
                        <th>Pensja</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const s = user.salary || {};
                        return (
                            <tr key={user.id}>
                                <td>{user.name} {user.surname}</td>
                                <td>
                                    <select
                                        value={s.contractType || ''}
                                        onChange={e =>
                                            setUsers(prev =>
                                                prev.map(u =>
                                                    u.id === user.id
                                                        ? { ...u, salary: { ...s, contractType: e.target.value } }
                                                        : u
                                                )
                                            )
                                        }
                                    >
                                        <option value="">--</option>
                                        <option value="Umowa o prace">Umowa o pracę</option>
                                        <option value="Umowa zlecenie">Umowa zlecenie</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={s.hourlyRate || ''}
                                        onChange={e =>
                                            setUsers(prev =>
                                                prev.map(u =>
                                                    u.id === user.id
                                                        ? { ...u, salary: { ...s, hourlyRate: e.target.valueAsNumber } }
                                                        : u
                                                )
                                            )
                                        }
                                        disabled={s.contractType == 'Umowa o prace' || s.contractType == undefined}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={s.monthlySalary || ''}
                                        onChange={e =>
                                            setUsers(prev =>
                                                prev.map(u =>
                                                    u.id === user.id
                                                        ? { ...u, salary: { ...s, monthlySalary: e.target.valueAsNumber } }
                                                        : u
                                                )
                                            )
                                        }
                                        disabled={s.contractType == 'Umowa zlecenie'}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => updateSalary(user.id, user.salary)}>Zapisz</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSalary;
