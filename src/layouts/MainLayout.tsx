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
  const { userId } = useUserContext();


  // Luôn wrap với ClassProvider, nhưng truyền userId có thể null
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