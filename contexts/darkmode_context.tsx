import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// 1. Define the context type
type DarkModeContextType = {
    darkMode: boolean;
    toggleDarkMode: Dispatch<SetStateAction<boolean>>;
};

// 2. Create the context with a default (optional)
const DarkModeType = createContext<DarkModeContextType | undefined>(undefined);

// 3. Define the props type for the provider component
type DarkModeProviderProps = {
    children: ReactNode;
};

const DarkModeContext = ({ children }: DarkModeProviderProps) => {
    const [darkMode, toggleDarkMode] = useState(false);

    return (
        <DarkModeType.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeType.Provider>
    );
};

export { DarkModeType, DarkModeContext };
