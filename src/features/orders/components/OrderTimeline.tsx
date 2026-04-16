"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderEvent {
  id: string;
  event_type: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
  operator_id?: string;
  metadata?: any;
}

interface OrderTimelineProps {
  events: OrderEvent[];
}

const EVENT_ICONS: Record<string, any> = {
  ORDER_CREATED: Circle,
  STATUS_CHANGE: Clock,
  DELIVERY_FAILED: AlertCircle,
  DELIVERY_CONFIRMED: CheckCircle2,
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
        <Clock className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm">Aucun événement enregistré</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-orange-100 before:to-transparent">
      {events.map((event, index) => {
        const Icon = EVENT_ICONS[event.event_type] || Circle;
        const isCurrent = index === 0;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${
              isCurrent ? "is-active" : ""
            }`}
          >
            {/* Icon Dot */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all ${
              isCurrent ? "bg-primary text-black" : "bg-orange-50 text-orange-300"
            }`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-xs font-black uppercase tracking-widest ${isCurrent ? "text-primary" : "text-gray-400"}`}>
                    {event.event_type.replace("_", " ")}
                  </span>
                  <time className="text-[10px] font-bold text-gray-300 uppercase whitespace-nowrap">
                    {format(new Date(event.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  </time>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  {event.from_status && (
                    <span className="text-xs font-bold text-gray-400 line-through">
                      {event.from_status}
                    </span>
                  )}
                  {event.from_status && <span className="text-[10px] text-gray-300">→</span>}
                  <span className={`text-sm font-black ${isCurrent ? "text-gray-900" : "text-gray-600"}`}>
                    {event.to_status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase">
                  <User className="w-3 h-3" />
                  ID: {event.operator_id?.split("-")[0] || "Système"}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
