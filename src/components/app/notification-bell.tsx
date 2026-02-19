"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "convex/react";
import { useQueryWithStatus } from "@/hooks/use-query-with-status";
import { api } from "../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";

export function NotificationBell() {
  const unreadCountQuery = useQueryWithStatus(api.notifications.getUnreadCount);
  const unreadCount = unreadCountQuery.data;
  const notificationsQuery = useQueryWithStatus(api.notifications.getNotifications, {
    limit: 10,
  });
  const notifications = notificationsQuery.data;
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationClick = async (
    notificationId: Id<"notifications">,
    isRead: boolean
  ) => {
    if (!isRead) {
      await markAsRead({ notificationId: notificationId });
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-white max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount !== undefined && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications || notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.isRead ? "bg-primary/10" : ""
                }`}
                onClick={() =>
                  handleNotificationClick(notification._id, notification.isRead)
                }
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground flex items-center gap-2">
                      {notification.title}
                      {!notification.isRead && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-xs"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.createdAt, {
                    addSuffix: true,
                  })}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
