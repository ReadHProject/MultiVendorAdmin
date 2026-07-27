import { LoadingAnimation } from "@/components/ui/loading-animation";

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <LoadingAnimation type="spinner" />
    </div>
  );
}
