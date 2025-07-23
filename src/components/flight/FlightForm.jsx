
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Minus, Save, Plane, Clock } from "lucide-react";

const AIRCRAFT_TYPES = ["UH-60", "HH-60", "UH-72", "CH-47", "C-12", "AH-64D", "AH-64E", "Custom"];
const FLIGHT_MODES = ["NG", "NS", "D", "H", "W", "N"];
const MISSION_TYPES = ["Training", "Combat", "MTF"];
const PILOT_ROLES = [
  { value: "PIC", label: "PIC (Pilot in Command)" },
  { value: "PI", label: "PI (Pilot)" },
];

const SEAT_OPTIONS = {
  default: [
    { value: "L", label: "Left" },
    { value: "R", label: "Right" },
  ],
  apache: [ // Changed key from "AH-64D || AH-64E" to "apache"
    { value: "F", label: "Front" },
    { value: "B", label: "Back" },
  ],
};

export default function FlightForm({ flight, organizations, user, onSubmit, onCancel }) {
  const [customAircraftTypes, setCustomAircraftTypes] = useState([]);
  const [availableTailNumbers, setAvailableTailNumbers] = useState([]);
  const [formData, setFormData] = useState({
    date: flight?.date || "",
    is_simulator: flight?.is_simulator || false,
    mission_type: flight?.mission_type || "Training",
    aircraft_type: flight?.aircraft_type || "",
    custom_aircraft_type: flight?.custom_aircraft_type || "",
    tail_number: flight?.tail_number || "",
    origin: flight?.origin || "",
    destinations: flight?.destinations || [""],
    copilot_name: flight?.copilot_name || "",
    hour_breakdown: flight?.hour_breakdown || [{ mode: "", duration: "", seat_position: "" }],
    total_flight_hours: flight?.total_flight_hours || 0,
    pilot_role: flight?.pilot_role || "PI",
    is_pic: flight?.is_pic || false,
    remarks: flight?.remarks || "",
    organization_id: flight?.organization_id || ""
  });

  useEffect(() => {
    // Load custom aircraft types from localStorage on component mount
    const savedCustomTypes = localStorage.getItem('customAircraftTypes');
    if (savedCustomTypes) {
      try {
        setCustomAircraftTypes(JSON.parse(savedCustomTypes));
      } catch (error) {
        console.error('Error loading custom aircraft types:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Update available tail numbers when aircraft type changes
    if (user?.personal_aircraft_inventory && formData.aircraft_type) {
      const tails = user.personal_aircraft_inventory
        .filter(ac => {
          if (ac.aircraft_type === "Custom") {
            // If the inventory item is 'Custom', match its custom_aircraft_type
            // with either the selected formData.aircraft_type (if it's a known custom type)
            // or with formData.custom_aircraft_type (if 'Custom' is selected and typing is occurring)
            return ac.custom_aircraft_type === formData.aircraft_type ||
                   (formData.aircraft_type === "Custom" && ac.custom_aircraft_type === formData.custom_aircraft_type);
          } else {
            // For standard aircraft types, match directly
            return ac.aircraft_type === formData.aircraft_type;
          }
        })
        .map(ac => ac.tail_number);
      setAvailableTailNumbers(tails);
    } else {
      setAvailableTailNumbers([]);
    }
  }, [formData.aircraft_type, formData.custom_aircraft_type, user]);

  useEffect(() => {
    const total = formData.hour_breakdown.reduce((sum, item) => sum + (parseFloat(item.duration) || 0), 0);
    handleChange("total_flight_hours", total);
  }, [formData.hour_breakdown]);

  useEffect(() => {
    handleChange("is_pic", formData.pilot_role === "PIC");
  }, [formData.pilot_role]);

  const handleChange = (field, value) => {
    // Capitalize airport codes for origin field
    if (field === "origin") {
      value = value.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSimulatorChange = (checked) => {
    setFormData(prev => {
        const newState = {...prev, is_simulator: checked};
        if(checked) {
            newState.origin = "";
            newState.destinations = [""];
            newState.tail_number = "";
        }
        return newState;
    });
  };

  const saveCustomAircraftType = (customType) => {
    if (customType && customType.trim() && !customAircraftTypes.includes(customType.trim())) {
      const updatedTypes = [...customAircraftTypes, customType.trim()];
      setCustomAircraftTypes(updatedTypes);
      localStorage.setItem('customAircraftTypes', JSON.stringify(updatedTypes));
    }
  };

  const handleDestinationChange = (index, value) => {
    const newDestinations = [...formData.destinations];
    // Capitalize destination airport codes
    newDestinations[index] = value.toUpperCase();
    handleChange("destinations", newDestinations);
  };

  const addDestination = () => handleChange("destinations", [...formData.destinations, ""]);
  const removeDestination = (index) => handleChange("destinations", formData.destinations.filter((_, i) => i !== index));

  const handleHourChange = (index, field, value) => {
    const newBreakdown = [...formData.hour_breakdown];
    newBreakdown[index][field] = value;
    handleChange("hour_breakdown", newBreakdown);
  };

  const addHourEntry = () => handleChange("hour_breakdown", [...formData.hour_breakdown, { mode: "", duration: "", seat_position: "" }]);
  const removeHourEntry = (index) => handleChange("hour_breakdown", formData.hour_breakdown.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save custom aircraft type if one was entered
    if (formData.aircraft_type === "Custom" && formData.custom_aircraft_type.trim()) {
      saveCustomAircraftType(formData.custom_aircraft_type.trim());
    }

    const submitData = {
      ...formData,
      origin: formData.origin.toUpperCase(), // Ensure origin is capitalized
      destinations: formData.destinations
        .filter(dest => dest && dest.trim())
        .map(dest => dest.toUpperCase()), // Ensure all destinations are capitalized
      hour_breakdown: formData.hour_breakdown.filter(item => item.mode && item.duration > 0).map(item => ({...item, duration: parseFloat(item.duration)})),
    };
    onSubmit(submitData);
  };

  // Create combined aircraft types list
  const allAircraftTypes = [
    ...AIRCRAFT_TYPES.filter(type => type !== "Custom"),
    ...customAircraftTypes,
    "Custom"
  ];

  // Corrected logic for seat options
  const seatOptions = (formData.aircraft_type === 'AH-64D' || formData.aircraft_type === 'AH-64E')
    ? SEAT_OPTIONS.apache
    : SEAT_OPTIONS.default;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Plane className="w-5 h-5" />
          {flight ? "Edit Flight Entry" : "New Flight Entry"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Flight Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilot_role">Pilot Role</Label>
              <Select value={formData.pilot_role} onValueChange={(value) => handleChange("pilot_role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pilot role" />
                </SelectTrigger>
                <SelectContent>
                  {PILOT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mission_type">Mission Type</Label>
              <Select value={formData.mission_type} onValueChange={(value) => handleChange("mission_type", value)}>
                <SelectTrigger><SelectValue placeholder="Select mission type" /></SelectTrigger>
                <SelectContent>
                  {MISSION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraft_type">Aircraft Type</Label>
              <Select value={formData.aircraft_type} onValueChange={(value) => handleChange("aircraft_type", value)}>
                <SelectTrigger><SelectValue placeholder="Select aircraft type" /></SelectTrigger>
                <SelectContent>
                  {allAircraftTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                      {customAircraftTypes.includes(type) && <span className="ml-2 text-xs text-blue-600">(Custom)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="tail_number">Tail Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tail_number"
                    value={formData.tail_number}
                    onChange={(e) => handleChange("tail_number", e.target.value)}
                    placeholder="e.g., N12345"
                    disabled={formData.is_simulator}
                    required={!formData.is_simulator}
                    className="flex-grow"
                  />
                  {availableTailNumbers.length > 0 && !formData.is_simulator && (
                     <Select onValueChange={(value) => handleChange("tail_number", value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select saved" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTailNumbers.map(tail => (
                            <SelectItem key={tail} value={tail}>{tail}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  )}
                </div>
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="is_simulator"
                        checked={formData.is_simulator}
                        onCheckedChange={handleSimulatorChange}
                    />
                    <Label htmlFor="is_simulator" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        This is a simulator session
                    </Label>
                </div>
              </div>
            {formData.aircraft_type === "Custom" && (
                <div className="space-y-2">
                <Label htmlFor="custom_aircraft_type">Custom Aircraft Type</Label>
                <Input
                  id="custom_aircraft_type"
                  value={formData.custom_aircraft_type}
                  onChange={(e) => handleChange("custom_aircraft_type", e.target.value)}
                  placeholder="Enter custom aircraft type"
                />
                {customAircraftTypes.length > 0 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Previously used: {customAircraftTypes.join(", ")}
                  </div>
                )}
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" value={formData.origin} onChange={(e) => handleChange("origin", e.target.value)} placeholder="Departure location" required={!formData.is_simulator} disabled={formData.is_simulator} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copilot_name">Co-pilot Name</Label>
              <Input id="copilot_name" value={formData.copilot_name} onChange={(e) => handleChange("copilot_name", e.target.value)} placeholder="Co-pilot name"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Destinations</Label>
            {formData.destinations.map((destination, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={destination} onChange={(e) => handleDestinationChange(index, e.target.value)} placeholder={`Destination ${index + 1}`} disabled={formData.is_simulator} />
                {formData.destinations.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeDestination(index)} disabled={formData.is_simulator}><Minus className="w-4 h-4" /></Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDestination} className="flex items-center gap-2" disabled={formData.is_simulator}><Plus className="w-4 h-4" />Add Destination</Button>
          </div>

          <div className="space-y-2">
            <Label>Flight Hours Breakdown</Label>
            {formData.hour_breakdown.map((item, index) => (
              <div key={index} className="grid grid-cols-3 items-center gap-2">
                <Select value={item.mode} onValueChange={(value) => handleHourChange(index, "mode", value)}>
                  <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>{FLIGHT_MODES.map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={item.seat_position} onValueChange={(value) => handleHourChange(index, "seat_position", value)}>
                  <SelectTrigger><SelectValue placeholder="Seat" /></SelectTrigger>
                  <SelectContent>{seatOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.1" min="0" value={item.duration} onChange={(e) => handleHourChange(index, "duration", e.target.value)} placeholder="Hours" />
                  {formData.hour_breakdown.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeHourEntry(index)}><Minus className="w-4 h-4" /></Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addHourEntry} className="flex items-center gap-2"><Plus className="w-4 h-4" />Add Hour Entry</Button>
            <div className="mt-4 flex items-center justify-end gap-2 text-lg font-semibold text-slate-800">
              <Clock className="w-5 h-5" />
              Total Hours: {formData.total_flight_hours.toFixed(1)}
            </div>
          </div>

          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="organization_id">Organization (Optional)</Label>
              <Select
                value={formData.organization_id || "none-value"}
                onValueChange={(value) => {
                  const finalValue = value === "none-value" ? "" : value;
                  handleChange("organization_id", finalValue);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select organization" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none-value">None</SelectItem>
                  {organizations.map(org => <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" value={formData.remarks} onChange={(e) => handleChange("remarks", e.target.value)} placeholder="Additional notes..." className="min-h-20" />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2" />{flight ? "Update Flight" : "Save Flight"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
