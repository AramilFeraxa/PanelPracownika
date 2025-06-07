import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { useAuth } from "../../context/AuthContext";

const CalendarPage = () => {
    const [delegations, setDelegations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const [mode, setMode] = useState("Delegacja");

    useEffect(() => {
        if (!token) return;

        fetch('https://panel-pracownika-api.onrender.com/api/Absence', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Błąd pobierania danych.");
                return res.json();
            })
            .then(data => setDelegations(data))
            .catch(err => console.error("Błąd pobierania delegacji:", err));
    }, [token]);

    useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => setError(''), 4000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleDayClick = async (date) => {
        const dateString = date.toLocaleDateString('sv-SE');
        setSelectedDate(dateString);

        const existing = delegations.find(d => d.date === dateString);

        if (existing) {
            const resp = await fetch(`https://panel-pracownika-api.onrender.com/api/Absence/${dateString}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resp.ok) {
                setDelegations(delegations.filter(d => d.date !== dateString));
            } else {
                setError("Błąd usuwania.");
            }

            return;
        }

        const response = await fetch(`https://panel-pracownika-api.onrender.com/api/Absence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ date: new Date(dateString), type: mode })
        });

        if (response.ok) {
            setDelegations([...delegations, { date: dateString, type: mode }]);
        } else {
            const text = await response.text();
            setError(text || "Błąd dodawania.");
        }
    };


    const tileClassName = ({ date }) => {
        const dateStr = date.toLocaleDateString('sv-SE');
        const entry = delegations.find(d => d.date === dateStr);

        if (entry?.type === "Delegacja") return "delegation-day";
        if (entry?.type === "Urlop") return "vacation-day";
        return null;
    };


    return (
        <div className="calendar-container">
            <h2>Kalendarz nieobecności</h2>
            {error && <div className="calendar-error">{error}</div>}
            <div className="calendar-mode">
                <button onClick={() => setMode("Delegacja")} className={mode === "Delegacja" ? '' : 'inactive'}>Delegacja</button>
                <button onClick={() => setMode("Urlop")} className={mode === "Urlop" ? '' : 'inactive'}>Urlop</button>
            </div>
            <Calendar
                onClickDay={handleDayClick}
                tileClassName={tileClassName}
                locale="pl-PL"
            />
            {selectedDate && (
                <p>
                    Wybrano datę: <strong>{selectedDate}</strong> ({new Date(selectedDate).toLocaleDateString("pl-PL", { weekday: 'long' })})
                </p>
            )}
        </div>
    );
};

export default CalendarPage;
