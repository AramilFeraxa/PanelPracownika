import React, { useEffect, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Setup/Modal';

const AdminUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        name: '',
        surname: '',
        password: '',
        isAdmin: false,
    });
    const [message, setMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: '',
        name: '',
        surname: '',
        password: '',
        isAdmin: false,
    });

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

    const handleCreateUser = async () => {
        setMessage('');
        const res = await fetch('https://panel-pracownika-api.onrender.com/api/Admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newUser)
        });

        if (res.ok) {
            await fetchUsers();
            setMessage('Dodano użytkownika.');
            setNewUser({
                username: '', name: '', surname: '', password: '', isAdmin: false
            });
        } else {
            const err = await res.text();
            setMessage(`Błąd: ${err}`);
        }
    };
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteUser = async (id) => {
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/users/${userToDelete}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        setMessage('Użytkownik został usunięty.');
    };

    const startEditingUser = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            name: user.name,
            surname: user.surname,
            password: '',
            isAdmin: user.isAdmin
        });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setMessage('');
        const res = await fetch(`https://panel-pracownika-api.onrender.com/api/Admin/users/${editingUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editForm)
        });

        if (res.ok) {
            await fetchUsers();
            setMessage('Zaktualizowano dane użytkownika.');
            setEditingUser(null);
        } else {
            const err = await res.text();
            setMessage(`Błąd aktualizacji: ${err}`);
        }
    };

    return (
        <div className="admin-panel">
            <h2>Zarządzanie użytkownikami</h2>
            {message && <p className="status-msg">{message}</p>}

            <div className="admin-user-form">
                <h4>Dodaj nowego użytkownika</h4>
                <div className="field-row">
                    <label>Login:
                        <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                    </label>
                    <label>Hasło:
                        <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </label>
                </div>
                <div className="field-row">
                    <label>Imię:
                        <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                    </label>
                    <label>Nazwisko:
                        <input type="text" value={newUser.surname} onChange={e => setNewUser({ ...newUser, surname: e.target.value })} />
                    </label>
                </div>
                <div className="field-row align-center">
                    <label>
                        <input type="checkbox" checked={newUser.isAdmin} onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })} />
                        Administrator
                    </label>
                    <button className="submit-btn" onClick={handleCreateUser}>Dodaj użytkownika</button>
                </div>
            </div>

            <h3>Lista użytkowników</h3>
            <table>
                <thead>
                    <tr>
                        <th>Login</th>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Admin</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.name}</td>
                            <td>{user.surname}</td>
                            <td>{user.isAdmin ? '✓' : ''}</td>
                            <td>
                                <button className="editButton" onClick={() => startEditingUser(user)}>Edytuj</button>
                                <button className="deleteButton" onClick={() => handleDeleteUser(user.id)}>Usuń</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)}>
                <h4 className="editing-h4">Edycja użytkownika: {editingUser?.username}</h4>
                <div className="field-row">
                    <label>Login:
                        <input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} />
                    </label>
                    <label>Hasło:
                        <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                    </label>
                </div>
                <div className="field-row">
                    <label>Imię:
                        <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    </label>
                    <label>Nazwisko:
                        <input type="text" value={editForm.surname} onChange={e => setEditForm({ ...editForm, surname: e.target.value })} />
                    </label>
                </div>
                <div className="field-row align-center">
                    <label>
                        <input type="checkbox" checked={editForm.isAdmin} onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })} />
                        Administrator
                    </label>
                    <button onClick={handleUpdateUser}>Zapisz</button>
                    <button className="deleteButton" onClick={() => setEditingUser(null)}>Anuluj</button>
                </div>
            </Modal>
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <h4>Czy na pewno chcesz usunąć tego użytkownika?</h4>
                <div className="field-row align-center">
                    <button className="deleteButton" onClick={confirmDeleteUser}>Usuń</button>
                    <button onClick={() => setShowDeleteModal(false)}>Anuluj</button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUsers;
