import React, { useState } from "react";
import { OrganizationJoinRequest } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, X, Users, Building2, Send } from "lucide-react";

export default function JoinOrganizationForm({ organizations, userOrganizations, userEmail, user, onJoin, onCancel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userOrgIds = userOrganizations.map(org => org.id);
  const availableOrgs = organizations.filter(org => 
    !userOrgIds.includes(org.id) &&
    !org.member_emails?.includes(userEmail) &&
    !org.admin_emails?.includes(userEmail)
  );

  const filteredOrgs = availableOrgs.filter(org => {
    const term = searchTerm.toLowerCase();
    return (
      org.name.toLowerCase().includes(term) ||
      org.description?.toLowerCase().includes(term) ||
      org.id_code?.toLowerCase().includes(term)
    );
  });

  const handleSendRequest = async (org) => {
    if (!org.id_code) {
      alert("Cannot join this organization: it is missing a required ID code. Please contact an administrator of this organization to add an ID code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const adminEmail = org.admin_emails?.[0];
      if (!adminEmail) {
        alert("No administrator found for this organization.");
        return;
      }

      // Create join request record
      await OrganizationJoinRequest.create({
        organization_id: org.id,
        organization_name: org.name,
        requester_email: userEmail,
        requester_name: user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : (user?.full_name || userEmail),
        admin_email: adminEmail,
        message: message || "",
        status: "pending"
      });

      // Send email notification to admin
      const emailBody = `
Dear Administrator,

A new user has requested to join your organization "${org.name}" (${org.id_code}).

Requester Details:
- Name: ${user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : (user?.full_name || userEmail)}
- Email: ${userEmail}
- Message: ${message || "No message provided"}

To approve or reject this request, please:
1. Log into FlightTracker
2. Go to the Organizations page
3. Select your organization
4. Review pending join requests in the Members section

You can approve the request by adding the user's email (${userEmail}) to your organization's member list, or reject it by ignoring this request.

Thank you,
FlightTracker Team
      `;

      await SendEmail({
        to: adminEmail,
        subject: `Join Request for ${org.name} Organization`,
        body: emailBody,
        from_name: "FlightTracker"
      });

      alert(`Join request sent successfully! The organization administrator will be notified and can approve your request.`);
      setSelectedOrg(null);
      setMessage("");
      onCancel();

    } catch (error) {
      console.error("Error sending join request:", error);
      alert("An error occurred while sending the join request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedOrg) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-900">
            Request to Join: {selectedOrg.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setSelectedOrg(null)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">{selectedOrg.name}</h4>
              <Badge variant="outline">{selectedOrg.id_code}</Badge>
            </div>
            {selectedOrg.description && (
              <p className="text-sm text-blue-700 mb-2">{selectedOrg.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {(selectedOrg.member_emails?.length || 0) + (selectedOrg.admin_emails?.length || 0)} members
              </span>
              <span>{selectedOrg.aircraft_inventory?.length || 0} aircraft</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-message">Message to Administrator (Optional)</Label>
            <Textarea
              id="join-message"
              placeholder="Introduce yourself or explain why you'd like to join this organization..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedOrg(null)}>
              Back
            </Button>
            <Button
              onClick={() => handleSendRequest(selectedOrg)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending Request..." : "Send Join Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Join an Organization
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">Search Organizations</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by name, description, or ID code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map(org => (
              <div key={org.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-600" />
                        <h4 className="font-medium text-slate-900">{org.name}</h4>
                      </div>
                      <Badge variant="outline">{org.id_code}</Badge>
                    </div>
                    {org.description && (
                      <p className="text-sm text-slate-600 mb-2">{org.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {(org.member_emails?.length || 0) + (org.admin_emails?.length || 0)} members
                      </span>
                      <span>
                        {org.aircraft_inventory?.length || 0} aircraft
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedOrg(org)}
                    className="bg-blue-600 hover:bg-blue-700 ml-4"
                  >
                    Request to Join
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm ? "No organizations found matching your search." : "No organizations available to join."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}