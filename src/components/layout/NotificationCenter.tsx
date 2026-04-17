"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
          toast.info("Nouvelle notification !");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "error": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-orange-50 text-gray-500 hover:text-primary transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-2xl p-2" align="end">
        <DropdownMenuLabel className="flex items-center justify-between p-3">
          <span className="font-black uppercase text-xs tracking-widest text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" className="h-6 text-[10px] font-bold text-primary hover:text-primary/80 px-2" onClick={markAllRead}>
              Tout lire
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-50" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aucune notification</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="p-4 rounded-xl cursor-default focus:bg-gray-50/50">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm leading-tight ${n.is_read ? 'text-gray-500 font-medium' : 'text-gray-900 font-black'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
