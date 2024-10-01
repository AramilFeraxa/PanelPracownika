import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './TimeTracker.css';

const TimeTracker = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [history, setHistory] = useState({});
    const [editingEntry, setEditingEntry] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const fetchWorkHistory = async () => {
        const resp = await fetch('https://panel-pracownika.azurewebsites.net/api/WorkTime');
        const data = await resp.json();
        const groupedData = groupByMonth(data);
        setHistory(groupedData);
    };

    const groupByMonth = (history) => {
        return history.reduce((acc, entry) => {
            const month = new Date(entry.date).getMonth();
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(entry);
            return acc;
        }, {});
    };

    useEffect(() => {
        fetchWorkHistory();
    }, []);

    useEffect(() => {
        if (error) {
            setIsVisible(true);

            const timeout = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setError(''), 500);
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [error]);

    const deleteWorkTime = async (entry) => {
        await fetch(`https://panel-pracownika.azurewebsites.net/api/WorkTime/${entry.id}`, {
            method: 'DELETE',
        });
        fetchWorkHistory();
    };

    const saveWorkTime = async () => {
        const requestBody = {
            id: editingEntry ? editingEntry.id : undefined,
            date: date,
            startTime: startTime || '00:00',
            endTime: endTime || '00:00',
        };

        if (startTime >= endTime && endTime !== '') {
            console.log(startTime, endTime);
            setError('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.');
            return;
        }

        let response;
        if (editingEntry) {
            // Update existing entry
            response = await fetch(`https://panel-pracownika.azurewebsites.net/api/WorkTime/${editingEntry.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
        } else {
            if (history[selectedMonth]?.some(entry => entry.date.split('T')[0] === date)) {
                setError('Możesz dodać tylko jeden wpis na dzień.');
                return;
            }
            // Create new entry
            response = await fetch('https://panel-pracownika.azurewebsites.net/api/WorkTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
        }

        fetchWorkHistory();
        setStartTime('');
        setEndTime('');
        setEditingEntry(null);
    };

    const editWorkTime = (entry) => {
        setEditingEntry(entry);
        setDate(entry.date.split('T')[0]);
        setStartTime(entry.startTime);
        setEndTime(entry.endTime);
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();

        for (let month = 0; month < 12; month++) {
            const monthData = history[month] || [];

            if (monthData.length > 0) {
                const data = monthData.map(entry => {
                    const start = new Date(`1970-01-01T${entry.startTime}:00`);
                    const end = new Date(`1970-01-01T${entry.endTime}:00`);
                    const hoursWorked = ((end - start) / (1000 * 60 * 60)).toFixed(2);

                    return {
                        Data: entry.date,
                        "Czas rozpoczęcia": entry.startTime,
                        "Czas zakończenia": entry.endTime,
                        "Godziny pracy": hoursWorked,
                    };
                });

                const totalHours = data.reduce((total, entry) => total + parseFloat(entry["Godziny pracy"]), 0).toFixed(2);

                data.push({
                    Data: "Suma:",
                    "Czas rozpoczęcia": "",
                    "Czas zakończenia": "",
                    "Godziny pracy": totalHours,
                });

                const ws = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, ws, new Date(0, month).toLocaleString('pl-PL', { month: 'long' }));
            }
        }

        XLSX.writeFile(workbook, "Czas_Pracy.xlsx");
    };


    const calculateTotalHours = () => {
        return history[selectedMonth]?.reduce((total, entry) => {
            return total + parseFloat(entry.total);
        }, 0).toFixed(2) || '0.00';
    };

    const entriesToShow = history[selectedMonth] || [];

    return (
        <div className="time-tracker">
            {error && (
                <div className={`error ${isVisible ? 'show' : 'hide'}`}>
                    {error}
                </div>
            )}
            <h2>Czas pracy</h2>
            <div>
                <label>Data: </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div>
                <label>Godzina rozpoczęcia: </label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>
            <div>
                <label>Godzina zakończenia: </label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            <div className="buttons">
                <button onClick={saveWorkTime}>{editingEntry ? 'Zaktualizuj' : 'Zapisz'}</button>
                {editingEntry && <button onClick={() => setEditingEntry(null)}>Anuluj</button>}
                <button onClick={exportToExcel}>Eksportuj do Excela</button>
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
            <h3>Historia pracy ({new Date(0, selectedMonth).toLocaleString('pl-PL', { month: 'long' })}):</h3>
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
                        const formattedDate = new Date(entry.date).toLocaleDateString('en-CA');

                        return (
                            <tr key={entry.id} className={entry.total === 0 ? 'empty' : ''}>
                                <td>{formattedDate}<br /><small>({new Date(entry.date).toLocaleString('pl-PL', { weekday: 'long' })})</small></td>
                                <td>{entry.startTime !== '00:00' ? entry.startTime : ''}</td>
                                <td>{entry.endTime !== '00:00' ? entry.endTime : ''}</td>
                                <td>{entry.total}</td>
                                <td className="actions">
                                    <button onClick={() => editWorkTime(entry)} className="editButton">Edytuj</button>
                                    <button onClick={() => deleteWorkTime(entry)} className="deleteButton">Usuń</button>
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td><strong>Suma:</strong></td>
                        <td></td>
                        <td></td>
                        <td><strong>{calculateTotalHours()}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default TimeTracker;
