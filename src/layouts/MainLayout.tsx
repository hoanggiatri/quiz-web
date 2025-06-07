import type { ReactNode } from "react";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { ClassProvider } from "@/contexts/ClassContext";

interface MainLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
  userId?: string; // Nếu sau này muốn truyền userId động
}

export default function MainLayout({ children, onLogout, userId }: MainLayoutProps) {
  // Tạm thời hardcode userId demo, sau này lấy từ auth context hoặc props
  const demoUserId = userId || "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  return (
    <ClassProvider userId={demoUserId}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header onLogout={onLogout} />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    </ClassProvider>
  );
} 