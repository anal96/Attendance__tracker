import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { MapPin, CheckCircle, XCircle, AlertTriangle, Eye, Shield, Loader2, Clock, FileEdit, Info } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "../ui/textarea";

interface WFHRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
  };
  employeeName: string;
  employeeEmail: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  threshold: number;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  managerId?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  spoofingAlerts: Array<{
    date: Date;
    checkInLocation: string;
    checkInLatitude: number;
    checkInLongitude: number;
    distance: number;
    alertSent: boolean;
    alertSentAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface SpoofingAlert {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  date: Date;
  checkInLocation: string;
  checkInLatitude: number;
  checkInLongitude: number;
  distance: number;
  registeredLocation: string;
  alertSent: boolean;
  alertSentAt?: Date;
}

export function WFHManagement() {
  const [wfhRecords, setWfhRecords] = useState<WFHRecord[]>([]);
  const [spoofingAlerts, setSpoofingAlerts] = useState<SpoofingAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WFHRecord | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SpoofingAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateRequests, setUpdateRequests] = useState<any[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchWFHRecords();
    fetchSpoofingAlerts();
    fetchUpdateRequests();
  }, []);

  const fetchUpdateRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wfh/update-requests", {
        withCredentials: true
      });
      console.log("Update requests response:", response.data);
      setUpdateRequests(response.data.requests || []);
    } catch (error: any) {
      console.error("Error fetching update requests:", error);
      console.error("Error details:", error.response?.data);
      setUpdateRequests([]);
    }
  };

  const fetchWFHRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/wfh/all", {
        withCredentials: true
      });
      setWfhRecords(response.data.wfhRecords || []);
    } catch (error: any) {
      console.error("Error fetching WFH records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpoofingAlerts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wfh/spoofing-alerts", {
        withCredentials: true
      });
      setSpoofingAlerts(response.data.alerts || []);
    } catch (error: any) {
      console.error("Error fetching spoofing alerts:", error);
    }
  };

  const handleVerify = async (wfhId: string, isVerified: boolean) => {
    try {
      await axios.post(
        "http://localhost:5000/api/wfh/verify",
        { wfhId, isVerified },
        { withCredentials: true }
      );
      await fetchWFHRecords();
      setShowDetailsDialog(false);
    } catch (error: any) {
      console.error("Error verifying WFH record:", error);
      alert(error.response?.data?.error || "Failed to verify WFH record");
    }
  };

  const handleDeactivate = async (wfhId: string) => {
    if (!confirm("Are you sure you want to deactivate this WFH registration?")) {
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/wfh/deactivate",
        { wfhId },
        { withCredentials: true }
      );
      await fetchWFHRecords();
      setShowDetailsDialog(false);
    } catch (error: any) {
      console.error("Error deactivating WFH record:", error);
      alert(error.response?.data?.error || "Failed to deactivate WFH record");
    }
  };

  const handleReviewRequest = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    setReviewing(true);
    try {
      await axios.post(
        "http://localhost:5000/api/wfh/review-update-request",
        {
          wfhId: selectedRequest.wfhId,
          action,
          comments: reviewComments || null
        },
        { withCredentials: true }
      );
      await fetchUpdateRequests();
      await fetchWFHRecords();
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewComments("");
      // Show success message
      const message = action === 'approve' 
        ? 'Update request approved successfully! The employee address has been updated.'
        : 'Update request rejected successfully!';
      alert(message);
    } catch (error: any) {
      console.error("Error reviewing update request:", error);
      alert(error.response?.data?.error || `Failed to ${action} update request`);
    } finally {
      setReviewing(false);
    }
  };

  const filteredRecords = wfhRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.employeeName.toLowerCase().includes(searchLower) ||
      record.employeeEmail.toLowerCase().includes(searchLower) ||
      record.employeeId?.employeeId?.toLowerCase().includes(searchLower) ||
      `${record.address}, ${record.city}, ${record.state}`.toLowerCase().includes(searchLower)
    );
  });

  const filteredAlerts = spoofingAlerts.filter(alert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.employeeName.toLowerCase().includes(searchLower) ||
      alert.employeeEmail.toLowerCase().includes(searchLower) ||
      alert.checkInLocation.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Work From Home Management</h2>
        <p className="text-muted-foreground">
          Manage employee work-from-home registrations and monitor location spoofing alerts
        </p>
      </div>

      <Tabs defaultValue="registrations" className="space-y-4" onValueChange={(value) => {
        if (value === 'update-requests') {
          fetchUpdateRequests();
        }
      }}>
        <TabsList>
          <TabsTrigger value="registrations">
            WFH Registrations ({wfhRecords.length})
          </TabsTrigger>
          <TabsTrigger value="update-requests">
            Update Requests ({updateRequests.length})
            {updateRequests.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                {updateRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Spoofing Alerts ({spoofingAlerts.length})
            {spoofingAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {spoofingAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search by name, email, employee ID, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading WFH records...</p>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No WFH registrations found</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.employeeEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.employeeId?.department || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{record.address}</div>
                          <div className="text-muted-foreground">
                            {record.city}, {record.state}, {record.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          <div>{record.latitude.toFixed(6)}</div>
                          <div>{record.longitude.toFixed(6)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {record.isVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {record.isActive ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.managerId ? (
                          <div className="text-sm">
                            <div>{record.managerId.name}</div>
                            <div className="text-muted-foreground">{record.managerId.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.spoofingAlerts && record.spoofingAlerts.length > 0 ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {record.spoofingAlerts.length}
                          </Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="update-requests" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              View and review update requests from all employees
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUpdateRequests}
              disabled={loading}
            >
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {updateRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending update requests</p>
              <p className="text-xs text-muted-foreground mt-2">
                Update requests from employees will appear here
              </p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Current Address</TableHead>
                    <TableHead>Proposed Address</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updateRequests.map((request) => (
                    <TableRow key={request.wfhId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{request.employeeEmail}</div>
                          <div className="text-xs text-muted-foreground">ID: {request.employeeEmployeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs">
                          {request.currentAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs font-medium text-blue-600">
                          {request.proposedAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono">
                          <div className="text-muted-foreground">Current:</div>
                          <div>{request.currentCoordinates.latitude.toFixed(6)}, {request.currentCoordinates.longitude.toFixed(6)}</div>
                          <div className="text-blue-600 mt-1">New:</div>
                          <div className="text-blue-600">{request.proposedCoordinates.latitude.toFixed(6)}, {request.proposedCoordinates.longitude.toFixed(6)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.requestedAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewComments("");
                            setShowReviewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No spoofing alerts found</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Registered Location</TableHead>
                    <TableHead>Check-in Location</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{alert.employeeEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(alert.date), "MMM dd, yyyy")}</div>
                          <div className="text-muted-foreground">
                            {format(new Date(alert.date), "hh:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">{alert.registeredLocation}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">{alert.checkInLocation}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {(alert.distance / 1000).toFixed(2)} km
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.alertSent ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Alert Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Record Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>WFH Registration Details</DialogTitle>
            <DialogDescription>
              View and manage work-from-home registration
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee Name</Label>
                  <p className="font-medium">{selectedRecord.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedRecord.employeeEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Department</Label>
                  <p className="font-medium">{selectedRecord.employeeId?.department || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Verification Status</Label>
                  {selectedRecord.isVerified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm text-muted-foreground">Registered Address</Label>
                <p className="font-medium mt-1">
                  {selectedRecord.address}, {selectedRecord.city}, {selectedRecord.state}, {selectedRecord.country}
                  {selectedRecord.postalCode && ` ${selectedRecord.postalCode}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Latitude</Label>
                  <p className="font-mono text-sm">{selectedRecord.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Longitude</Label>
                  <p className="font-mono text-sm">{selectedRecord.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Threshold</Label>
                  <p className="font-medium">{selectedRecord.threshold}m ({(selectedRecord.threshold / 1000).toFixed(2)} km)</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Spoofing Alerts</Label>
                  <p className="font-medium">{selectedRecord.spoofingAlerts?.length || 0}</p>
                </div>
              </div>

              {selectedRecord.spoofingAlerts && selectedRecord.spoofingAlerts.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold mb-2 block">Recent Alerts</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedRecord.spoofingAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{format(new Date(alert.date), "MMM dd, yyyy hh:mm a")}</span>
                          <Badge variant="destructive">{(alert.distance / 1000).toFixed(2)} km</Badge>
                        </div>
                        <div className="text-muted-foreground mt-1">{alert.checkInLocation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRecord && (
              <>
                {!selectedRecord.isVerified && (
                  <Button
                    onClick={() => handleVerify(selectedRecord._id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                )}
                {selectedRecord.isActive && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeactivate(selectedRecord._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Spoofing Alert Details</DialogTitle>
            <DialogDescription>
              Detailed information about the location mismatch
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedAlert.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlert.employeeEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">{format(new Date(selectedAlert.date), "MMM dd, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(selectedAlert.date), "hh:mm a")}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Registered Location</Label>
                <p className="text-sm">{selectedAlert.registeredLocation}</p>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Check-in Location</Label>
                <p className="text-sm">{selectedAlert.checkInLocation}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Distance Mismatch</Label>
                  <Badge variant="destructive" className="text-lg">
                    {(selectedAlert.distance / 1000).toFixed(2)} km
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  ({selectedAlert.distance.toFixed(0)} meters from registered address)
                </p>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Coordinates</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Check-in Latitude</Label>
                    <p className="font-mono text-sm">{selectedAlert.checkInLatitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Check-in Longitude</Label>
                    <p className="font-mono text-sm">{selectedAlert.checkInLongitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>

              {selectedAlert.alertSent && selectedAlert.alertSentAt && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Alert sent to employee, manager, and admin on{" "}
                    {format(new Date(selectedAlert.alertSentAt), "MMM dd, yyyy hh:mm a")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Update Request Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Update Request</DialogTitle>
            <DialogDescription>
              Review the proposed address and location changes
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedRequest.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.employeeEmail}</p>
                  <p className="text-xs text-muted-foreground">ID: {selectedRequest.employeeEmployeeId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested On</Label>
                  <p className="font-medium">{format(new Date(selectedRequest.requestedAt), "MMM dd, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(selectedRequest.requestedAt), "hh:mm a")}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Current Address</Label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm">{selectedRequest.currentAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {selectedRequest.currentCoordinates.latitude.toFixed(6)}, {selectedRequest.currentCoordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Proposed New Address</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-900">{selectedRequest.proposedAddress}</p>
                    <p className="text-xs text-blue-700 mt-1 font-mono">
                      {selectedRequest.proposedCoordinates.latitude.toFixed(6)}, {selectedRequest.proposedCoordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="review-comments" className="text-sm font-semibold mb-2 block">
                  Review Comments (Optional)
                </Label>
                <Textarea
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add comments for the employee..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comments will be sent to the employee via email
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Note:</strong> If approved, the address and coordinates will be updated immediately. 
                  The employee will be notified via email.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewDialog(false);
                setSelectedRequest(null);
                setReviewComments("");
              }}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReviewRequest('approve')}
              disabled={reviewing}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReviewRequest('reject')}
              disabled={reviewing}
            >
              {reviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





