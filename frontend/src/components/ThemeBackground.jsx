import { useEffect, useState } from 'react';
import '../styles/theme.css';

const ThemeBackground = ({ children }) => {
    const [theme, setTheme] = useState('day');

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setTheme('morning');
            } else if (hour >= 17 && hour < 21) {
                setTheme('evening');
            } else if (hour >= 21 || hour < 5) {
                setTheme('night');
            } else {
                setTheme('day'); // Afternoon default or fallback
            }
        };

        updateTheme();
        const interval = setInterval(updateTheme, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return <>{children}</>;
};

export default ThemeBackground;
