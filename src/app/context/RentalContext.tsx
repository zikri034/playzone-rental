import React, { createContext, useContext, useState, useEffect } from "react";
import { addHours, isAfter } from "date-fns";
import { toast } from "sonner";

export interface Booking {
  id: string;
  unitId: string;
  customerName: string;
  startTime: Date;
  durationHours: number;
  totalCost: number;
  status: "active" | "completed" | "cancelled";
  paymentMethod?: "credit-card" | "debit-card" | "qr-payment" | "cash" | "e-wallet";
}

export interface Unit {
  id: string;
  name: string;
  type: "PS5" | "PS4 Pro" | "PS5 Digital";
  pricePerHour: number;
  status: "available" | "rented" | "maintenance";
  currentBookingId?: string;
}

interface RentalContextType {
  units: Unit[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "status">) => void;
  endBooking: (id: string) => void;
  getUnitStatus: (id: string) => Unit["status"];
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

const INITIAL_UNITS: Unit[] = [
  { id: "1", name: "Console 01", type: "PS5", pricePerHour: 15, status: "available" },
  { id: "2", name: "Console 02", type: "PS5", pricePerHour: 15, status: "available" },
  { id: "3", name: "Console 03", type: "PS5 Digital", pricePerHour: 12, status: "available" },
  { id: "4", name: "Console 04", type: "PS4 Pro", pricePerHour: 8, status: "available" },
  { id: "5", name: "Console 05", type: "PS5", pricePerHour: 15, status: "maintenance" },
];

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Simulate real-time check for notifications and ending bookings
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      bookings.forEach(booking => {
        if (booking.status === "active") {
          const endTime = addHours(new Date(booking.startTime), booking.durationHours);
          const diffInMinutes = (endTime.getTime() - now.getTime()) / (1000 * 60);

          // Notification: 10 mins before end
          if (diffInMinutes > 0 && diffInMinutes <= 10 && diffInMinutes > 9.5) {
            toast.warning(`Rental for ${booking.customerName} ending in 10 minutes!`);
          }

          // Auto-end if time passed (for demo purposes)
          if (isAfter(now, endTime)) {
            endBooking(booking.id);
            toast.info(`Rental for ${booking.customerName} has completed.`);
          }
        }
      });
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [bookings]);

  const addBooking = (bookingData: Omit<Booking, "id" | "status">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      status: "active",
      startTime: new Date(), // Using current time for demo
    };

    setBookings(prev => [...prev, newBooking]);
    setUnits(prev =>
      prev.map(u =>
        u.id === bookingData.unitId
          ? { ...u, status: "rented", currentBookingId: newBooking.id }
          : u
      )
    );
    toast.success("Reservation confirmed!");
  };

  const endBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: "completed" } : b))
    );
    setUnits(prev =>
      prev.map(u =>
        u.id === booking.unitId
          ? { ...u, status: "available", currentBookingId: undefined }
          : u
      )
    );
  };

  const getUnitStatus = (id: string) => {
    return units.find(u => u.id === id)?.status || "available";
  };

  return (
    <RentalContext.Provider value={{ units, bookings, addBooking, endBooking, getUnitStatus }}>
      {children}
    </RentalContext.Provider>
  );
}

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) throw new Error("useRental must be used within a RentalProvider");
  return context;
};