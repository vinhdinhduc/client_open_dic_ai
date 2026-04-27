"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import notificationService, {
  Notification,
} from "@/services/notificationService";
import "./NotificationBell.scss";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({
  className = "",
}: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getNotifications({
        limit: 15,
      });
      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Tải dữ liệu ban đầu và polling định kỳ
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds
    pollIntervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = notifications.find(
        (n) => n._id === notificationId && !n.isRead,
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      notificationService.markAsRead(notification._id).catch(console.error);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes}p trước`;
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}d trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getNotificationTypeColor = (type: string): string => {
    if (type.includes("contribution")) return "contribution";
    if (type.includes("report")) return "report";
    if (type.includes("comment")) return "comment";
    return "system";
  };
  console.log("Notification", notifications);

  return (
    <div className={`notification-bell ${className}`} ref={dropdownRef}>
      <button
        className={`notification-bell__trigger ${unreadCount > 0 ? "notification-bell__trigger--has-unread" : ""}`}
        onClick={handleToggle}
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-all"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {notifications.length === 0 ? (
              <div className="notification-bell__empty">
                <Bell size={24} />
                <p>Không có thông báo</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-bell__item ${!notification.isRead ? "notification-bell__item--unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`notification-bell__item-indicator notification-bell__item-indicator--${getNotificationTypeColor(notification.type)}`}
                  />
                  <div className="notification-bell__item-content">
                    <div className="notification-bell__item-title">
                      {notification.title}
                    </div>
                    <div className="notification-bell__item-message">
                      {notification.message}
                    </div>
                    <div className="notification-bell__item-time">
                      <Clock size={10} />
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                  <div className="notification-bell__item-actions">
                    {!notification.isRead && (
                      <button
                        className="notification-bell__item-action"
                        onClick={(e) => handleMarkAsRead(e, notification._id)}
                        title="Đánh dấu đã đọc"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      className="notification-bell__item-action notification-bell__item-action--delete"
                      onClick={(e) =>
                        handleDeleteNotification(e, notification._id)
                      }
                      title="Xóa"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
