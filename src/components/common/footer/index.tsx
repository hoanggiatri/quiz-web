import "./styles.css";

export default function Footer() {
  return (
    <footer className="border-t py-6 bg-background footer-container">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="footer-column">
            <h3 className="text-lg font-medium mb-4">EduNext</h3>
            <p className="text-muted-foreground text-sm">
              Nền tảng học tập trực tuyến hàng đầu với các khóa học chất lượng cao
            </p>
          </div>
          
          <div className="footer-column">
            <h4 className="text-base font-medium mb-3">Liên kết</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trang chủ</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Khóa học</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Giảng viên</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4 className="text-base font-medium mb-3">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Liên hệ</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Chính sách</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Điều khoản</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4 className="text-base font-medium mb-3">Liên hệ</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">contact@edunext.com</li>
              <li className="text-sm text-muted-foreground">+84 123 456 789</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduNext. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
} 