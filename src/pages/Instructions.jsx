import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Upload, Settings, ArrowRight, Edit, Trash2 } from 'lucide-react';

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">How to Log a Flight</h1>
          <p className="text-slate-600 mt-1">
            Follow these simple steps to add your flight records to the logbook.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual Entry Instructions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">Method 1: Manual Entry</h2>
                  <p className="text-sm font-normal text-slate-500">For logging individual flights.</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <p className="text-slate-700">Navigate to the <Link to={createPageUrl("FlightLog")} className="font-medium text-blue-600 hover:underline">Flight Log</Link> page from the sidebar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <p className="text-slate-700">Click the <span className="font-semibold text-slate-900">"New Flight Entry"</span> button to open the flight form.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <p className="text-slate-700">Fill in all the required flight details, such as date, aircraft type, tail number, route, and hours breakdown.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <p className="text-slate-700">Click the <span className="font-semibold text-slate-900">"Save Flight"</span> button. Your new flight will appear in the log.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Upload Instructions */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold">Method 2: CSV Upload</h2>
                  <p className="text-sm font-normal text-slate-500">For bulk importing multiple flights from spreadsheets.</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <p className="text-slate-700">Export your flight log data from any spreadsheet program (Excel, Google Sheets, etc.) as a CSV file. Make sure the first row contains column headers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <p className="text-slate-700">Navigate to the <Link to={createPageUrl("UploadFlights")} className="font-medium text-green-600 hover:underline">Upload Flights</Link> page and upload your CSV file.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <p className="text-slate-700">Map your CSV columns to the flight log fields. For example, map "Date Flown" to "Flight Date" and "Aircraft Model" to "Aircraft Type".</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <p className="text-slate-700">Preview your data to ensure it looks correct, then click <span className="font-semibold text-slate-900">"Import Flights"</span> to add them to your logbook.</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <h4 className="font-semibold text-green-800 text-sm mb-2">CSV Import Tips:</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Use "SIM" as the tail number to automatically mark flights as simulator sessions</li>
                  <li>• Include seat position data (Left, Right, Front, Back) for accurate tracking</li>
                  <li>• The system handles various date formats automatically</li>
                  <li>• Aircraft types like "UH-60 (L)" will automatically parse seat positions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Setup Instructions */}
        <div className="mt-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Profile & Requirements Setup</h1>
                <p className="text-slate-600 mt-1">
                    Configure your personal details and flight requirements for accurate tracking.
                </p>
            </div>
            <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-purple-600" />
                        <div>
                            <h2 className="text-xl font-semibold">Configuration Steps</h2>
                            <p className="text-sm font-normal text-slate-500">Essential for personalized dashboard tracking.</p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                            <p className="text-slate-700">Navigate to the <Link to={createPageUrl("Profile")} className="font-medium text-purple-600 hover:underline">Profile</Link> page to manage all your settings.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                            <p className="text-slate-700">In the <span className="font-semibold text-slate-900">"Personal"</span> tab, enter your license number, rank, and medical expiry date.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                            <div>
                                <p className="text-slate-700 font-medium">Go to the <span className="font-semibold text-slate-900">"Requirements"</span> tab to set up tracking:</p>
                                <ul className="list-disc list-inside text-slate-700 space-y-1 mt-2">
                                    <li><span className="font-semibold">Currency Requirements:</span> Define NG/NS hours needed within a set period (e.g., 6 hours in 60 days).</li>
                                    <li><span className="font-semibold">Semi-annual Requirements:</span> Set your two annual periods, total required flight and simulator hours, and the primary aircraft type.</li>
                                    <li><span className="font-semibold">Additional Requirements:</span> Add custom hour minimums for specific roles or conditions, like "NG Left Seat" or "Instructor hours".</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                            <p className="text-slate-700">In the <span className="font-semibold text-slate-900">"Custom Fields"</span> tab, you can create trackers for other important items like certifications or training events with expiry dates.</p>
                        </div>
                         <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                            <p className="text-slate-700">Make sure to <span className="font-semibold text-slate-900">save your changes</span> in each section to apply them.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Bulk Data Management Instructions */}
        <div className="mt-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Bulk Data Management</h1>
                <p className="text-slate-600 mt-1">
                    Efficiently manage large amounts of flight data with bulk editing and deletion tools.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bulk Edit Instructions */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Edit className="w-6 h-6 text-orange-600" />
                            <div>
                                <h2 className="text-xl font-semibold">Bulk Edit Aircraft Data</h2>
                                <p className="text-sm font-normal text-slate-500">Fix imported data or update multiple entries at once.</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                <p className="text-slate-700">Go to <Link to={createPageUrl("Profile")} className="font-medium text-orange-600 hover:underline">Profile</Link> → <span className="font-semibold text-slate-900">"Data"</span> tab.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                <p className="text-slate-700">In the <span className="font-semibold text-slate-900">"Batch Edit Aircraft Data"</span> section, choose what to search for (tail number or aircraft type).</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                                <p className="text-slate-700">Enter the value to find (e.g., "2B64E(FS)" or "UH-60"). The system will show matching flights.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                                <div>
                                    <p className="text-slate-700 font-medium">Choose your update action:</p>
                                    <ul className="list-disc list-inside text-slate-700 space-y-1 mt-2">
                                        <li><span className="font-semibold">Convert to Simulator:</span> Turn aircraft flights into simulator sessions</li>
                                        <li><span className="font-semibold">Change Tail Number:</span> Update to a new tail number</li>
                                        <li><span className="font-semibold">Change Aircraft Type:</span> Switch to a different aircraft type</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                                <p className="text-slate-700">Click <span className="font-semibold text-slate-900">"Update Flights"</span> to apply changes to all matching entries.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Delete Instructions */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Trash2 className="w-6 h-6 text-red-600" />
                            <div>
                                <h2 className="text-xl font-semibold">Bulk Delete Flights</h2>
                                <p className="text-sm font-normal text-slate-500">Remove all flights for a specific aircraft type.</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                <p className="text-slate-700">Go to <Link to={createPageUrl("Profile")} className="font-medium text-red-600 hover:underline">Profile</Link> → <span className="font-semibold text-slate-900">"Data"</span> tab.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                <p className="text-slate-700">Scroll to the <span className="font-semibold text-slate-900">"Delete All Flights by Aircraft"</span> section.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                                <p className="text-slate-700">Select the aircraft type you want to remove from the dropdown menu.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                                <p className="text-slate-700">The system will show how many flights will be deleted for that aircraft type.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                                <p className="text-slate-700">Click <span className="font-semibold text-slate-900">"Delete Flights"</span> and confirm the action. <span className="font-bold text-red-600">This cannot be undone!</span></p>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700 font-medium">⚠️ Warning: Bulk deletion is permanent and cannot be reversed. Always double-check before confirming.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Common Use Cases */}
            <Card className="bg-white shadow-lg border-0 mt-8">
                <CardHeader>
                    <CardTitle>Common Bulk Editing Scenarios</CardTitle>
                    <CardDescription>Examples of when bulk data management is useful</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900">After CSV Import</h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li>• Change "2B64E(FS)" tail numbers to "SIM" for simulator sessions</li>
                                <li>• Convert flights with "(SIM)" in tail number to simulator sessions</li>
                                <li>• Fix incorrectly imported aircraft types</li>
                                <li>• Standardize tail number formats</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900">Data Cleanup</h4>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li>• Remove test flights or duplicate entries</li>
                                <li>• Update aircraft types when transitioning between units</li>
                                <li>• Consolidate similar aircraft variants</li>
                                <li>• Convert old paper logbook entries to proper format</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Ready to Get Started?</h3>
                        <p className="text-slate-600 mt-1">Head over to your flight log to start adding entries.</p>
                    </div>
                    <Link to={createPageUrl("FlightLog")}>
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                            Go to Flight Log
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}