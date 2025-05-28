import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const [formData, setFormData] = useState({ name: '', surname: '', newPassword: '' });
    const [success, setSuccess] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch('https://localhost:7289/api/User/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                setFormData({ name: user.name || '', surname: user.surname || '', newPassword: '' });
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        const response = await fetch('https://localhost:7289/api/User/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            setSuccess("Zapisano zmiany.");
            setFormData(prev => ({ ...prev, newPassword: '' }));
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    return (
        <div className="settings-page">
            <h2>Ustawienia użytkownika</h2>
            <div className="form-group">
                <label>Imię</label>
                <input name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nazwisko</label>
                <input name="surname" value={formData.surname} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Nowe hasło</label>
                <input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} />
            </div>
            <button onClick={handleSave}>Zapisz</button>
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default Settings;
