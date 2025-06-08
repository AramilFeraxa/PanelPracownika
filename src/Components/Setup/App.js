import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  useEffect(() => {
    const handleResize = () => setSidebarVisible(window.innerWidth >= 768);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch('https://panel-pracownika-api.onrender.com/api/Tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Błąd podczas pobierania zadań:', error);
      }
    };

    fetchTasks();
  }, [token]);

  const handleNavLinkClick = () => {
    if (window.innerWidth < 768) setSidebarVisible(false);
  };

  const protectedRoute = (Component) => token ? <Component /> : <Login />;
  const protectedTaskRoute = () => token ? <TodoList taski={tasks} /> : <Login />;

  return (
    <Router>
      <div className="container">
        {token && <TopBar tasks={tasks} onToggleSidebar={toggleSidebar} />}
        <div className="content-area">
          {token && <Navbar visible={sidebarVisible} onLinkClick={handleNavLinkClick} />}
          <div className={token ? "content" : ""}>
            <Routes>
              <Route path="/" element={protectedRoute(Dashboard)} />
              <Route path="/czas-pracy" element={protectedRoute(TimeTracker)} />
              <Route path="/todo" element={protectedTaskRoute()} />
              <Route path="/statystyki" element={protectedRoute(WorkStats)} />
              <Route path="/ustawienia" element={protectedRoute(Settings)} />
              <Route path="/wynagrodzenie" element={protectedRoute(Salary)} />
              <Route path="/kalendarz" element={protectedRoute(CalendarPage)} />
              <Route path="/admin/uzytkownicy" element={protectedRoute(AdminUsers)} />
              <Route path="/admin/wynagrodzenia" element={protectedRoute(AdminSalary)} />
              <Route path="/admin/zadania" element={protectedRoute(AdminTasks)} />
              <Route path="/admin/czas-pracy" element={protectedRoute(AdminWorkTime)} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;