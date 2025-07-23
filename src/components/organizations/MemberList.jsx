import React, { useState, useEffect } from "react";
import { OrganizationJoinRequest } from "@/api/entities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Send, Clock, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberList({ organization, isUserAdmin, onUpdate }) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (isUserAdmin) {
      loadPendingRequests();
    }
  }, [organization.id, isUserAdmin]);

  const loadPendingRequests = async () => {
    try {
      const requests = await OrganizationJoinRequest.filter({
        organization_id: organization.id,
        status: "pending"
      });
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error loading pending requests:", error);
    }
  };

  const handleApproveRequest = async (request) => {
    try {
      // Add user to organization
      const updatedMembers = [...(organization.member_emails || []), request.requester_email];
      await onUpdate(organization.id, { 
        member_emails: updatedMembers
      });

      // Update request status
      await OrganizationJoinRequest.update(request.id, {
        ...request,
        status: "approved"
      });

      loadPendingRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Error approving request. Please try again.");
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      await OrganizationJoinRequest.update(request.id, {
        ...request,
        status: "rejected"
      });
      loadPendingRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request. Please try again.");
    }
  };

  const handleInvite = () => {
    // Check if organization has id_code
    if (!organization.id_code) {
      alert("Cannot invite members: this organization is missing a required ID code. Please edit the organization details to add an ID code first.");
      return;
    }
    
    if (inviteEmail && !organization.member_emails?.includes(inviteEmail)) {
      const updatedMembers = [...(organization.member_emails || []), inviteEmail];
      onUpdate(organization.id, { 
        member_emails: updatedMembers
      });
      setInviteEmail("");
      setShowInvite(false);
    }
  };
  
  const handleRemoveMember = (email) => {
    // Check if organization has id_code
    if (!organization.id_code) {
      alert("Cannot remove members: this organization is missing a required ID code. Please edit the organization details to add an ID code first.");
      return;
    }
    
    const updatedMembers = organization.member_emails.filter(m => m !== email);
    const updatedAdmins = organization.admin_emails.filter(a => a !== email);
    onUpdate(organization.id, { 
      member_emails: updatedMembers,
      admin_emails: updatedAdmins
    });
  };

  return (
    <div className="space-y-6">
      {/* Pending Join Requests - Only visible to admins */}
      {isUserAdmin && pendingRequests.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-yellow-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Join Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{request.requester_email.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.requester_name}</p>
                    <p className="text-sm text-slate-600">{request.requester_email}</p>
                    {request.message && (
                      <p className="text-sm text-slate-500 italic mt-1">"{request.message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApproveRequest(request)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRejectRequest(request)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <div className="space-y-4">
        <div className="space-y-3">
          {organization.member_emails?.map(email => (
            <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{email.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{email}</p>
                  {organization.admin_emails?.includes(email) && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </div>
              </div>
              {isUserAdmin && email !== organization.admin_emails?.[0] && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(email)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {isUserAdmin && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowInvite(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        )}
        
        {showInvite && (
          <div className="mt-4 p-4 bg-slate-50 border-slate-200 rounded-lg flex items-center gap-2">
            <Input 
              type="email" 
              placeholder="Enter member's email" 
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
            />
            <Button onClick={handleInvite}><Send className="w-4 h-4 mr-2" />Send Invite</Button>
            <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}