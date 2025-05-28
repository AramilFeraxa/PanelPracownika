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

    useEffect(() => {
        if (!token) return;

        fetch('https://localhost:7289/api/Delegations', {
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

        try {
            if (delegations.includes(dateString)) {
                const resp = await fetch(`https://localhost:7289/api/Delegations/${dateString}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!resp.ok) {
                    setError("Błąd podczas usuwania delegacji.");
                    return;
                }

                setDelegations(delegations.filter(d => d !== dateString));
            } else {
                const response = await fetch(`https://localhost:7289/api/Delegations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ date: new Date(dateString) })
                });

                if (!response.ok) {
                    const text = await response.text();
                    if (response.status === 409) {
                        setError("Nie można dodać delegacji – istnieją już godziny pracy.");
                    } else {
                        setError("Błąd dodawania delegacji.");
                    }
                    console.error("API error:", text);
                    return;
                }

                setDelegations([...delegations, dateString]);
            }
        } catch (error) {
            console.error("Błąd połączenia z API:", error);
            setError("Błąd połączenia z serwerem.");
        }
    };

    const tileClassName = ({ date }) => {
        const dateStr = date.toLocaleDateString('sv-SE');
        return delegations.includes(dateStr) ? 'delegation-day' : null;
    };

    return (
        <div className="calendar-container">
            <h2>Kalendarz delegacji</h2>
            {error && <div className="calendar-error">{error}</div>}
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
