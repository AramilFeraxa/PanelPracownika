import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './TimeTracker.css';

const TimeTracker = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [history, setHistory] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);

    const fetchWorkHistory = async () => {
        const response = await fetch('https://panel-pracownika.azurewebsites.net/api/WorkTime');
        const data = await response.json();
        setHistory(data);
    };

    useEffect(() => {
        fetchWorkHistory();
    }, []);

    const deleteWorkTime = async (entry) => {
        await fetch(`https://panel-pracownika.azurewebsites.net/api/WorkTime/${entry.id}`, {
            method: 'DELETE',
        });
        fetchWorkHistory();
    };

    const saveWorkTime = async () => {
        const date = new Date().toISOString().split('T')[0];
        const requestBody = {
            id: editingEntry ? editingEntry.id : undefined,
            date: date,
            startTime: startTime,
            endTime: endTime,
        };

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
        setStartTime(entry.startTime);
        setEndTime(entry.endTime);
    };

    const exportToExcel = () => {
        const data = history.map(entry => {
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
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Czas Pracy");

        XLSX.writeFile(wb, "Czas_Pracy.xlsx");
    };

    const calculateTotalHours = () => {
        return history.reduce((total, entry) => {
            const start = new Date(`1970-01-01T${entry.startTime}:00`);
            const end = new Date(`1970-01-01T${entry.endTime}:00`);
            const hoursWorked = (end - start) / (1000 * 60 * 60);
            return total + hoursWorked;
        }, 0).toFixed(2);
    };

    return (
        <div className="time-tracker">
            <h2>Czas pracy</h2>
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
            <button onClick={saveWorkTime}>{editingEntry ? 'Zaktualizuj' : 'Zapisz'}</button>
            <button onClick={exportToExcel}>Eksportuj do Excela</button>

            <h3>Historia pracy:</h3>
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
                    {history.map((entry) => {
                        const start = new Date(`1970-01-01T${entry.startTime}:00`);
                        const end = new Date(`1970-01-01T${entry.endTime}:00`);
                        const hoursWorked = ((end - start) / (1000 * 60 * 60)).toFixed(2);
                        const formattedDate = new Date(entry.date).toLocaleDateString('en-CA');

                        return (
                            <tr key={entry.id}>
                                <td>{formattedDate}</td>
                                <td>{entry.startTime}</td>
                                <td>{entry.endTime}</td>
                                <td>{hoursWorked}</td>
                                <td>
                                    <button onClick={() => editWorkTime(entry)}>Edytuj</button>
                                    <button onClick={() => deleteWorkTime(entry)}>Usuń</button>
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
