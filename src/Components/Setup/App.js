import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FaClock, FaClipboardList } from 'react-icons/fa';
import TimeTracker from '../WorkTime/WorkTime';
import TodoList from '../TodoList/TodoList';
import Login from './Login';
import './App.css';
import TopBar from '../Navigation/TopBar';
import Navbar from '../Navigation/Navbar';
import Dashboard from '../Dashboard/Dashboard';
import WorkStats from '../WorkStats/WorkStats';
import Settings from '../Navigation/Settings';
import { useAuth } from '../../context/AuthContext';
import CalendarPage from '../Calendar/Calendar';
import Salary from '../Salary/SalaryPage';
import AdminUsers from '../AdminDashboard/AdminUsers';
import AdminSalary from '../AdminDashboard/AdminSalary';
import AdminTasks from '../AdminDashboard/AdminTasks';
import AdminWorkTime from '../AdminDashboard/AdminWorkTime';

const App = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };
  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch('https://panel-pracownika-api.onrender.com/api/Tasks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Błąd podczas pobierania zadań:', error);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <Router>
      <div className="container">
        {token && <TopBar tasks={tasks} onToggleSidebar={toggleSidebar} />}
        <div className="content-area">
          {token && <Navbar visible={sidebarVisible} onLinkClick={() => {
            if (window.innerWidth < 768) setSidebarVisible(false);
          }} />}
          <div className={token && "content"}>
            <Routes>
              <Route path="/" element={token ? <Dashboard /> : <Login />} />
              <Route path="/czas-pracy" element={token ? <TimeTracker /> : <Navigate to="/" />} />
              <Route path="/todo" element={token ? <TodoList taski={tasks} /> : <Navigate to="/" />} />
              <Route path="/statystyki" element={token ? <WorkStats /> : <Navigate to="/" />} />
              <Route path="/ustawienia" element={token ? <Settings /> : <Navigate to="/" />} />
              <Route path="/wynagrodzenie" element={token ? <Salary /> : <Navigate to="/" />} />
              <Route path="/kalendarz" element={token ? <CalendarPage /> : <Navigate to="/" />} />
              <Route path="/admin/uzytkownicy" element={token ? <AdminUsers /> : <Navigate to="/" />} />
              <Route path="/admin/wynagrodzenia" element={token ? <AdminSalary /> : <Navigate to="/" />} />
              <Route path="/admin/zadania" element={token ? <AdminTasks /> : <Navigate to="/" />} />
              <Route path="/admin/czas-pracy" element={token ? <AdminWorkTime /> : <Navigate to="/" />} />

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;