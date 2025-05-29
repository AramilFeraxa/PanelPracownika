import React from 'react';

const SalaryGenerator = ({ year, setYear, month, setMonth, onGenerate, message }) => (
    <div className="generate-box">
        <h3>Generuj wynagrodzenie</h3>
        <label>Rok:
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
        </label>
        <label>Miesiąc:
            <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} />
        </label>
        <button onClick={onGenerate}>Generuj</button>
        {message && <span className="status-msg-inline">{message}</span>}
    </div>
);

export default SalaryGenerator;
