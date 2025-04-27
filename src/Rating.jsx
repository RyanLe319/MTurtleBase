import React from "react";
import './rating.css'

function Rating({ currentTier, onTierChange }) {
    const tierOptions = {
        'S-Tier': 'S-Tier',
        'A-Tier': 'Elite',
        'B-Tier': 'Good Read',
        'C-Tier': 'Readable',
        'D-Tier': 'Brain Off',
        'F-Tier': 'Headache'
    }

    return (
        <select
            className={`rating-select ${currentTier || ''}`}
            value={currentTier || ''}
            onChange={(e) => onTierChange(e.target.value)}
            aria-label="Select rating tier"
        >
            <option value="">Select Tier</option>
            {Object.entries(tierOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
    );
}

export default Rating