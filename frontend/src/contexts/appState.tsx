import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

// Add any other properties you want your global state to have
export type AppState = {
  theme: Theme;
  startBottom: boolean;
  mobile: boolean;
};

export type AppStateContext = {
  appState: AppState;
  setAppState: (state: AppState) => void;
};

const AppStateContext = createContext<AppStateContext | undefined>(undefined);

export const useAppState = () => {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return state;
};

export const AppStateProvider = (props: { children: React.ReactNode }) => {
  // Add default values for your global state here
  const [appState, setAppState] = useState<AppState>({
    theme: "dark",
    startBottom: true,
    mobile: window.innerWidth < 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setAppState((state) => ({
        ...state,
        mobile: window.innerWidth < 768,
      }));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      {props.children}
    </AppStateContext.Provider>
  );
};
