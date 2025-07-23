
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function FlightFilters({ filters, setFilters, flights }) {
  const aircraftTypes = [...new Set(flights.map(f => f.aircraft_type))].filter(Boolean);
  const flightModes = [...new Set(flights.flatMap(f => f.hour_breakdown?.map(hb => hb.mode) || []))].filter(Boolean);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      aircraft_type: "all",
      mode_of_flight: "all",
      is_pic: "all",
      date_range: "all",
      date_from: null,
      date_to: null
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Aircraft Type</label>
          <Select
            value={filters.aircraft_type}
            onValueChange={(value) => handleFilterChange("aircraft_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All aircraft" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Aircraft</SelectItem>
              {aircraftTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Flight Mode</label>
          <Select
            value={filters.mode_of_flight}
            onValueChange={(value) => handleFilterChange("mode_of_flight", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {flightModes.map(mode => (
                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">PIC Status</label>
          <Select
            value={filters.is_pic}
            onValueChange={(value) => handleFilterChange("is_pic", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All flights" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flights</SelectItem>
              <SelectItem value="true">PIC Only</SelectItem>
              <SelectItem value="false">Non-PIC Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Quick Ranges</label>
          <Select
            value={filters.date_range}
            onValueChange={(value) => handleFilterChange("date_range", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Custom Date Range</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_from ? format(new Date(filters.date_from), 'dd/MM/yyyy') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date_from ? new Date(filters.date_from) : undefined}
                  onSelect={(date) => {
                    handleFilterChange("date_from", date ? format(date, 'yyyy-MM-dd') : null);
                    // Clear quick range when custom date is selected
                    if (date) {
                      handleFilterChange("date_range", "all");
                    }
                  }}
                  showOutsideDays={true}
                  fixedWeeks={true}
                  defaultMonth={filters.date_from ? new Date(filters.date_from) : new Date()}
                  weekStartsOn={1}
                  className="rounded-md border"
                />
                {filters.date_from && (
                  <div className="p-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange("date_from", null)}
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
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date_to ? format(new Date(filters.date_to), 'dd/MM/yyyy') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date_to ? new Date(filters.date_to) : undefined}
                  onSelect={(date) => {
                    handleFilterChange("date_to", date ? format(date, 'yyyy-MM-dd') : null);
                    // Clear quick range when custom date is selected
                    if (date) {
                      handleFilterChange("date_range", "all");
                    }
                  }}
                  showOutsideDays={true}
                  fixedWeeks={true}
                  defaultMonth={filters.date_to ? new Date(filters.date_to) : new Date()}
                  weekStartsOn={1}
                  className="rounded-md border"
                  disabled={(date) => filters.date_from && date < new Date(filters.date_from)}
                />
                {filters.date_to && (
                  <div className="p-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleFilterChange("date_to", null)}
                      className="w-full"
                    >
                      Clear To Date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          {(filters.date_from || filters.date_to) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                handleFilterChange("date_from", null);
                handleFilterChange("date_to", null);
              }}
              className="w-full text-xs mt-1"
            >
              Clear Date Range
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
