import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const ContentContext = createContext(null);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/content")
      .then(({ data }) => {
        if (active) setContent(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ContentContext.Provider value={{ content, error }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
