import React, { useEffect, useState } from 'react';
import './Salary.css';
import { useAuth } from "../../context/AuthContext";
import SalaryProfile from './SalaryProfile';
import SalaryGenerator from './SalaryGenerator';
import SalaryHistory from './SalaryHistory';

const SalaryPage = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [editedHistory, setEditedHistory] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [message, setMessage] = useState('');
    const [updateMessage, setUpdateMessage] = useState('');
    const [filterYear, setFilterYear] = useState('all');

    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, [token]);

    const fetchProfile = async () => {
        const res = await fetch('https://localhost:7289/api/Salary/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProfile(data);
    };

    const fetchHistory = async () => {
        const res = await fetch('https://localhost:7289/api/Salary/history', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(data);
        setEditedHistory(data);
    };

    const generateSalary = async () => {
        setMessage('');
        const res = await fetch('https://localhost:7289/api/Salary/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ year, month })
        });

        if (res.ok) {
            await fetchHistory();
            setMessage('Wygenerowano wynagrodzenie.');
        } else {
            const error = await res.text();
            setMessage(error || 'Błąd generowania.');
        }
    };

    const updateRecord = async (id) => {
        setUpdateMessage('');
        const record = editedHistory.find(h => h.id === id);
        if (!record) return;

        const res = await fetch(`https://localhost:7289/api/Salary/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(record)
        });

        if (res.ok) {
            await fetchHistory();
            setUpdateMessage('Zapisano zmiany pomyślnie.');
        } else {
            const error = await res.text();
            setUpdateMessage(error || 'Błąd aktualizacji.');
        }
    };

    const handleChange = (id, field, value) => {
        setEditedHistory(prev =>
            prev.map(record =>
                record.id === id ? { ...record, [field]: value } : record
            )
        );
    };

    return (
        <div className="salary-page">
            <h2>Wynagrodzenie</h2>
            <SalaryProfile profile={profile} />
            <SalaryGenerator
                year={year}
                setYear={setYear}
                month={month}
                setMonth={setMonth}
                onGenerate={generateSalary}
                message={message}
            />
            <SalaryHistory
                history={history}
                editedHistory={editedHistory}
                filterYear={filterYear}
                setFilterYear={setFilterYear}
                handleChange={handleChange}
                updateRecord={updateRecord}
                updateMessage={updateMessage}
            />
        </div>
    );
};

export default SalaryPage;
