import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FaClock, FaClipboardList } from 'react-icons/fa';
import TimeTracker from './TimeTracker';
import TodoList from './TodoList';
import './App.css';
import TopBar from './TopBar';
import Navbar from './Navbar';

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
      <div>
        <Navbar />
        <TopBar tasks={tasks} />
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
