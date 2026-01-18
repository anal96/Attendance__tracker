import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Eye, Check, X, Clock, AlertTriangle, MessageSquare, UserCheck } from "lucide-react";
import { LoadingPage } from "./LoadingPage";

interface LeaveApplication {
  id: string;
  _id?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "draft";
  reason: string;
  appliedDate: string;
  managerComments?: string;
  urgency: "low" | "medium" | "high";
  approvedByManager?: boolean;
  rejectedByManager?: boolean;
}

export function LeaveApplications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leave applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Fetching leave applications from backend...");
        
        const response = await axios.get("http://localhost:5000/api/admin/leave-applications", {
          withCredentials: true
        });
        
        console.log("✅ Received applications:", response.data);
        setApplications(response.data);
      } catch (err: any) {
        console.error("❌ Error fetching leave applications:", err);
        console.error("Error response:", err.response);
        
        // Provide more detailed error message
        const errorMessage = err.response?.data?.error 
          || err.response?.data?.message 
          || err.message 
          || "Failed to load leave applications";
        
        setError(errorMessage);
        
        // If it's an authentication error, suggest login
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("⚠️ Authentication issue. User may need to login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);


  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors];
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[urgency as keyof typeof colors];
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingApplications = applications.filter(app => app.status === "pending");
  const urgentApplications = applications.filter(app => app.urgency === "high" && app.status === "pending");

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const handleApprove = async (applicationId: string) => {
    try {
      console.log("Approving application:", applicationId);
      
      const response = await axios.put(
        `http://localhost:5000/api/leaves/${applicationId}`,
        {
          status: "approved",
          managerComments: "Approved by Administrator"
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Application approved:", response.data);
      
      // Refresh the applications list
      const refreshResponse = await axios.get("http://localhost:5000/api/admin/leave-applications", {
        withCredentials: true
      });
      setApplications(refreshResponse.data);
      
      // Show success message
      alert("Leave application approved successfully!");
    } catch (error: any) {
      console.error("❌ Error approving application:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to approve application";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      console.log("Rejecting application:", applicationId);
      
      const reason = prompt("Please provide a reason for rejection:");
      if (reason === null) {
        return; // User cancelled
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/leaves/${applicationId}`,
        {
          status: "rejected",
          managerComments: reason || "Rejected by Administrator"
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Application rejected:", response.data);
      
      // Refresh the applications list
      const refreshResponse = await axios.get("http://localhost:5000/api/admin/leave-applications", {
        withCredentials: true
      });
      setApplications(refreshResponse.data);
      
      // Show success message
      alert("Leave application rejected successfully!");
    } catch (error: any) {
      console.error("❌ Error rejecting application:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to reject application";
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading leave applications..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Leave Applications</h2>
          <p className="text-muted-foreground">Monitor and manage leave requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700">
            {pendingApplications.length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-red-50 text-red-700">
            {urgentApplications.length} Urgent
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search applications..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Applications Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{app.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.leaveType}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{app.startDate}</p>
                        <p>to {app.endDate}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.days}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                        {app.approvedByManager && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                            <UserCheck className="h-3 w-3 mr-1 inline" />
                            Approved by Manager
                          </Badge>
                        )}
                        {app.rejectedByManager && (
                          <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                            Rejected by Manager
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUrgencyColor(app.urgency)}>
                        {app.urgency.charAt(0).toUpperCase() + app.urgency.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.appliedDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {app.status === "pending" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApprove(app._id || app.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReject(app._id || app.id)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{app.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{app.id} • {app.department}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getUrgencyColor(app.urgency)}>
                      {app.urgency}
                    </Badge>
                    {app.approvedByManager && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <UserCheck className="h-3 w-3 mr-1 inline" />
                        Approved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leave Type:</span>
                    <span>{app.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{app.days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dates:</span>
                    <span>{app.startDate} to {app.endDate}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleApprove(app._id || app.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleReject(app._id || app.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(app)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {urgentApplications.map((app) => (
              <Card key={app.id} className="p-6 border-red-200 bg-red-50/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="font-medium">{app.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">{app.id} • {app.department}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leave Type:</span>
                    <span>{app.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{app.days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applied:</span>
                    <span>{app.appliedDate}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm">{app.reason}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleApprove(app._id || app.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleReject(app._id || app.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.id}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee</label>
                  <p>{selectedApplication.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p>{selectedApplication.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Leave Type</label>
                  <p>{selectedApplication.leaveType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex flex-col gap-2 mt-1">
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </Badge>
                    {selectedApplication.approvedByManager && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <UserCheck className="h-4 w-4 mr-1 inline" />
                        Approved by Manager
                      </Badge>
                    )}
                    {selectedApplication.rejectedByManager && (
                      <Badge className="bg-red-100 text-red-800">
                        Rejected by Manager
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p>{selectedApplication.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p>{selectedApplication.endDate}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                <p className="mt-1">{selectedApplication.reason}</p>
              </div>
              
              {selectedApplication.managerComments && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manager Comments</label>
                  <p className="mt-1">{selectedApplication.managerComments}</p>
                </div>
              )}
              
              {selectedApplication.status === "pending" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Add Comments</label>
                    <Textarea placeholder="Add comments for approval/rejection..." className="mt-1" />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        handleApprove(selectedApplication._id || selectedApplication.id);
                        setIsDetailOpen(false);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        handleReject(selectedApplication._id || selectedApplication.id);
                        setIsDetailOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}