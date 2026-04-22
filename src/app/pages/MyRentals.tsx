import { useRental, Booking } from "../context/RentalContext";
import { format, addHours, differenceInMinutes, isBefore } from "date-fns";
import { History, Clock, CheckCircle, Trash2, User, Gamepad2, CreditCard, QrCode, Banknote, Wallet } from "lucide-react";
import { motion } from "motion/react";

export default function MyRentals() {
  const { bookings, units, endBooking } = useRental();

  const activeBookings = bookings.filter(b => b.status === 'active');
  const pastBookings = bookings.filter(b => b.status !== 'active');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Active Sessions</h2>
        <p className="text-slate-500 text-sm">Monitor current PlayStation rentals.</p>
      </div>

      <div className="space-y-4">
        {activeBookings.length > 0 ? (
          activeBookings.map((booking, index) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              unitName={units.find(u => u.id === booking.unitId)?.name || "Unknown"}
              onEnd={() => endBooking(booking.id)}
              index={index}
            />
          ))
        ) : (
          <div className="p-8 border border-slate-200 border-dashed rounded-3xl text-center bg-white">
            <Clock className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-400 text-sm">No active sessions.</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <History size={18} className="text-slate-400" /> Session History
        </h3>
        <div className="space-y-3">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking, index) => (
              <div 
                key={booking.id}
                className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{booking.customerName}</p>
                    <p className="text-[10px] text-slate-400">
                      {format(new Date(booking.startTime), "MMM d, HH:mm")} • {booking.durationHours}h • ${booking.totalCost}
                      {booking.paymentMethod && (
                        <span> • {getPaymentMethodLabel(booking.paymentMethod)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 py-1 rounded-md">
                  Completed
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 text-xs py-4">History will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getPaymentMethodIcon(method?: string) {
  switch (method) {
    case "credit-card":
    case "debit-card":
      return <CreditCard size={12} />;
    case "qr-payment":
      return <QrCode size={12} />;
    case "cash":
      return <Banknote size={12} />;
    case "e-wallet":
      return <Wallet size={12} />;
    default:
      return null;
  }
}

function getPaymentMethodLabel(method?: string) {
  switch (method) {
    case "credit-card":
      return "Credit Card";
    case "debit-card":
      return "Debit Card";
    case "qr-payment":
      return "QR";
    case "cash":
      return "Cash";
    case "e-wallet":
      return "E-Wallet";
    default:
      return "";
  }
}

function BookingCard({ 
  booking, 
  unitName, 
  onEnd, 
  index 
}: { 
  booking: Booking; 
  unitName: string; 
  onEnd: () => void;
  index: number;
}) {
  const endTime = addHours(new Date(booking.startTime), booking.durationHours);
  const now = new Date();
  const timeLeft = differenceInMinutes(endTime, now);
  const progress = Math.max(0, Math.min(100, (1 - timeLeft / (booking.durationHours * 60)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Gamepad2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{unitName}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                <User size={10} /> {booking.customerName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600">${booking.totalCost}</p>
            <p className="text-[10px] text-slate-400">{booking.durationHours}h session</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-slate-400">Start: {format(new Date(booking.startTime), "HH:mm")}</span>
            <span className={timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-blue-500"}>
              {timeLeft > 0 ? `${timeLeft}m remaining` : "Session Ended"}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${timeLeft <= 10 ? "bg-red-500" : "bg-blue-500"}`}
            />
          </div>
          {booking.paymentMethod && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              {getPaymentMethodIcon(booking.paymentMethod)}
              <span>Paid via {getPaymentMethodLabel(booking.paymentMethod)}</span>
            </div>
          )}
        </div>

        <button 
          onClick={onEnd}
          className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
        >
          <Trash2 size={14} /> End Session Now
        </button>
      </div>
    </motion.div>
  );
}