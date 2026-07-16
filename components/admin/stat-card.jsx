import { Card, CardContent } from "@/components/ui/card";

const toneClass = {
  default: "",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-destructive",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-primary"
};

export function StatCard({ label, value, hint, tone = "default" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={"text-2xl font-bold mt-1 " + toneClass[tone]}>{value}</div>
        {hint && <div className="text-xs text-muted-foreground/70 mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
