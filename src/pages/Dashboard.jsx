
import React, { useState, useEffect } from "react";
import { Flight, Organization, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Clock,
  Plane,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Plus,
  Target,
  Users,
  Computer,
  User as UserIcon, // Added UserIcon import
} from "lucide-react";
import { format, subDays, isAfter, differenceInDays, startOfDay } from "date-fns";
import StatsCard from "../components/dashboard/StatsCard";
import CurrencyStatus from "../components/dashboard/CurrencyStatus";
import RecentFlights from "../components/dashboard/RecentFlights";
import CustomFieldStatus from "../components/dashboard/CustomFieldStatus";
import SemiannualStatus from "../components/dashboard/SemiannualStatus";

export default function Dashboard() {
  const [flights, setFlights] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currencyStatus, setCurrencyStatus] = useState({ ng: 0, ns: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all data in parallel but with error handling
      const [userData, orgData] = await Promise.all([
        User.me().catch(err => {
          console.error("Error loading user:", err);
          return null;
        }),
        Organization.list().catch(err => {
          console.error("Error loading organizations:", err);
          return [];
        })
      ]);

      setUser(userData);
      setOrganizations(orgData);

      // Load flight data with retry logic
      let flightData = [];
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          flightData = await Flight.list("-date");
          break;
        } catch (error) {
          retryCount++;
          if (error.response?.status === 429) {
            // Rate limit hit, wait before retry
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            throw error;
          }
        }
      }

      setFlights(flightData);

      // Calculate currency status with user settings and normalized dates
      if (userData && flightData.length > 0) {
        const settings = userData.currency_settings || { ng_required_hours: 6, ns_required_hours: 6, currency_period_days: 60 };
        const lookbackDate = startOfDay(subDays(new Date(), settings.currency_period_days));
        const recentFlights = flightData.filter(flight => {
          const flightDate = startOfDay(new Date(flight.date));
          return isAfter(flightDate, lookbackDate) || flightDate.getTime() === lookbackDate.getTime();
        });

        let ngHours = 0;
        let nsHours = 0;

        recentFlights.forEach(flight => {
          flight.hour_breakdown?.forEach(breakdown => {
            if (breakdown.mode === 'NG') {
              ngHours += breakdown.duration;
            }
            if (breakdown.mode === 'NS') {
              nsHours += breakdown.duration;
            }
          });
        });

        setCurrencyStatus({ ng: ngHours, ns: nsHours });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAircraftHours = flights
    .filter(flight => !flight.is_simulator)
    .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);
  const last30DaysAircraftHours = flights
    .filter(flight => !flight.is_simulator && isAfter(new Date(flight.date), subDays(new Date(), 30)))
    .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);
  const picHours = flights
    .filter(flight => flight.is_pic)
    .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);
  const piHours = flights // Added calculation for PI Hours
    .filter(flight => !flight.is_pic)
    .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);
  const simHours = flights
    .filter(flight => flight.is_simulator)
    .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);

  const aircraftTypes = [...new Set(flights.filter(f => !f.is_simulator).map(f => f.aircraft_type))];
  const recentFlights = flights.slice(0, 5);
  
  const displayName = (user?.first_name && user?.last_name) 
    ? `${user.first_name} ${user.last_name}` 
    : (user?.full_name || 'Pilot');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading flight data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Flight Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {displayName}. Here's your flight status overview.
              </p>
            </div>
            <Link to={createPageUrl("FlightLog")}>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Log New Flight
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Flight Hours"
              value={totalAircraftHours.toFixed(1)}
              icon={Clock}
              color="blue"
              subtitle="Total aircraft hrs"
            />
            <StatsCard
              title="Last 30 Days Aircraft"
              value={last30DaysAircraftHours.toFixed(1)}
              icon={TrendingUp}
              color="green"
              subtitle="Recent aircraft activity"
            />
            {picHours > 0 ? ( // Conditional rendering based on picHours
              <StatsCard
                title="PIC Hours"
                value={picHours.toFixed(1)}
                icon={Target}
                color="purple"
                subtitle="Pilot in command"
              />
            ) : (
              <StatsCard
                title="PI Hours"
                value={piHours.toFixed(1)}
                icon={UserIcon}
                color="orange"
                subtitle="Pilot hours"
              />
            )}
            <StatsCard
              title="Simulator Hours"
              value={simHours.toFixed(1)}
              icon={Computer}
              color="cyan"
              subtitle="Total simulator hrs"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <CurrencyStatus currencyStatus={currencyStatus} user={user} />
              {user?.semiannual_settings?.period_one_start && (
                <SemiannualStatus user={user} flights={flights} />
              )}
            </div>
            <div className="space-y-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={createPageUrl("FlightLog")}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Log New Flight
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Reports")}>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Organizations")}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Organizations
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              {user?.custom_tracking_fields?.length > 0 && (
                <CustomFieldStatus user={user} />
              )}
            </div>
          </div>

          <RecentFlights flights={recentFlights} />
        </div>
      </div>
    </div>
  );
}
