
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";
import AddAircraftForm from "./AddAircraftForm";

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Maintenance: "bg-yellow-100 text-yellow-800",
  Inactive: "bg-slate-100 text-slate-800",
};

export default function AircraftInventory({ organization, isUserAdmin, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [sortField, setSortField] = useState("tail_number");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAircraft = [...(organization.aircraft_inventory || [])].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === "asc" 
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const handleAddAircraft = (aircraftData) => {
    // Check if organization has id_code
    if (!organization.id_code) {
      alert("Cannot add aircraft: this organization is missing a required ID code. Please edit the organization details to add an ID code first.");
      return;
    }
    
    const updatedInventory = [...(organization.aircraft_inventory || []), aircraftData];
    onUpdate(organization.id, { 
      aircraft_inventory: updatedInventory
    });
    setShowAddForm(false);
  };

  const handleEditAircraft = (aircraftData) => {
    // Check if organization has id_code
    if (!organization.id_code) {
      alert("Cannot edit aircraft: this organization is missing a required ID code. Please edit the organization details to add an ID code first.");
      return;
    }
    
    const updatedInventory = organization.aircraft_inventory.map(ac => 
      ac.tail_number === editingAircraft.tail_number ? aircraftData : ac
    );
    onUpdate(organization.id, { 
      aircraft_inventory: updatedInventory
    });
    setEditingAircraft(null);
  };
  
  const handleRemoveAircraft = (tailNumber) => {
    // Check if organization has id_code
    if (!organization.id_code) {
      alert("Cannot remove aircraft: this organization is missing a required ID code. Please edit the organization details to add an ID code first.");
      return;
    }
    
    const updatedInventory = organization.aircraft_inventory.filter(ac => ac.tail_number !== tailNumber);
    onUpdate(organization.id, { 
      aircraft_inventory: updatedInventory
    });
  };

  if (showAddForm || editingAircraft) {
    return (
      <AddAircraftForm
        aircraft={editingAircraft}
        onSubmit={editingAircraft ? handleEditAircraft : handleAddAircraft}
        onCancel={() => {
          setShowAddForm(false);
          setEditingAircraft(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("tail_number")}
                  className="flex items-center gap-2 p-0 h-auto"
                >
                  Tail Number
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("aircraft_type")}
                  className="flex items-center gap-2 p-0 h-auto"
                >
                  Aircraft Type
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 p-0 h-auto"
                >
                  Status
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort("total_hours")}
                  className="flex items-center gap-2 p-0 h-auto"
                >
                  Total Hours
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </TableHead>
              {isUserAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAircraft.map((aircraft) => (
              <TableRow key={aircraft.tail_number}>
                <TableCell className="font-medium">{aircraft.tail_number}</TableCell>
                <TableCell>{aircraft.aircraft_type}</TableCell>
                <TableCell>
                  <Badge className={statusColors[aircraft.status]}>{aircraft.status}</Badge>
                </TableCell>
                <TableCell>{(aircraft.total_hours || 0).toFixed(1)}h</TableCell>
                {isUserAdmin && (
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mr-2"
                      onClick={() => setEditingAircraft(aircraft)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveAircraft(aircraft.tail_number)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isUserAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Aircraft
          </Button>
        </div>
      )}
    </div>
  );
}
