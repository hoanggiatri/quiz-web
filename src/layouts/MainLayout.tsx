import type { ReactNode } from "react";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { ClassProvider } from "@/contexts/ClassContext";
import { useUserContext } from "@/contexts/UserContext";

interface MainLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export default function MainLayout({ children, onLogout }: MainLayoutProps) {
  const { userId, isLoading } = useUserContext();

  // Nếu đang loading hoặc chưa có userId, hiển thị layout cơ bản
  if (isLoading || !userId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onLogout={onLogout} />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Khi có userId thực, wrap với ClassProvider
  return (
    <ClassProvider userId={userId}>
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