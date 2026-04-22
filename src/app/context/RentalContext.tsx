import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../utils/supabase/client"; // Pastikan path ini benar

export interface Booking {
  id: string;
  unitId: string;
  customerName: string;
  startTime: string; 
  durationHours: number;
  totalCost: number;
  status: "active" | "completed" | "cancelled";
}

export interface Unit {
  id: string;
  name: string;
  type: "PS5" | "PS4 Pro" | "PS5 Digital";
  pricePerHour: number;
  status: "available" | "rented" | "maintenance";
}

interface RentalContextType {
  units: Unit[];
  bookings: Booking[];
  loading: boolean;
  addBooking: (booking: Omit<Booking, "id" | "status">) => Promise<void>;
  endBooking: (id: string) => Promise<void>;
  getUnitStatus: (id: string) => Unit["status"];
  refreshData: () => Promise<void>;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export function RentalProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Ambil data Unit
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .order('id', { ascending: true });
      
      // 2. Ambil data Booking
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔥 MAPPING: Terjemahkan snake_case database ke camelCase React
      if (unitsData) {
        const formattedUnits = unitsData.map(u => ({
          id: u.id,
          name: u.name,
          type: u.type,
          pricePerHour: u.price_per_hour, // Mapping price_per_hour -> pricePerHour
          status: u.status
        }));
        setUnits(formattedUnits as any);
      }

      if (bookingsData) {
        const formattedBookings = bookingsData.map(b => ({
          id: b.id,
          unitId: b.unit_id,      // Mapping unit_id -> unitId
          customerName: b.customer_name,
          startTime: b.start_time,
          durationHours: b.duration,
          totalCost: b.total_cost,
          status: b.status
        }));
        setBookings(formattedBookings as any);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, "id" | "status">) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          unit_id: bookingData.unitId,
          customer_name: bookingData.customerName,
          duration: bookingData.durationHours,
          total_cost: bookingData.totalCost,
          status: 'active',
          start_time: new Date().toISOString()
        }]);

      if (error) throw error;

      // Update status unit menjadi 'rented'
      await supabase
        .from('units')
        .update({ status: 'rented' })
        .eq('id', bookingData.unitId);
      
      await refreshData();
      toast.success("Reservasi berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan reservasi");
      console.error(error);
    }
  };

  const endBooking = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      // Balikkan status unit menjadi 'available'
      await supabase
        .from('units')
        .update({ status: 'available' })
        .eq('id', booking.unitId);

      await refreshData();
      toast.info(`Rental telah selesai.`);
    } catch (error) {
      console.error(error);
    }
  };

  const getUnitStatus = (id: string) => {
    return units.find(u => u.id === id)?.status || "available";
  };

  return (
    <RentalContext.Provider value={{ units, bookings, loading, addBooking, endBooking, getUnitStatus, refreshData }}>
      {children}
    </RentalContext.Provider>
  );
}

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) throw new Error("useRental must be used within a RentalProvider");
  return context;
};