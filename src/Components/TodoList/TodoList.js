import React, { useState, useEffect } from 'react';
import './TodoList.css';

const TodoList = ({ taski }) => {
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [tasks, setTasks] = useState(taski);

    const token = localStorage.getItem('token');

    useEffect(() => {
        setTasks(taski);
    }, [taski]);

    const addTask = async () => {
        if (!task || !dueDate) return;

        const newTask = {
            text: task,
            dueDate: dueDate,
            completed: false,
        };

        const response = await fetch('https://localhost:7289/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newTask),
        });

        const savedTask = await response.json();
        setTasks((prevTasks) => [...prevTasks, savedTask]);
        setTask('');
        setDueDate('');
    };

    const toggleTaskCompletion = async (taskId) => {
        const updatedTasks = tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );

        setTasks(updatedTasks);

        const taskToUpdate = updatedTasks.find((t) => t.id === taskId);

        const response = await fetch(`https://localhost:7289/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: taskToUpdate.id,
                text: taskToUpdate.text,
                dueDate: taskToUpdate.dueDate,
                completed: taskToUpdate.completed,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
        }
    };

    const deleteTask = async (taskId) => {
        await fetch(`https://localhost:7289/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    };

    const archivedTasks = tasks.filter((task) => task.completed);

    return (
        <div className="todo-list">
            <h2>Lista zadań</h2>
            <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Dodaj nowe zadanie"
            />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
            <button onClick={addTask}>Dodaj</button>

            <h3>Zadania do zrobienia</h3>
            <ul>
                {tasks.filter((t) => !t.completed).map((t) => (
                    <li key={t.id} className={t.completed ? 'completed' : ''}>
                        <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleTaskCompletion(t.id)}
                        />
                        {t.text} (Termin: {t.dueDate})
                        <button onClick={() => deleteTask(t.id)}>Usuń</button>
                    </li>
                ))}
            </ul>

            <h3>
                Archiwum zadań
                <button onClick={() => setShowArchived(!showArchived)} style={{ marginLeft: '10px' }}>
                    {showArchived ? 'Ukryj' : 'Pokaż'}
                </button>
            </h3>
            {showArchived && (
                <ul>
                    {archivedTasks.map((t) => (
                        <li key={t.id} className="completed">
                            {t.text} (Termin: {t.dueDate})
                            <button onClick={() => deleteTask(t.id)}>Usuń</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodoList;
