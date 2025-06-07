import React from 'react';
import './Dashboard.css';
import { FaClock, FaClipboardList, FaChartBar, FaCalendar, FaCoins, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    return (
        <div className="dashboard">
            {user?.isAdmin ? <h1>Panel administratora</h1> : <>
                <h2>Witaj w Panelu Pracownika</h2>
                <p>Wybierz jedną z opcji poniżej, aby rozpocząć.</p></>}

            <div className="dashboard-cards">
                {user?.isAdmin ? (
                    <>
                        <div className="card" onClick={() => navigate('/admin')}>
                            <FaUserCircle className="icon" />
                            <h3>Zarządzaj użytkownikami</h3>
                            <p>Przeglądaj i zarządzaj użytkownikami systemu.</p>
                        </div>
                        <div className="card" onClick={() => navigate('/admin/zadania')}>
                            <FaClipboardList className="icon" />
                            <h3>Zarządzaj zadaniami</h3>
                            <p>Przeglądaj i zarządzaj zadaniami pracowników.</p>
                        </div>
                        <div className="card" onClick={() => navigate('/admin/wynagrodzenia')}>
                            <FaCoins className="icon" />
                            <h3>Zarządzaj wynagrodzeniami</h3>
                            <p>Przeglądaj i zarządzaj wynagrodzeniami pracowników.</p>
                        </div>
                        <div className="card" onClick={() => navigate('/admin/czas-pracy')}>
                            <FaClock className="icon" />
                            <h3>Zarządzaj czasem pracy</h3>
                            <p>Przeglądaj czas pracy pracowników.</p>
                        </div>
                    </>
                ) : (
                    <>
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
                        <div className="card" onClick={() => navigate('/wynagrodzenie')}>
                            <FaCoins className="icon" />
                            <h3>Wynagrodzenie</h3>
                            <p>Sprawdź swoje wynagrodzenie i generuj raporty.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
