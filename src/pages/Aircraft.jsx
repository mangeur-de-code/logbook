
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Plane, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AIRCRAFT_TYPES = ["UH-60", "HH-60", "UH-72", "CH-47", "C-12", "AH-64", "AH-64E"];

export default function AircraftPage() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [customAircraftTypes, setCustomAircraftTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [formData, setFormData] = useState({ aircraft_type: "", tail_number: "", custom_aircraft_type: "" });

  useEffect(() => {
    loadUser();
    loadCustomAircraftTypes();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setInventory(userData.personal_aircraft_inventory || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomAircraftTypes = () => {
    const savedCustomTypes = localStorage.getItem('customAircraftTypes');
    if (savedCustomTypes) {
      try {
        setCustomAircraftTypes(JSON.parse(savedCustomTypes));
      } catch (error) {
        console.error('Error loading custom aircraft types:', error);
      }
    }
  };

  const saveCustomAircraftType = (customType) => {
    if (customType && customType.trim() && !customAircraftTypes.includes(customType.trim())) {
      const updatedTypes = [...customAircraftTypes, customType.trim()];
      setCustomAircraftTypes(updatedTypes);
      localStorage.setItem('customAircraftTypes', JSON.stringify(updatedTypes));
      return true;
    }
    return false;
  };

  const handleUpdateInventory = async (newInventory) => {
    setSaving(true);
    try {
      await User.updateMyUserData({ personal_aircraft_inventory: newInventory });
      setInventory(newInventory);
    } catch (error) {
      console.error("Error saving inventory:", error);
      alert("Failed to save aircraft inventory. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openForm = (aircraft = null) => {
    if (aircraft) {
      setEditingAircraft(aircraft);
      setFormData({ 
        aircraft_type: aircraft.aircraft_type, 
        tail_number: aircraft.tail_number,
        custom_aircraft_type: aircraft.custom_aircraft_type || ""
      });
    } else {
      setEditingAircraft(null);
      setFormData({ aircraft_type: "", tail_number: "", custom_aircraft_type: "" });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAircraft(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalAircraftType = formData.aircraft_type;
    let customAircraftType = "";

    // Handle custom aircraft type
    if (formData.aircraft_type === "Custom") {
      if (!formData.custom_aircraft_type.trim()) {
        alert("Please enter a custom aircraft type.");
        return;
      }
      finalAircraftType = "Custom";
      customAircraftType = formData.custom_aircraft_type.trim();
      
      // Save the custom type to localStorage
      saveCustomAircraftType(customAircraftType);
    } else if (customAircraftTypes.includes(formData.aircraft_type)) {
      // This is a previously saved custom type
      finalAircraftType = "Custom";
      customAircraftType = formData.aircraft_type;
    }

    if (!finalAircraftType || !formData.tail_number) {
      alert("Please fill out both aircraft type and tail number.");
      return;
    }

    let updatedInventory;
    if (editingAircraft) {
      updatedInventory = inventory.map(item =>
        item.id === editingAircraft.id ? { 
          ...item, 
          aircraft_type: finalAircraftType,
          custom_aircraft_type: customAircraftType,
          tail_number: formData.tail_number
        } : item
      );
    } else {
      const newAircraft = { 
        id: Date.now().toString(),
        aircraft_type: finalAircraftType,
        custom_aircraft_type: customAircraftType,
        tail_number: formData.tail_number
      };
      updatedInventory = [...inventory, newAircraft];
    }
    handleUpdateInventory(updatedInventory);
    closeForm();
  };

  const handleDelete = (id) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    handleUpdateInventory(updatedInventory);
  };

  const handleDeleteCustomType = (typeToDelete) => {
    // 1. Remove associated aircraft from inventory
    const updatedInventory = inventory.filter(item => item.custom_aircraft_type !== typeToDelete);
    handleUpdateInventory(updatedInventory);

    // 2. Remove from custom types list and update localStorage
    const updatedCustomTypes = customAircraftTypes.filter(type => type !== typeToDelete);
    setCustomAircraftTypes(updatedCustomTypes);
    localStorage.setItem('customAircraftTypes', JSON.stringify(updatedCustomTypes));
  };

  // Create combined aircraft types list including custom types
  const allAircraftTypes = [
    ...AIRCRAFT_TYPES,
    ...customAircraftTypes,
    "Custom"
  ];

  // Group inventory by display name (custom types show their custom name)
  const groupedInventory = inventory.reduce((acc, item) => {
    const displayType = item.aircraft_type === "Custom" ? item.custom_aircraft_type : item.aircraft_type;
    (acc[displayType] = acc[displayType] || []).push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Aircraft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Aircraft List
</h1>
            <p className="text-slate-600 mt-1">
              Manage your personal inventory of aircraft and tail numbers.
            </p>
          </div>
          <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Aircraft
          </Button>
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle>{editingAircraft ? "Edit Aircraft" : "Add New Aircraft"}</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aircraft_type">Aircraft Type</Label>
                        <Select value={formData.aircraft_type} onValueChange={(value) => handleFormChange("aircraft_type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {AIRCRAFT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            {customAircraftTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type} <span className="text-xs text-blue-600 ml-1">(Custom)</span>
                              </SelectItem>
                            ))}
                            <SelectItem value="Custom">+ Create New Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tail_number">Tail Number</Label>
                        <Input
                          id="tail_number"
                          value={formData.tail_number}
                          onChange={(e) => handleFormChange("tail_number", e.target.value)}
                          placeholder="e.g., N12345"
                        />
                      </div>
                    </div>
                    
                    {formData.aircraft_type === "Custom" && (
                      <div className="space-y-2">
                        <Label htmlFor="custom_aircraft_type">Custom Aircraft Type</Label>
                        <Input
                          id="custom_aircraft_type"
                          value={formData.custom_aircraft_type}
                          onChange={(e) => handleFormChange("custom_aircraft_type", e.target.value)}
                          placeholder="Enter custom aircraft type"
                        />
                        {customAircraftTypes.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1">
                            Previously created: {customAircraftTypes.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                      <Button type="submit" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Aircraft"}
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Aircraft Inventory
            </CardTitle>
            <CardDescription>
              Your saved tail numbers for quick flight logging.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedInventory).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedInventory).map(([displayType, aircrafts]) => (
                  <div key={displayType}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      {displayType}
                      {aircrafts[0].aircraft_type === "Custom" && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Custom</span>
                      )}
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead>Tail Number</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aircrafts.map(ac => (
                            <TableRow key={ac.id}>
                              <TableCell className="font-medium">{ac.tail_number}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => openForm(ac)}>
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(ac.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plane className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Aircraft Saved</h3>
                <p className="text-slate-600">Add an aircraft to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {customAircraftTypes.length > 0 && (
          <Card className="bg-white shadow-lg border-0 mt-8">
            <CardHeader>
              <CardTitle>Manage Custom Types</CardTitle>
              <CardDescription>
                Remove custom aircraft types you no longer need. This will also delete any saved tail numbers for that type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customAircraftTypes.map(type => (
                  <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-800">{type}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the custom type "{type}" and all of its saved tail numbers. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCustomType(type)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
