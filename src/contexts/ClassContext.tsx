import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { classService, type Class } from "@/services/classService";

interface ClassContextType {
  classes: Class[];
  selectedClass: Class | null;
  setSelectedClass: (cls: Class | null) => void;
  loading: boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const useClassContext = () => {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClassContext must be used within ClassProvider");
  return ctx;
};

interface ClassProviderProps {
  userId: string;
  children: ReactNode;
}

export const ClassProvider = ({ userId, children }: ClassProviderProps) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    classService.getClassesByUser(userId)
      .then((res) => {
        setClasses(res.data);
        setSelectedClass(res.data[0] || null);
      })
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <ClassContext.Provider value={{ classes, selectedClass, setSelectedClass, loading }}>
      {children}
    </ClassContext.Provider>
  );
}; 
