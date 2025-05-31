import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
  const leaderboard = [
    { rank: 1, name: "Nguyễn Văn A", score: 950, avatar: "https://github.com/shadcn.png" },
    { rank: 2, name: "Trần Thị B", score: 920, avatar: "https://github.com/shadcn.png" },
    { rank: 3, name: "Lê Văn C", score: 890, avatar: "https://github.com/shadcn.png" },
    { rank: 4, name: "Phạm Thị D", score: 850, avatar: "https://github.com/shadcn.png" },
    { rank: 5, name: "Hoàng Văn E", score: 820, avatar: "https://github.com/shadcn.png" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold">{rank}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bảng xếp hạng</h1>
        <p className="text-muted-foreground">Top học sinh có điểm số cao nhất</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Xếp hạng tổng thể
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((student) => (
              <div key={student.rank} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getRankIcon(student.rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-muted-foreground">Học sinh</div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{student.score}</div>
                  <div className="text-sm text-muted-foreground">điểm</div>
                </div>
                
                {student.rank <= 3 && (
                  <Badge variant={student.rank === 1 ? "default" : "secondary"}>
                    Top {student.rank}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
