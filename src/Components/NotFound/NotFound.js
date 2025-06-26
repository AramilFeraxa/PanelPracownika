import React from 'react';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>Brak takiej strony</h1>
            <p>Strona, której szukasz, nie istnieje.</p>
            <p>Możesz wrócić do <a href="/">strony głównej</a> lub skorzystać z menu nawigacyjnego.</p>
        </div>
    );
}
export default NotFound;