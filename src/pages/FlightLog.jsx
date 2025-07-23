
import React, { useState, useEffect } from "react";
import { Flight, Organization, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FlightForm from "../components/flight/FlightForm";
import FlightList from "../components/flight/FlightList";
import FlightFilters from "../components/flight/FlightFilters";

export default function FlightLog() {
  const [flights, setFlights] = useState([]);
  const [user, setUser] = useState(null); // Add user state
  const [organizations, setOrganizations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    aircraft_type: "all",
    mode_of_flight: "all",
    is_pic: "all",
    date_range: "all",
    date_from: null,
    date_to: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flightData, orgData, userData] = await Promise.all([
        Flight.list("-date"),
        Organization.list(),
        User.me() // Fetch current user
      ]);
      
      setFlights(flightData);
      setOrganizations(orgData);
      setUser(userData); // Set user data
    } catch (error) {
      console.error("Error loading flight data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationAircraftHours = async (flight) => {
    if (!flight || flight.is_simulator || !flight.tail_number) return;
    
    const allOrgs = await Organization.list();
    const aircraftOrg = allOrgs.find(org => 
        org.aircraft_inventory?.some(ac => ac.tail_number === flight.tail_number)
    );

    if (aircraftOrg) {
        const updatedInventory = aircraftOrg.aircraft_inventory.map(ac => {
            if (ac.tail_number === flight.tail_number) {
                const newTotalHours = (ac.total_hours || 0) + flight.total_flight_hours;
                return { ...ac, total_hours: newTotalHours };
            }
            return ac;
        });
        
        // Include all required fields when updating
        await Organization.update(aircraftOrg.id, { 
          name: aircraftOrg.name,
          id_code: aircraftOrg.id_code,
          description: aircraftOrg.description,
          aircraft_inventory: updatedInventory,
          member_emails: aircraftOrg.member_emails,
          admin_emails: aircraftOrg.admin_emails
        });
    }
  }

  const handleSubmit = async (flightData) => {
    try {
      if (editingFlight) {
        // Note: updating organization hours on flight edit is complex and not implemented
        // to avoid double-counting or incorrect calculations.
        await Flight.update(editingFlight.id, flightData);
      } else {
        const newFlight = await Flight.create(flightData);
        await updateOrganizationAircraftHours(newFlight);
      }
      setShowForm(false);
      setEditingFlight(null);
      loadData();
    } catch (error) {
      console.error("Error saving flight:", error);
      // The backend error for a missing field is a 422 with a message containing 'id_code'
      if (error.response?.status === 422 && error.response?.data?.message?.includes("id_code")) {
        alert("Flight saved, but could not update organization hours. The associated organization is missing a required ID code. Please add it on the Organizations page.");
        // The flight was saved, so we should close the form and refresh.
        setShowForm(false);
        setEditingFlight(null);
        loadData();
      } else {
        alert("An error occurred while saving the flight. Please try again.");
      }
    }
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setShowForm(true);
  };

  const handleDelete = async (flightId) => {
    try {
      // Note: decrementing organization hours on delete is also complex and not implemented.
      await Flight.delete(flightId);
      loadData();
    } catch (error) {
      console.error("Error deleting flight:", error);
      // Check if the error is because the flight was already deleted
      if (error.response?.status === 404 || error.message?.includes("Entity not found")) {
        // Flight was already deleted, just refresh the data
        loadData();
      } else {
        // Show a user-friendly error message for other errors
        alert("An error occurred while deleting the flight. Please try again.");
      }
    }
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.tail_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.aircraft_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flight.custom_aircraft_type && flight.custom_aircraft_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destinations?.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = 
      (filters.aircraft_type === "all" || flight.aircraft_type === filters.aircraft_type) &&
      (filters.mode_of_flight === "all" || flight.hour_breakdown?.some(hb => hb.mode === filters.mode_of_flight)) &&
      (filters.is_pic === "all" || flight.is_pic === (filters.is_pic === "true"));
    
    // Date filtering
    let matchesDate = true;
    
    // Custom date range takes priority
    if (filters.date_from || filters.date_to) {
      const flightDate = new Date(flight.date);
      // Set hours to 0 to ensure comparison is based purely on date
      const fromDate = filters.date_from ? new Date(filters.date_from) : null;
      if (fromDate) fromDate.setHours(0,0,0,0);
      
      const toDate = filters.date_to ? new Date(filters.date_to) : null;
      if (toDate) toDate.setHours(23,59,59,999); // Set to end of the day

      matchesDate = true;
      if (fromDate) {
        matchesDate = matchesDate && flightDate >= fromDate;
      }
      if (toDate) {
        matchesDate = matchesDate && flightDate <= toDate;
      }
    } else if (filters.date_range !== "all") {
      // Fall back to quick range filters
      const flightDate = new Date(flight.date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.date_range));
      matchesDate = flightDate >= cutoffDate;
    }
    
    return matchesSearch && matchesFilters && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading flight log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Flight Log</h1>
            <p className="text-slate-600 mt-1">
              Track and manage your flight hours
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Flight Entry
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <FlightForm
                flight={editingFlight}
                organizations={organizations}
                user={user} // Pass user to form
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingFlight(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
              <div className="text-sm text-slate-600">
                {filteredFlights.length} of {flights.length} flights
              </div>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="border-t">
              <FlightFilters
                filters={filters}
                setFilters={setFilters}
                flights={flights}
              />
            </CardContent>
          )}
        </Card>

        <FlightList
          flights={filteredFlights}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
