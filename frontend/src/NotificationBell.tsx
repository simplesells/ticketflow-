import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead } from './api';
import type { Notification } from './api';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const refresh = () => {
    fetchUnreadCount().then(setUnread).catch(() => {});
    if (open) {
      fetchNotifications().then(setList).catch(() => {});
    }
  };

  useEffect(() => {
    refresh();
  }, [open]);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = async (n: Notification) => {
    await markNotificationRead(n.id);
    setOpen(false);
    refresh();
    navigate(`/${n.workorderId}`);
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    refresh();
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => { setOpen(!open); if (!open) { fetchNotifications().then(setList).catch(() => {}); } }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative', fontSize: 20 }}
        title="通知"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -4,
            background: '#dc2626', color: '#fff', borderRadius: 10,
            fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 36, right: 0, width: 340, maxHeight: 420,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>通知</span>
            {list.length > 0 && (
              <button onClick={handleReadAll}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12 }}>
                全部已读
              </button>
            )}
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 360 }}>
            {list.length === 0 ? (
              <p style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>暂无通知</p>
            ) : (
              list.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #f9fafb',
                    background: n.isRead ? '#fff' : '#eff6ff',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.4, marginBottom: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {new Date(n.createdAt).toLocaleString('zh-CN')}
                    </span>
                    {!n.isRead && (
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#3b82f6', flexShrink: 0 }} />
                    )}
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
