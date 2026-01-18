import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useTheme } from "./ThemeProvider";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Bell, Check, X, Clock, AlertCircle, CheckCircle, Info, Trash2, MoreHorizontal 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "./ui/dropdown-menu";

interface Notification {
  _id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(["userId"]); // 👈 get logged-in userId from cookies
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(hasDarkClass);
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, [theme]);

  // ✅ Fetch notifications for the logged-in user
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/notifications/${cookies.userId}`
      );
      setNotifications(res.data);
      // Trigger badge count update
      window.dispatchEvent(new CustomEvent('notificationChanged'));
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cookies.userId) {
      fetchNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [cookies.userId]);

  // ✅ Mark one notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      // Trigger badge count update
      window.dispatchEvent(new CustomEvent('notificationChanged'));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => axios.put(`http://localhost:5000/notifications/${n._id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Trigger badge count update
      window.dispatchEvent(new CustomEvent('notificationChanged'));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // ✅ Delete a notification (local + optional backend)
  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Trigger badge count update
      window.dispatchEvent(new CustomEvent('notificationChanged'));
      // Optional: implement DELETE route if needed
      // await axios.delete(`http://localhost:5000/notifications/${id}`);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case "error":
        return <X className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading notifications...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest leave requests and alerts.
          </p>
        </div>
        <Button
          onClick={markAllAsRead}
          variant="outline"
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Notifications
              </p>
              <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{unreadCount}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/60 dark:border dark:border-orange-800/50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Update
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {notifications[0]
                  ? formatTimestamp(notifications[0].timestamp)
                  : "-"}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 dark:border dark:border-blue-800/50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            All your notifications are shown in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No notifications yet 🎉
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div key={notification._id}>
                    <div
                      className={`p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read
                          ? "bg-blue-50 dark:bg-blue-950/60 dark:border-blue-500/70 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                          : "dark:bg-card/50"
                      }`}
                      style={
                        !notification.read && isDark
                          ? {
                              backgroundColor: "rgba(30, 58, 138, 0.4)",
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteNotification(notification._id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
