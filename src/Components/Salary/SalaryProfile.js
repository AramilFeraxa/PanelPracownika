import React from 'react';

const SalaryProfile = ({ profile }) => {
    if (!profile) return null;

    return (
        <div className="profile-box">
            <p><strong>Typ umowy:</strong> {profile.contractType === 'Umowa zlecenie' ? 'Umowa zlecenie' : 'Umowa o pracę'}</p>
            {profile.contractType === 'Umowa zlecenie' && (
                <p><strong>Stawka godzinowa:</strong> {profile.hourlyRate} zł</p>
            )}
            {profile.contractType === 'Umowa o prace' && (
                <p><strong>Pensja miesięczna:</strong> {profile.monthlySalary} zł</p>
            )}
        </div>
    );
};

export default SalaryProfile;