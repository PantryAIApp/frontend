import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// 1. Define the context type
type RefreshContextType = {
    refresh: string;
    setRefresh: Dispatch<SetStateAction<string>>;
};

// 2. Create the context with a default (optional)
const RefreshType = createContext<RefreshContextType | undefined>(undefined);

// 3. Define the props type for the provider component
type RefreshProviderProps = {
    children: ReactNode;
};

const RefreshContext = ({ children }: RefreshProviderProps) => {
    const [refresh, setRefresh] = useState<string>("");

    return (
        <RefreshType.Provider value={{ refresh, setRefresh }}>
            {children}
        </RefreshType.Provider>
    );
};

export { RefreshType, RefreshContext };
