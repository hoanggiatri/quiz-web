import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {  GraduationCap,  ClipboardList,  HelpCircle,  MessageSquare,  Trophy,  BookOpen,  Bell,  User,  LogOut,} from "lucide-react";
import "./styles.css";
import ClassSelector from "@/components/common/ClassSelector";

interface HeaderProps {
  onLogout?: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const handleLoginClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="border-b sticky top-0 z-10 bg-background header-container">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center">
          <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-md w-8 h-8 mr-2">
            <GraduationCap size={18} />
          </div>
          <h1 className="text-xl font-bold text-foreground logo-text">
            EduNext
          </h1>
        </Link>

        {/* Main navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link to="/quiz/quiz-list">
              <Trophy className="h-4 w-4 mr-1" />
              Bài thi trắc nghiệm
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link to="/assignment/assignment-list">
              <ClipboardList className="h-4 w-4 mr-1" />
              Bài tập về nhà
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link to="/leaderboard">
              <Trophy className="h-4 w-4 mr-1" />
              Bảng xếp hạng
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-1" asChild>
            <Link to="/learning-materials">
              <BookOpen className="h-4 w-4 mr-1" />
              Tài liệu
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4 mr-1" />
            Trợ giúp
          </Button>

          <Button variant="ghost" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            Liên hệ
          </Button>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications button */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Link>
          </Button>

          <ClassSelector />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/user-profile">
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLoginClick}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />

          {/* Mobile menu button (only visible on small screens) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
