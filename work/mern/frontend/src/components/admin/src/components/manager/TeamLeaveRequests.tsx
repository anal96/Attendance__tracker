import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";

interface LeaveRequest {
  _id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  substitute?: string;
  managerComments?: string;
  status: "pending" | "approved" | "rejected";
  priority?: "low" | "medium" | "high";
}

export default function TeamLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [managerComments, setManagerComments] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/leave_applications_Employee", {
        withCredentials: true, // Important: sends cookies for authentication
      });
      const data = res.data.map((item: any) => ({
        ...item,
        leaveType: item.leavetype?.type || item.leaveType || "Leave",
        appliedDate: new Date(item.appliedDate).toLocaleDateString(),
        startDate: new Date(item.startDate).toLocaleDateString(),
        endDate: new Date(item.endDate).toLocaleDateString(),
        priority: "medium", // Default until backend provides one
        status: item.status || "pending",
      }));
      setLeaveRequests(data);
      console.log("Fetched leave requests:", data);
      console.log("Pending count:", data.filter((r: any) => r.status === "pending").length);
      console.log("Approved count:", data.filter((r: any) => r.status === "approved").length);
      console.log("Rejected count:", data.filter((r: any) => r.status === "rejected").length);
    } catch (err) {
      console.error("Error fetching leave data:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for status change events to refresh data
    const handleStatusChange = () => {
      console.log("🔄 Status changed, refreshing leave requests...");
      fetchData();
    };
    
    window.addEventListener('applicationStatusChanged', handleStatusChange);
    
    return () => {
      window.removeEventListener('applicationStatusChanged', handleStatusChange);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[priority as keyof typeof colors];
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "low":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || request.priority === filterPriority;
    return matchesSearch && matchesPriority && request.status === "pending";
  });

  const pendingRequests = leaveRequests.filter(
    (req) => req.status === "pending" || req.status === "Pending"
  );
  const approvedRequests = leaveRequests.filter(
    (req) => req.status === "approved" || req.status === "Approved"
  );
  const rejectedRequests = leaveRequests.filter(
    (req) => req.status === "rejected" || req.status === "Rejected"
  );
  const highPriorityRequests = leaveRequests.filter(
    (req) => req.priority === "high" && (req.status === "pending" || req.status === "Pending")
  );

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      try {
        await axios.put(
          `http://localhost:5000/api/leaves/${selectedRequest._id}`,
          {
            status: "approved",
            managerComments,
          }
        );
        // Refresh data after approval
        await fetchData();
        // Trigger badge count update for employee
        console.log("✅ Leave application approved, triggering badge update...");
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'approved' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'approved' } }));
        }, 1000);
      } catch (err) {
        console.error("Failed to approve:", err);
        alert("Failed to approve leave request. Please try again.");
      } finally {
        setIsDetailOpen(false);
        setManagerComments("");
      }
    }
  };

  const handleReject = async () => {
    if (selectedRequest) {
      try {
        await axios.put(
          `http://localhost:5000/api/leaves/${selectedRequest._id}`,
          {
            status: "rejected",
            managerComments,
          }
        );
        // Refresh data after rejection
        await fetchData();
        // Trigger badge count update for employee
        console.log("❌ Leave application rejected, triggering badge update...");
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'rejected' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'rejected' } }));
        }, 1000);
      } catch (err) {
        console.error("Failed to reject:", err);
        alert("Failed to reject leave request. Please try again.");
      } finally {
        setIsDetailOpen(false);
        setManagerComments("");
      }
    }
  };

  if (loading)
    return <div className="text-center py-10 text-lg font-medium">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Leave Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review and manage your team's leave applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
            {pendingRequests.length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            {highPriorityRequests.length} High Priority
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {/* ✅ Pending Requests */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <Card
                key={request._id}
                className={`p-6 border-l-4 ${
                  request.priority === "high"
                    ? "border-l-red-500"
                    : request.priority === "medium"
                    ? "border-l-orange-500"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{request.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Employee
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(request.priority || "medium")}
                    <Badge className={getPriorityColor(request.priority || "medium")}>
                      {request.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leave Type:</span>
                    <span className="font-medium">{request.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {request.days} day{request.days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="font-medium">
                      {request.startDate} - {request.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">{request.appliedDate}</span>
                  </div>
                </div>

                {request.substitute && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4">
                    <p className="text-sm font-medium text-primary mb-1">
                      Substitute:
                    </p>
                    <p className="text-sm text-primary/80">{request.substitute}</p>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ✅ Approved Requests */}
        <TabsContent value="approved" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search approved requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedRequests.filter((request) => {
              const matchesSearch =
                request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesSearch;
            }).map((request) => (
              <Card
                key={request._id}
                className="p-6 border-l-4 border-l-green-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{request.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Employee
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Approved
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leave Type:</span>
                    <span className="font-medium">{request.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {request.days} day{request.days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="font-medium">
                      {request.startDate} - {request.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">{request.appliedDate}</span>
                  </div>
                </div>

                {request.managerComments && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Manager Comments:
                    </p>
                    <p className="text-sm text-green-800">{request.managerComments}</p>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewDetails(request)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>
          {approvedRequests.length === 0 && (
            <Card className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p>No approved leave requests</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ✅ Rejected Requests */}
        <TabsContent value="rejected" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rejected requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rejectedRequests.filter((request) => {
              const matchesSearch =
                request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesSearch;
            }).map((request) => (
              <Card
                key={request._id}
                className="p-6 border-l-4 border-l-red-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <X className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{request.employeeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Employee
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Rejected
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leave Type:</span>
                    <span className="font-medium">{request.leaveType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {request.days} day{request.days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="font-medium">
                      {request.startDate} - {request.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="font-medium">{request.appliedDate}</span>
                  </div>
                </div>

                {request.managerComments && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Manager Comments:
                    </p>
                    <p className="text-sm text-red-800">{request.managerComments}</p>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewDetails(request)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>
          {rejectedRequests.length === 0 && (
            <Card className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <X className="h-12 w-12 mx-auto mb-4 text-red-500 opacity-50" />
                <p>No rejected leave requests</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ✅ Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Review Leave Request - {selectedRequest?.employeeName}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Leave Type</Label>
                  <p>{selectedRequest.leaveType}</p>
                </div>
                <div>
                  <Label>Dates</Label>
                  <p>
                    {selectedRequest.startDate} - {selectedRequest.endDate}
                  </p>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <p>{selectedRequest.reason}</p>
              </div>
              {selectedRequest.substitute && (
                <div>
                  <Label>Substitute</Label>
                  <p>{selectedRequest.substitute}</p>
                </div>
              )}
              <div>
                <Label htmlFor="managerComments">Manager Comments</Label>
                <Textarea
                  id="managerComments"
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  placeholder="Add comments for approval/rejection..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1 border-green-200 text-green-50 hover:bg-green-50"
                  onClick={handleApprove}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
