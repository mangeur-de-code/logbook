
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

const AIRCRAFT_TYPES = ["UH-60", "HH-60", "UH-72", "CH-47", "C-12", "AH-64", "AH-64E"];
const AIRCRAFT_STATUSES = ["Active", "Maintenance", "Inactive"];

export default function AddAircraftForm({ aircraft, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    tail_number: aircraft?.tail_number || "",
    aircraft_type: aircraft?.aircraft_type || "",
    status: aircraft?.status || "Active",
    total_hours: aircraft?.total_hours || 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {aircraft ? "Edit Aircraft" : "Add New Aircraft"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tail_number">Tail Number</Label>
              <Input
                id="tail_number"
                value={formData.tail_number}
                onChange={(e) => handleChange("tail_number", e.target.value)}
                placeholder="e.g., 12-345"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraft_type">Aircraft Type</Label>
              <Select 
                value={formData.aircraft_type} 
                onValueChange={(value) => handleChange("aircraft_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft type" />
                </SelectTrigger>
                <SelectContent>
                  {AIRCRAFT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {AIRCRAFT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_hours">Total Hours</Label>
              <Input
                id="total_hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.total_hours}
                onChange={(e) => handleChange("total_hours", parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {aircraft ? "Update Aircraft" : "Add Aircraft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
