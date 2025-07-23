import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plane, Users, Plus } from "lucide-react";
import AircraftInventory from "./AircraftInventory";
import MemberList from "./MemberList";
import EditOrganizationForm from "./EditOrganizationForm";

export default function OrganizationDetails({ organization, currentUserEmail, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const isUserAdmin = organization.admin_emails?.includes(currentUserEmail);

  const handleUpdateDetails = (updatedDetails) => {
    // updatedDetails is { name, id_code, description }
    // We need to merge this with the rest of the organization data to create a valid update payload
    const fullPayload = {
        name: updatedDetails.name,
        id_code: updatedDetails.id_code,
        description: updatedDetails.description,
        aircraft_inventory: organization.aircraft_inventory,
        member_emails: organization.member_emails,
        admin_emails: organization.admin_emails,
    };
    onUpdate(organization.id, fullPayload);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <EditOrganizationForm 
            organization={organization}
            onSubmit={handleUpdateDetails}
            onCancel={() => setIsEditing(false)}
        />
    )
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">{organization.name}</CardTitle>
            <CardDescription className="mt-1">{organization.description || 'No description provided.'}</CardDescription>
          </div>
          {isUserAdmin && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Aircraft Inventory
          </h3>
          <AircraftInventory
            organization={organization}
            isUserAdmin={isUserAdmin}
            onUpdate={onUpdate}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </h3>
          <MemberList
            organization={organization}
            isUserAdmin={isUserAdmin}
            onUpdate={onUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}