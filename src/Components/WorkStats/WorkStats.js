import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import './WorkStats.css';

const WorkStats = () => {
    const [workData, setWorkData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            const resp = await fetch('https://panel-pracownika-api.onrender.com/api/WorkTime', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await resp.json();

            const mapped = data.map(entry => {
                const dateObj = new Date(entry.date);
                return {
                    year: dateObj.getFullYear(),
                    month: dateObj.getMonth(),
                    hours: parseFloat(entry.total)
                };
            });

            setWorkData(mapped);
        };

        fetchData();
    }, []);

    const months = [...Array(12).keys()].map(i =>
        new Date(0, i).toLocaleString('pl-PL', { month: 'long' })
    );

    const years = Array.from(
        new Set(workData.map(e => e.year))
    ).sort((a, b) => b - a);

    const dataForYear = workData.filter(entry => entry.year === selectedYear);

    const monthlySummary = months.map((_, i) => {
        const entries = dataForYear.filter(e => e.month === i);
        const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
        return {
            month: months[i],
            hours: totalHours.toFixed(2)
        };
    });

    const allHours = dataForYear.map(e => e.hours);
    const total = allHours.reduce((sum, h) => sum + h, 0).toFixed(2);
    const days = allHours.filter(h => h > 0).length;
    const avg = days > 0 ? (total / days).toFixed(2) : 0;
    const max = allHours.length > 0 ? Math.max(...allHours).toFixed(2) : 0;
    const min = allHours.length > 0 ? Math.min(...allHours.filter(h => h > 0)).toFixed(2) : 0;

    return (
        <div className="stats-page">
            <h2>Statystyki roczne</h2>

            <label>Wybierz rok:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>

            <p><strong>Suma godzin:</strong> {total}</p>
            <p><strong>Średnia dzienna:</strong> {avg}</p>
            <p><strong>Liczba dni pracy:</strong> {days}</p>
            <p><strong>Najdłuższy dzień:</strong> {max} h</p>
            <p><strong>Najkrótszy dzień:</strong> {min} h</p>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#99a9f0" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WorkStats;
