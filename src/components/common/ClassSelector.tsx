import { useClassContext } from "@/contexts/ClassContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClassSelector() {
  const { classes, selectedClass, setSelectedClass, loading } = useClassContext();

  if (loading) return <span className="w-40 h-8 inline-block bg-muted rounded animate-pulse" />;
  if (!classes.length) return <span className="text-muted-foreground">Không có lớp</span>;

  return (
    <Select
      value={selectedClass?.id || ""}
      onValueChange={val => {
        const cls = classes.find(c => c.id === val) || null;
        setSelectedClass(cls);
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Chọn lớp học" />
      </SelectTrigger>
      <SelectContent>
        {classes.map(cls => (
          <SelectItem key={cls.id} value={cls.id}>
            {cls.className}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 