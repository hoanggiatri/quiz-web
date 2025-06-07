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
import {  GraduationCap,  ClipboardList,  Trophy,  BookOpen,  Bell,  User,  LogOut,} from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg header-container">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo/Brand - Enhanced */}
        <Link to="/" className="flex items-center group">
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg w-10 h-10 mr-3 shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
            <GraduationCap size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent logo-text">
              EduNext
            </h1>
            <span className="text-xs text-muted-foreground font-medium -mt-1">
              Learning Platform
            </span>
          </div>
        </Link>

        {/* Main navigation - Enhanced */}
        <nav className="hidden lg:flex items-center space-x-2">
          <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium" asChild>
            <Link to="/quiz/quiz-list">
              <Trophy className="h-4 w-4 text-blue-500" />
              Bài thi trắc nghiệm
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 font-medium" asChild>
            <Link to="/assignment/assignment-list">
              <ClipboardList className="h-4 w-4 text-green-500" />
              Bài tập về nhà
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 font-medium" asChild>
            <Link to="/leaderboard">
              <Trophy className="h-4 w-4 text-purple-500" />
              Bảng xếp hạng
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 font-medium" asChild>
            <Link to="/learning-materials">
              <BookOpen className="h-4 w-4 text-orange-500" />
              Tài liệu
            </Link>
          </Button>
        </nav>

        {/* Secondary navigation */}
        <div className="hidden md:flex lg:hidden items-center space-x-1">
          <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
            <Link to="/quiz/quiz-list">
              <Trophy className="h-4 w-4" />
              Quiz
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
            <Link to="/assignment/assignment-list">
              <ClipboardList className="h-4 w-4" />
              Bài tập
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
            <Link to="/leaderboard">
              <Trophy className="h-4 w-4" />
              Xếp hạng
            </Link>
          </Button>
        </div>

        {/* Right side actions - Enhanced */}
        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <Button variant="ghost" size="icon" asChild className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Link to="/notifications">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </Link>
          </Button>

          <div className="hidden sm:block">
            <ClassSelector />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/user-profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLoginClick} className="text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {/* Mobile menu button (only visible on small screens) */}
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
              className="text-gray-600 dark:text-gray-300"
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
