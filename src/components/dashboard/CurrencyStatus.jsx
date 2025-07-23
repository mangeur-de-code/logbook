
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { subDays, isAfter, startOfDay } from "date-fns";

const getProgressClass = (percentage) => {
  if (percentage >= 100) return '[&>div]:bg-green-600';
  if (percentage > 50) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-600';
};

export default function CurrencyStatus({ currencyStatus, user }) {
  const settings = user?.currency_settings || { ng_required_hours: 6, ns_required_hours: 6, currency_period_days: 60 };
  const ngStatus = currencyStatus.ng >= settings.ng_required_hours ? "current" : "expired";
  const nsStatus = currencyStatus.ns >= settings.ns_required_hours ? "current" : "expired";
  
  const ngPercentage = settings.ng_required_hours > 0 ? Math.min((currencyStatus.ng / settings.ng_required_hours) * 100, 100) : 0;
  const nsPercentage = settings.ns_required_hours > 0 ? Math.min((currencyStatus.ns / settings.ns_required_hours) * 100, 100) : 0;

  const getStatusColor = (status) => {
    return status === "current" ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (status) => {
    return status === "current" ? CheckCircle : AlertTriangle;
  };

  const getStatusBadge = (status) => {
    return status === "current" 
      ? <Badge className="bg-green-100 text-green-800">Current</Badge>
      : <Badge className="bg-red-100 text-red-800">Expired</Badge>;
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Currency Status ({settings.currency_period_days}-Day Window)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ngStatus === "current" ? "bg-green-100" : "bg-red-100"}`}>
                {React.createElement(getStatusIcon(ngStatus), { 
                  className: `w-5 h-5 ${getStatusColor(ngStatus)}` 
                })}
              </div>
              <div>
                <p className="font-medium text-slate-900">Night Goggle (NG)</p>
                <p className="text-sm text-slate-600">
                  {currencyStatus.ng.toFixed(1)} / {settings.ng_required_hours} hours required
                </p>
              </div>
            </div>
            {getStatusBadge(ngStatus)}
          </div>
          <Progress 
            value={ngPercentage}
            className={`h-2 ${getProgressClass(ngPercentage)}`}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${nsStatus === "current" ? "bg-green-100" : "bg-red-100"}`}>
                {React.createElement(getStatusIcon(nsStatus), { 
                  className: `w-5 h-5 ${getStatusColor(nsStatus)}` 
                })}
              </div>
              <div>
                <p className="font-medium text-slate-900">Night System (NS)</p>
                <p className="text-sm text-slate-600">
                  {currencyStatus.ns.toFixed(1)} / {settings.ns_required_hours} hours required
                </p>
              </div>
            </div>
            {getStatusBadge(nsStatus)}
          </div>
          <Progress 
            value={nsPercentage}
            className={`h-2 ${getProgressClass(nsPercentage)}`}
          />
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> Currency requirements are based on the last {settings.currency_period_days} days of flight activity. 
            Ensure you maintain minimum hours in both NG and NS modes to stay current.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
