import {useEffect, useState} from 'react';

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  const modeMe = (e: MediaQueryListEvent) => {
    setDarkMode(!!e.matches);
  };

  useEffect(() => {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

    setDarkMode(matchMedia.matches);
    matchMedia.addEventListener('change', modeMe);

    return () => matchMedia.removeEventListener('change', modeMe);
  }, []);

  return darkMode;
}
