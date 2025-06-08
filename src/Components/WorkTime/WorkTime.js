import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './WorkTime.css';

const TimeTracker = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [history, setHistory] = useState({});
    const [editingEntry, setEditingEntry] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const token = localStorage.getItem('token');

    const fetchWorkHistory = async () => {
        try {
            const resp = await fetch('https://panel-pracownika-api.onrender.com/api/WorkTime', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!resp.ok) {
                setError('Nie udało się pobrać danych z serwera.');
                return;
            }

            const text = await resp.text();
            if (!text) {
                setHistory({});
                return;
            }

            const data = JSON.parse(text);
            const groupedData = groupByMonthAndYear(data);
            setHistory(groupedData);
        } catch (err) {
            console.error(err);
            setError('Wystąpił błąd przy pobieraniu danych.');
        }
    };

    const groupByMonthAndYear = (history) => {
        return history.reduce((acc, entry) => {
            const date = new Date(entry.date);
            const year = date.getFullYear();
            const month = date.getMonth();

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];
            acc[year][month].push(entry);
            return acc;
        }, {});
    };

    useEffect(() => {
        fetchWorkHistory();
    }, []);

    useEffect(() => {
        if (error || success) {
            setIsVisible(true);
            const timeout = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setError(''), 500);
                setTimeout(() => setSuccess(''), 500);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [error, success]);

    const deleteWorkTime = async (entry) => {
        await fetch(`https://panel-pracownika-api.onrender.com/api/WorkTime/${entry.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        fetchWorkHistory();
    };

    const saveWorkTime = async (entry) => {
        const requestBody = {
            id: entry ? entry.id : undefined,
            date: entry ? entry.date : date,
            startTime: entry ? entry.startTime : startTime || '00:00',
            endTime: entry ? entry.endTime : endTime || '00:00',
        };

        if (requestBody.startTime >= requestBody.endTime && requestBody.endTime !== '') {
            setError('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.');
            return;
        }

        let response;
        if (entry) {
            response = await fetch(`https://panel-pracownika-api.onrender.com/api/WorkTime/${entry.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
            });
            setSuccess('Zmiany zostały zapisane.');
        } else {
            if (history[selectedYear]?.[selectedMonth]?.some(entry => entry.date.split('T')[0] === date)) {
                setError('Możesz dodać tylko jeden wpis na dzień.');
                return;
            }
            console.log('requestBody', requestBody);

            response = await fetch('https://panel-pracownika-api.onrender.com/api/WorkTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
            });
            setSuccess('Zmiany zostały zapisane.');
        }

        fetchWorkHistory();
        setEditingEntry(null);
    };

    const editWorkTime = (entry) => {
        setEditingEntry(entry.id);
    };

    const handleInputChange = (e, field, entry) => {
        const value = e.target.value;
        setHistory((prevHistory) => ({
            ...prevHistory,
            [selectedYear]: {
                ...prevHistory[selectedYear],
                [selectedMonth]: prevHistory[selectedYear][selectedMonth].map((item) =>
                    item.id === entry.id ? { ...item, [field]: value } : item
                ),
            },
        }));
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const monthData = history[selectedYear]?.[selectedMonth] || [];

        if (monthData.length > 0) {
            const data = monthData.map(entry => {
                if (entry.startTime && entry.endTime && entry.startTime !== '00:00' && entry.endTime !== '00:00') {
                    const start = new Date(`1970-01-01T${entry.startTime}:00`);
                    const end = new Date(`1970-01-01T${entry.endTime}:00`);
                    const hoursWorked = ((end - start) / (1000 * 60 * 60)).toFixed(2);

                    return {
                        Data: entry.date.split('T')[0],
                        "Czas rozpoczęcia": entry.startTime,
                        "Czas zakończenia": entry.endTime,
                        "Godziny pracy": hoursWorked,
                    };
                } else {
                    return {
                        Data: entry.date.split('T')[0],
                        "Czas rozpoczęcia": "",
                        "Czas zakończenia": "",
                        "Godziny pracy": "0.00",
                    };
                }
            });

            const totalHours = calculateTotalHours();
            data.push({
                Data: "Suma:",
                "Czas rozpoczęcia": "",
                "Czas zakończenia": "",
                "Godziny pracy": totalHours,
            });

            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, ws, new Date(0, selectedMonth).toLocaleString('pl-PL', { month: 'long' }));
        }

        XLSX.writeFile(workbook, `Mateusz_Kopec_godziny_${new Date(0, selectedMonth).toLocaleString('pl-PL', { month: 'long' })}_${selectedYear}.xlsx`);
    };

    const calculateTotalHours = () => {
        return history[selectedYear]?.[selectedMonth]?.reduce((total, entry) => {
            return total + parseFloat(entry.total);
        }, 0).toFixed(2) || '0.00';
    };

    const entriesToShow = history[selectedYear]?.[selectedMonth] || [];

    return (
        <div className="time-tracker">
            {error && <div className={`error ${isVisible ? 'show' : 'hide'}`}>{error}</div>}
            {success && <div className={`success ${isVisible ? 'show' : 'hide'}`}>{success}</div>}
            <h2>Czas pracy</h2>
            <div>
                <label>Data: </label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
                <label>Godzina rozpoczęcia: </label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
                <label>Godzina zakończenia: </label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="buttons">
                <button onClick={() => saveWorkTime(null)}>Zapisz</button>
                <button onClick={exportToExcel}>Eksportuj do Excela</button>
            </div>
            <div>
                <label>Wybierz rok:</label>
                <select onChange={(e) => setSelectedYear(parseInt(e.target.value))} value={selectedYear}>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
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
            <h3>Historia pracy ({new Date(0, selectedMonth).toLocaleString('pl-PL', { month: 'long' })} {selectedYear}):</h3>
            <div className="table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Czas rozpoczęcia</th>
                            <th>Czas zakończenia</th>
                            <th>Godziny pracy</th>
                            <th>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entriesToShow.slice().reverse().map((entry) => {
                            const isEditing = editingEntry === entry.id;
                            const formattedDate = new Date(entry.date).toLocaleDateString('en-CA');

                            return (
                                <tr key={entry.id} className={entry.total === 0 ? 'empty' : ''}>
                                    <td>{formattedDate}<br /><small>({new Date(entry.date).toLocaleString('pl-PL', { weekday: 'long' })})</small></td>
                                    <td>
                                        {isEditing ? (
                                            <input type="time" value={entry.startTime} onChange={(e) => handleInputChange(e, 'startTime', entry)} />
                                        ) : entry.startTime}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input type="time" value={entry.endTime} onChange={(e) => handleInputChange(e, 'endTime', entry)} />
                                        ) : entry.endTime}
                                    </td>
                                    <td>{entry.total}</td>
                                    <td className="actions">
                                        {isEditing ? (
                                            <button className="editButton" onClick={() => saveWorkTime(entry)}>Zapisz</button>
                                        ) : (
                                            <button className="editButton" onClick={() => editWorkTime(entry)}>Edytuj</button>
                                        )}
                                        <button className="deleteButton" onClick={() => deleteWorkTime(entry)}>Usuń</button>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colSpan="3">Suma godzin:</td>
                            <td>{calculateTotalHours()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimeTracker;
