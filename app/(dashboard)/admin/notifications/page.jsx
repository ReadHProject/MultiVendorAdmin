"use client";

import { useGetNotificationsQuery, useMarkAllReadMutation } from "@/store/api/slices/notificationsApi";
import { formatDate } from "@/lib/utils";

function NotificationsPage() {
  const { data, isLoading, refetch } = useGetNotificationsQuery({});
  const [markAllRead] = useMarkAllReadMutation();
  const items = data?.data?.items || [];
  const unreadCount = data?.data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={async () => { await markAllRead(); refetch(); }} className="h-9 px-4 border border-border rounded-md text-sm font-medium hover:bg-muted">Mark all read</button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />) :
          items.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">No notifications</div> :
          items.map((n) => (
            <div key={n.id} className={`bg-card border rounded-lg p-4 flex items-start gap-3 ${!n.read ? "border-primary/20 bg-primary/5" : "border-border"}`}>
              <span className={`material-symbols-outlined text-lg ${!n.read ? "text-primary" : "text-muted-foreground"}`}>notifications</span>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{n.title}</h3>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />}
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default NotificationsPage;
