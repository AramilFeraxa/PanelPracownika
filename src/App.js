import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FaClock, FaClipboardList } from 'react-icons/fa';
import TimeTracker from './TimeTracker';
import TodoList from './TodoList';
import './App.css';
import TopBar from './TopBar';

const App = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('https://panel-pracownika.azurewebsites.net/api/tasks');
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  return (
    <Router>
      <TopBar tasks={tasks} />
      <div style={{ display: 'flex' }}>
        <nav className="sidebar">
          <ul>
            <li>
              <Link to="/time-tracker">
                <FaClock /> Czas pracy
              </Link>
            </li>
            <li>
              <Link to="/todo-list">
                <FaClipboardList /> Todo List
              </Link>
            </li>
          </ul>
        </nav>


        <div className="container">
          <Routes>
            <Route path="/time-tracker" element={<TimeTracker />} />
            <Route path="/todo-list" element={<TodoList taski={tasks} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
