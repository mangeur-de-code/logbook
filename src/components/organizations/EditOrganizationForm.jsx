import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function EditOrganizationForm({ organization, onSubmit, onCancel }) {
  const [name, setName] = useState(organization.name);
  const [idCode, setIdCode] = useState(organization.id_code || "");
  const [description, setDescription] = useState(organization.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && idCode) {
      onSubmit({ name, id_code: idCode, description });
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">Edit Organization Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-name-edit">Organization Name</Label>
              <Input
                id="org-name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 1st Aviation Battalion"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-id-code-edit">Organization ID Code</Label>
              <Input
                id="org-id-code-edit"
                value={idCode}
                onChange={(e) => setIdCode(e.target.value)}
                placeholder="e.g., 1AVN"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-desc-edit">Description</Label>
            <Textarea
              id="org-desc-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your organization"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}