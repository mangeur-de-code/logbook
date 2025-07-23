
import React, { useState, useEffect } from "react";
import { Flight, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added Table imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar as CalendarIcon, Download, TrendingUp, Clock, Plane, Computer, Target } from "lucide-react";
import { format, subDays, subMonths, isAfter, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from "date-fns";
import StatsCard from "../components/dashboard/StatsCard";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ReportsPage() {
  const [flights, setFlights] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("12months");
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [reportData, setReportData] = useState({
    monthlyHours: [],
    aircraftTypes: [],
    modeBreakdown: [],
    detailedAircraftHours: [], // Added for individual aircraft tracking, renamed to avoid conflict
    picHours: 0,
    totalHours: 0,
    aircraftHours: 0, // This is the summary of aircraft hours (number)
    simulatorHours: 0,
    flightCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (flights.length > 0) {
      generateReportData();
    }
  }, [flights, dateRange, customDateFrom, customDateTo, user]); // Added user to dependencies as it's used in generateReportData

  const loadData = async () => {
    try {
      const [flightData, userData] = await Promise.all([
        Flight.list("-date"),
        User.me()
      ]);
      setFlights(flightData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    // If custom dates are set, use them instead of quick ranges
    if (customDateFrom || customDateTo) {
      return {
        start: customDateFrom || subMonths(new Date(), 12),
        end: customDateTo || new Date(),
        isCustom: true
      };
    }

    const now = new Date();
    let start;
    switch (dateRange) {
      case "7days": start = subDays(now, 7); break;
      case "30days": start = subDays(now, 30); break;
      case "3months": start = subMonths(now, 3); break;
      case "6months": start = subMonths(now, 6); break;
      case "12months": start = subMonths(now, 12); break;
      case "24months": start = subMonths(now, 24); break;
      default: start = subMonths(now, 12);
    }
    return { start, end: now, isCustom: false };
  };

  const generateReportData = () => {
    const { start: startDate, end: endDate } = getDateRangeFilter();
    const filteredFlights = flights.filter(flight => {
      const flightDate = new Date(flight.date);
      return isWithinInterval(flightDate, { start: startDate, end: endDate });
    });

    // Monthly hours data
    const monthsInRange = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });

    const monthlyData = monthsInRange.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthFlights = filteredFlights.filter(flight => {
        const flightDate = new Date(flight.date);
        return flightDate >= monthStart && flightDate <= monthEnd;
      });

      const aircraftHours = monthFlights
        .filter(f => !f.is_simulator)
        .reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);
      
      const simHours = monthFlights
        .filter(f => f.is_simulator)
        .reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);

      return {
        month: format(month, "MMM yyyy"),
        aircraft: parseFloat(aircraftHours.toFixed(1)),
        simulator: parseFloat(simHours.toFixed(1)),
        total: parseFloat((aircraftHours + simHours).toFixed(1))
      };
    });

    // Aircraft types breakdown
    const aircraftCounts = {};
    filteredFlights.forEach(flight => {
      const type = flight.aircraft_type === "Custom" ? flight.custom_aircraft_type : flight.aircraft_type;
      // Add a (Sim) label to simulator types to distinguish them in the chart
      const typeLabel = `${type}${flight.is_simulator ? ' (Sim)' : ''}`;
      aircraftCounts[typeLabel] = (aircraftCounts[typeLabel] || 0) + (flight.total_flight_hours || 0);
    });

    const aircraftTypesData = Object.entries(aircraftCounts)
      .map(([type, hours]) => ({ name: type, hours: parseFloat(hours.toFixed(1)) }))
      .sort((a, b) => b.hours - a.hours);

    // Individual aircraft hours tracking
    const aircraftHoursData = [];
    if (user?.personal_aircraft_inventory) {
      user.personal_aircraft_inventory.forEach(aircraft => {
        const hoursFlown = filteredFlights
          .filter(flight => 
            flight.tail_number === aircraft.tail_number && 
            !flight.is_simulator
          )
          .reduce((sum, flight) => sum + (flight.total_flight_hours || 0), 0);
        
        const flightCount = filteredFlights
          .filter(flight => 
            flight.tail_number === aircraft.tail_number && 
            !flight.is_simulator
          ).length;

        if (hoursFlown > 0 || flightCount > 0) {
          aircraftHoursData.push({
            tail_number: aircraft.tail_number,
            aircraft_type: aircraft.aircraft_type === "Custom" ? aircraft.custom_aircraft_type : aircraft.aircraft_type,
            hours_flown: parseFloat(hoursFlown.toFixed(1)),
            flight_count: flightCount
          });
        }
      });
    }

    // Sort aircraft by hours flown (descending)
    aircraftHoursData.sort((a, b) => b.hours_flown - a.hours_flown);

    // Mode breakdown
    const modeCounts = {};
    filteredFlights.forEach(flight => {
      flight.hour_breakdown?.forEach(breakdown => {
        modeCounts[breakdown.mode] = (modeCounts[breakdown.mode] || 0) + (breakdown.duration || 0);
      });
    });

    const modeData = Object.entries(modeCounts)
      .map(([mode, hours]) => ({ name: mode, hours: parseFloat(hours.toFixed(1)) }))
      .sort((a, b) => b.hours - a.hours);

    // Summary statistics
    const totalHours = filteredFlights.reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);
    const aircraftHours = filteredFlights.filter(f => !f.is_simulator).reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);
    const simulatorHours = filteredFlights.filter(f => f.is_simulator).reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);
    const picHours = filteredFlights.filter(f => f.is_pic).reduce((sum, f) => sum + (f.total_flight_hours || 0), 0);

    setReportData({
      monthlyHours: monthlyData,
      aircraftTypes: aircraftTypesData,
      modeBreakdown: modeData,
      detailedAircraftHours: aircraftHoursData, // Assign the newly calculated data
      totalHours: parseFloat(totalHours.toFixed(1)),
      aircraftHours: parseFloat(aircraftHours.toFixed(1)),
      simulatorHours: parseFloat(simulatorHours.toFixed(1)),
      picHours: parseFloat(picHours.toFixed(1)),
      flightCount: filteredFlights.length
    });
  };

  const handleCustomDateChange = (type, date) => {
    if (type === 'from') {
      setCustomDateFrom(date);
      // Clear quick range when custom date is selected
      if (date) setDateRange("custom");
    } else {
      setCustomDateTo(date);
      // Clear quick range when custom date is selected
      if (date) setDateRange("custom");
    }
  };

  const clearCustomDates = () => {
    setCustomDateFrom(null);
    setCustomDateTo(null);
    setDateRange("12months");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading flight reports...</p>
        </div>
      </div>
    );
  }

  const { start: currentStart, end: currentEnd, isCustom } = getDateRangeFilter();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Flight Reports</h1>
            <p className="text-slate-600 mt-1">
              Comprehensive analysis of your flight activity and progress
            </p>
            {isCustom && (
              <p className="text-sm text-blue-600 mt-1">
                Custom range: {format(currentStart, "MMM d, yyyy")} - {format(currentEnd, "MMM d, yyyy")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Select 
                value={customDateFrom || customDateTo ? "custom" : dateRange} 
                onValueChange={(value) => {
                  if (value !== "custom") {
                    setDateRange(value);
                    setCustomDateFrom(null);
                    setCustomDateTo(null);
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="24months">Last 24 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateFrom ? format(customDateFrom, 'MMM d, yyyy') : 'From Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateFrom}
                    onSelect={(date) => handleCustomDateChange('from', date)}
                    showOutsideDays={true}
                    fixedWeeks={true}
                    defaultMonth={customDateFrom || new Date()}
                    weekStartsOn={1}
                    className="rounded-md border"
                  />
                  {customDateFrom && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCustomDateChange('from', null)}
                        className="w-full"
                      >
                        Clear From Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateTo ? format(customDateTo, 'MMM d, yyyy') : 'To Date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateTo}
                    onSelect={(date) => handleCustomDateChange('to', date)}
                    showOutsideDays={true}
                    fixedWeeks={true}
                    defaultMonth={customDateTo || new Date()}
                    weekStartsOn={1}
                    className="rounded-md border"
                    disabled={(date) => customDateFrom && date < customDateFrom}
                  />
                  {customDateTo && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCustomDateChange('to', null)}
                        className="w-full"
                      >
                        Clear To Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {(customDateFrom || customDateTo) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearCustomDates}
                >
                  Clear Custom Range
                </Button>
              )}
            </div>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Flight Hours"
            value={reportData.totalHours}
            icon={Clock}
            color="blue"
            subtitle="Aircraft + Simulator"
          />
          <StatsCard
            title="Aircraft Hours"
            value={reportData.aircraftHours}
            icon={Plane}
            color="green"
            subtitle="Real aircraft only"
          />
          <StatsCard
            title="Simulator Hours"
            value={reportData.simulatorHours}
            icon={Computer}
            color="purple"
            subtitle="Total simulator hrs"
          />
          <StatsCard
            title="PIC Hours"
            value={reportData.picHours}
            icon={Target}
            color="orange"
            subtitle="Pilot in command"
          />
        </div>

        {/* Individual Aircraft Hours Tracking */}
        {reportData.detailedAircraftHours.length > 0 && (
          <Card className="bg-white shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                My Aircraft Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tail Number</TableHead>
                      <TableHead>Aircraft Type</TableHead>
                      <TableHead className="text-right">Flight Count</TableHead>
                      <TableHead className="text-right">Hours Flown</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.detailedAircraftHours.map((aircraft) => (
                      <TableRow key={aircraft.tail_number}>
                        <TableCell className="font-medium">
                          {aircraft.tail_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {aircraft.aircraft_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {aircraft.flight_count}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {aircraft.hours_flown}h
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Monthly Flight Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.monthlyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="aircraft" stackId="a" fill="#3B82F6" name="Aircraft" />
                  <Bar dataKey="simulator" stackId="a" fill="#8B5CF6" name="Simulator" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Aircraft & Simulator Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.aircraftTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {reportData.aircraftTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value.toFixed(1)}h`, name]}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle>Flight Mode Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.modeBreakdown.map((mode, index) => (
                  <div key={mode.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{mode.name}</span>
                    </div>
                    <Badge variant="outline">{mode.hours}h</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle>Flight Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.monthlyHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
