import React from 'react';
import './Dashboard.css';
import { FaClock, FaClipboardList, FaChartBar, FaCalendar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard">
            <h2>Witaj w Panelu Pracownika</h2>
            <p>Wybierz jedną z opcji poniżej, aby rozpocząć.</p>

            <div className="dashboard-cards">
                <div className="card" onClick={() => navigate('/czas-pracy')}>
                    <FaClock className="icon" />
                    <h3>Rejestr czasu pracy</h3>
                    <p>Zarejestruj swoje godziny pracy lub zobacz historię.</p>
                </div>
                <div className="card" onClick={() => navigate('/todo')}>
                    <FaClipboardList className="icon" />
                    <h3>Lista zadań</h3>
                    <p>Dodaj, edytuj i wykonuj swoje zadania.</p>
                </div>
                <div className="card" onClick={() => navigate('/statystyki')}>
                    <FaChartBar className="icon" />
                    <h3>Statystyki</h3>
                    <p>Przeglądaj swoje miesięczne statystyki pracy.</p>
                </div>
                <div className="card" onClick={() => navigate('/delegacje')}>
                    <FaCalendar className="icon" />
                    <h3>Delegacje</h3>
                    <p>Zarządzaj swoimi delegacjami i przeglądaj kalendarz.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
