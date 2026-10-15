import { createContext, useContext } from "react";
export const ScrollContext = createContext<(target: number | string) => void>(
  () => {},
);
export const useScrollTo = () => useContext(ScrollContext);
