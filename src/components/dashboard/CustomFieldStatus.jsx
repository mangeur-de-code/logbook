import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function CustomFieldStatus({ user }) {
  const getFieldWarnings = () => {
    const warnings = [];
    const current = [];
    
    // Medical expiry
    if (user.medical_expiry) {
      const daysUntilExpiry = differenceInDays(new Date(user.medical_expiry), new Date());
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        warnings.push({
          name: "Medical Certificate",
          daysLeft: daysUntilExpiry,
          date: user.medical_expiry
        });
      } else if (daysUntilExpiry > 30) {
        current.push({
          name: "Medical Certificate",
          date: user.medical_expiry
        });
      }
    }

    // Custom tracking fields
    user.custom_tracking_fields?.forEach(field => {
      if (field.is_expiry_field && field.value) {
        const daysUntilExpiry = differenceInDays(new Date(field.value), new Date());
        if (daysUntilExpiry <= (field.warning_days || 30) && daysUntilExpiry >= 0) {
          warnings.push({
            name: field.name,
            daysLeft: daysUntilExpiry,
            date: field.value
          });
        } else if (daysUntilExpiry > (field.warning_days || 30)) {
          current.push({
            name: field.name,
            date: field.value
          });
        }
      }
    });

    return { warnings, current };
  };

  const { warnings, current } = getFieldWarnings();

  if (warnings.length === 0 && current.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Certification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {warnings.map((warning, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900 text-sm">{warning.name}</p>
                <p className="text-xs text-yellow-700">
                  {format(new Date(warning.date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              {warning.daysLeft}d left
            </Badge>
          </div>
        ))}
        
        {current.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium text-green-900 text-sm">{item.name}</p>
                <p className="text-xs text-green-700">
                  Valid until {format(new Date(item.date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}