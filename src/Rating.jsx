import React from "react";
import './rating.css'

function Rating({ currentTier, onTierChange }) {
    const tierOptions = {
        'S-Tier-Plus': 'S Tier+',
        'S-Tier': 'S Tier',
        'S-Tier-Minus': 'S Tier-',
        'A-Tier-Plus': 'Elite+',
        'A-Tier': 'Elite',
        'A-Tier-Minus': 'Elite-',
        'B-Tier-Plus': 'Good Read+',
        'B-Tier': 'Good Read',
        'B-Tier-Minus': 'Good Read-',
        'C-Tier': 'Readable',
        'D-Tier': 'Brain Off',
        'F-Tier': 'Headache'
    };
    

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