import { useEffect, useState } from 'react';
import '../styles/theme.css';

const ThemeBackground = ({ children }) => {
    useEffect(() => {
        // Enforce the single premium dark theme
        document.body.setAttribute('data-theme', 'night');
    }, []);

    return <>{children}</>;
};

export default ThemeBackground;
