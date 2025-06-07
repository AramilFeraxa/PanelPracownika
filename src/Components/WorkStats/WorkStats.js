import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import './WorkStats.css';

const WorkStats = () => {
    const [workData, setWorkData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [statsView, setStatsView] = useState('yearly');
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
                const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
                const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

                return {
                    year: dateObj.getFullYear(),
                    month: dateObj.getMonth(),
                    week: weekNumber,
                    date: dateObj,
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
    const dataForMonth = dataForYear.filter(entry => entry.month === selectedMonth);

    const monthlySummary = months.map((_, i) => {
        const entries = dataForYear.filter(e => e.month === i);
        const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
        return {
            month: months[i],
            hours: totalHours.toFixed(2)
        };
    });

    const weeklySummary = (() => {
        const weeksInMonth = [...new Set(dataForMonth.map(e => e.week))].sort((a, b) => a - b);

        return weeksInMonth.map(weekNum => {
            const entries = dataForMonth.filter(e => e.week === weekNum);
            const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
            return {
                week: `Tydzień ${weekNum}`,
                hours: totalHours.toFixed(2)
            };
        }).filter(week => parseFloat(week.hours) > 0);
    })();

    const allHours = dataForYear.map(e => e.hours);
    const total = allHours.reduce((sum, h) => sum + h, 0).toFixed(2);
    const days = allHours.filter(h => h > 0).length;
    const avg = days > 0 ? (total / days).toFixed(2) : 0;
    const max = allHours.length > 0 ? Math.max(...allHours).toFixed(2) : 0;
    const min = allHours.length > 0 ? Math.min(...allHours.filter(h => h > 0)).toFixed(2) : 0;

    return (
        <div className="stats-page">
            <h2>Statystyki pracy</h2>

            <div className="stats-controls">
                <div>
                    <label>Wybierz rok:</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Widok:</label>
                    <select value={statsView} onChange={(e) => setStatsView(e.target.value)}>
                        <option value="yearly">Miesięczny</option>
                        <option value="weekly">Tygodniowy</option>
                    </select>
                </div>

                {statsView === 'weekly' && (
                    <div>
                        <label>Miesiąc:</label>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                            {months.map((monthName, index) => (
                                <option key={index} value={index}>{monthName}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="stats-summary">
                <p><strong>Suma godzin:</strong> {total}</p>
                <p><strong>Średnia dzienna:</strong> {avg}</p>
                <p><strong>Liczba dni pracy:</strong> {days}</p>
                <p><strong>Najdłuższy dzień:</strong> {max} h</p>
                <p><strong>Najkrótszy dzień:</strong> {min} h</p>
            </div>

            {statsView === 'yearly' ? (
                <div>
                    <h3>Statystyki miesięczne</h3>
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
            ) : (
                <div>
                    <h3>Statystyki tygodniowe dla {months[selectedMonth]}</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={weeklySummary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="hours" fill="#86c7f3" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default WorkStats;
