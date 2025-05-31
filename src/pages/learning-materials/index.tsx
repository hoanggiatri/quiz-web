import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Eye, FileText, Video, Image } from "lucide-react";

export default function LearningMaterialsPage() {
  const materials = [
    {
      id: 1,
      title: "Giáo trình Toán học",
      type: "pdf",
      subject: "Toán học",
      size: "2.5 MB",
      downloads: 150
    },
    {
      id: 2,
      title: "Video bài giảng Lập trình",
      type: "video",
      subject: "Lập trình",
      size: "45 MB",
      downloads: 89
    },
    {
      id: 3,
      title: "Slide bài giảng Vật lý",
      type: "presentation",
      subject: "Vật lý",
      size: "1.8 MB",
      downloads: 67
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'presentation': return <Image className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tài liệu học tập</h1>
        <p className="text-muted-foreground">Tải xuống tài liệu và bài giảng</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(material.type)}
                {material.title}
              </CardTitle>
              <Badge variant="outline">{material.subject}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kích thước:</span>
                  <span>{material.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lượt tải:</span>
                  <span>{material.downloads}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
