import React from 'react';

const SalaryHistory = ({
    history, editedHistory, filterYear, setFilterYear, handleChange, updateRecord, updateMessage
}) => {
    const getAvailableYears = () => {
        const years = [...new Set(history.map(h => h.year))];
        years.sort((a, b) => b - a);
        return years;
    };

    const filtered = filterYear === 'all'
        ? editedHistory
        : editedHistory.filter(h => h.year === parseInt(filterYear));

    return (
        <div className="history-box">
            <h3>Historia wynagrodzeń</h3>
            <div className="filter-controls">
                <label>Filtruj według roku:
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                        <option value="all">Wszystkie lata</option>
                        {getAvailableYears().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="update-message-box">
                {updateMessage && <span className="status-msg-inline">{updateMessage}</span>}
            </div>
            <div className="table-wrapper">
                <table className="salary-history-table">
                    <thead>
                        <tr>
                            <th>Rok</th>
                            <th>Miesiąc</th>
                            <th>Oczekiwane</th>
                            <th>Otrzymane</th>
                            <th>Potwierdzone</th>
                            <th>Premia</th>
                            <th>Notatka</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(h => (
                            <tr key={h.id}>
                                <td>{h.year}</td>
                                <td>{h.month}</td>
                                <td>{h.expectedAmount.toFixed(2)} zł</td>
                                <td>
                                    <input
                                        type="number"
                                        value={h.receivedAmount}
                                        onChange={(e) => {
                                            handleChange(h.id, 'receivedAmount', parseFloat(e.target.value));
                                            if (!h.isConfirmed && !h.hasBonus && parseFloat(e.target.value) !== h.expectedAmount) {
                                                handleChange(h.id, 'hasBonus', true);
                                            }
                                        }}
                                        disabled={h.isConfirmed}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={h.isConfirmed}
                                        onChange={(e) => handleChange(h.id, 'isConfirmed', e.target.checked)}
                                        disabled={h.hasBonus}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={h.hasBonus}
                                        onChange={(e) => handleChange(h.id, 'hasBonus', e.target.checked)}
                                        disabled={h.isConfirmed}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={h.notes || ''}
                                        onChange={(e) => handleChange(h.id, 'notes', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => updateRecord(h.id)}>Zapisz</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalaryHistory;
