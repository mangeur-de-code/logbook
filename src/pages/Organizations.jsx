
import React, { useState, useEffect } from "react";
import { Organization, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Users, Plane, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import OrganizationDetails from "../components/organizations/OrganizationDetails";
import CreateOrganizationForm from "../components/organizations/CreateOrganizationForm";
import JoinOrganizationForm from "../components/organizations/JoinOrganizationForm";

export default function OrganizationsPage() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const allOrgs = await Organization.list();
      setAllOrganizations(allOrgs);
      
      // Filter orgs where the user is a member or an admin
      const userOrgs = allOrgs.filter(org => 
        org.member_emails?.includes(currentUser.email) || org.admin_emails?.includes(currentUser.email)
      );
      setOrganizations(userOrgs);

      if (userOrgs.length > 0) {
        setSelectedOrg(userOrgs[0]);
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (orgData) => {
    // Check for duplicate ID code
    const existingOrg = allOrganizations.find(org => org.id_code && orgData.id_code && org.id_code.toLowerCase() === orgData.id_code.toLowerCase());
    if (existingOrg) {
      alert(`An organization with the ID Code "${orgData.id_code}" already exists. Please use the "Join Organization" feature to find and request to join it.`);
      return; // Stop the creation process
    }

    try {
      const newOrg = await Organization.create({
        ...orgData,
        admin_emails: [user.email],
        member_emails: [user.email]
      });
      setShowCreateForm(false);
      await loadData();
      setSelectedOrg(newOrg);
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };
  
  const handleUpdateOrganization = async (orgId, updatedData) => {
    try {
      // Ensure we include all required fields, especially id_code
      const orgToUpdate = organizations.find(org => org.id === orgId) || allOrganizations.find(org => org.id === orgId);
      if (!orgToUpdate) {
        throw new Error("Organization not found");
      }
      
      const completeUpdateData = {
        name: updatedData.name !== undefined ? updatedData.name : orgToUpdate.name,
        id_code: updatedData.id_code !== undefined ? updatedData.id_code : orgToUpdate.id_code,
        description: updatedData.description !== undefined ? updatedData.description : (orgToUpdate.description || ""),
        aircraft_inventory: updatedData.aircraft_inventory !== undefined ? updatedData.aircraft_inventory : (orgToUpdate.aircraft_inventory || []),
        member_emails: updatedData.member_emails !== undefined ? updatedData.member_emails : (orgToUpdate.member_emails || []),
        admin_emails: updatedData.admin_emails !== undefined ? updatedData.admin_emails : (orgToUpdate.admin_emails || [])
      };
      
      // If id_code is still empty, we can't update
      if (!completeUpdateData.id_code) {
        alert("This organization is missing a required ID code. Please edit the organization details to add an ID code before making changes.");
        return;
      }
      
      await Organization.update(orgId, completeUpdateData);
      await loadData();
    } catch(error) {
      console.error("Error updating organization:", error);
      if (error.response?.status === 422 && error.response?.data?.message?.includes("id_code")) {
        alert("Cannot update organization: ID code is required. Please edit the organization details to add an ID code first.");
      } else {
        alert("An error occurred while updating the organization. Please try again.");
      }
    }
  };

  const handleJoinOrganization = async (organizationId) => {
    // This method is no longer used for directly adding the user to the organization.
    // The JoinOrganizationForm now handles sending the actual join request to the backend.
    console.log(`Join request submitted for organization: ${organizationId}. Reloading data.`);
    setShowJoinForm(false); // Close the form after the request is submitted
    await loadData(); // Refresh data to reflect potential changes (e.g., pending requests)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
            <p className="text-slate-600 mt-1">
              Manage your teams, aircraft, and shared flight logs.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowJoinForm(true)}
              variant="outline"
              className="shadow-lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Join Organization
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Organization
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <CreateOrganizationForm
                onSubmit={handleCreateOrganization}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          )}

          {showJoinForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <JoinOrganizationForm
                organizations={allOrganizations}
                userOrganizations={organizations}
                userEmail={user.email}
                user={user}
                onJoin={handleJoinOrganization}
                onCancel={() => setShowJoinForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Your Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                {organizations.length > 0 ? (
                  <div className="space-y-2">
                    {organizations.map(org => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrg(org)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedOrg?.id === org.id
                            ? "bg-blue-100 text-blue-800 font-semibold"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-4">
                    <p>You are not part of any organization yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedOrg ? (
                <motion.div
                  key={selectedOrg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <OrganizationDetails 
                    organization={selectedOrg} 
                    currentUserEmail={user.email}
                    onUpdate={handleUpdateOrganization}
                  />
                </motion.div>
              ) : (
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="text-center py-20">
                    <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900">Select an Organization</h3>
                    <p className="text-slate-600 mt-2">
                      Choose an organization from the list or create a new one to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
