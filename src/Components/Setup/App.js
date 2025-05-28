import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { FaClock, FaClipboardList } from 'react-icons/fa';
import TimeTracker from '../TimeTracker/TimeTracker';
import TodoList from '../TodoList/TodoList';
import Login from './Login';
import './App.css';
import TopBar from '../Navigation/TopBar';
import Navbar from '../Navigation/Navbar';
import Dashboard from '../Dashboard/Dashboard';
import WorkStats from '../WorkStats/WorkStats';
import { useAuth } from '../../context/AuthContext';

const App = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch('https://localhost:7289/api/Tasks', {
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
      <div>
        {token && <Navbar />}
        {token && <TopBar tasks={tasks} />}
        <div className={token ? "container with-ui" : ""}>
          <Routes>
            <Route path="/" element={token ? <Dashboard /> : <Login />} />
            <Route path="/czas-pracy" element={token ? <TimeTracker /> : <Navigate to="/" />} />
            <Route path="/todo" element={token ? <TodoList taski={tasks} /> : <Navigate to="/" />} />
            <Route path="/statystyki" element={token ? <WorkStats /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;