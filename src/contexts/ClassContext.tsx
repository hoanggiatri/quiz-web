import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { classService, type Class } from "@/services/classService";
import { toast } from "sonner";

interface ClassContextType {
  classes: Class[];
  selectedClass: Class | null;
  setSelectedClass: (cls: Class | null) => void;
  loading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    classService.getClassesByUser(userId)
      .then((res) => {
        setClasses(res.data);
        setSelectedClass(res.data[0] || null);
        setError(null);
      })
      .catch((err) => {
        console.error('❌ ClassProvider: Failed to load classes:', err);
        toast.error('Đã có lỗi xảy ra khi tải danh sách lớp');
        setClasses([]);
        setSelectedClass(null);
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách lớp');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <ClassContext.Provider value={{ classes, selectedClass, setSelectedClass, loading, error }}>
      {children}
    </ClassContext.Provider>
  );
};
