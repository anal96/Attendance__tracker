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
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { LoadingPage } from "../LoadingPage";

// ✅ Interface for data type
interface LeaveApplication {
  _id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "draft";
  reason: string;
  appliedDate: string;
  substitute?: string;
  substituteId?: string;
  managerComments?: string;
  leaveTypeId?: string;
  contactInfo?: string;
  handoverNotes?: string;
  needsSubstitute?: boolean;
}

export function MyApplications() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<LeaveApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ✅ Fetch data from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/leave_applications_Employee",
          {
            withCredentials: true
          }
        );
        console.log("Fetched Applications:", response.data);
        setApplications(response.data);
        // Trigger badge count update after fetching
        console.log("📥 Applications fetched, triggering badge update...");
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'fetched' } }));
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.error || "Failed to load leave applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // ✅ Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✓";
      case "pending":
        return "⏳";
      case "rejected":
        return "✗";
      case "cancelled":
        return "⊘";
      case "draft":
        return "📝";
      default:
        return "⏳";
    }
  };

  // ✅ Cancel leave
  const handleCancel = async (applicationId: string) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave application?")
    )
      return;

    try {
      await axios.delete(
        `http://localhost:5000/leave_applications_Employee/${applicationId}`
      );
      setApplications((prev) =>
        prev.filter((app) => app._id !== applicationId)
      );
      // Trigger badge count update - dispatch multiple times for reliability
      console.log("🗑️ Leave application cancelled, triggering badge update...");
      window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'cancelled' } }));
      // Also trigger after a short delay to ensure backend has processed
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('applicationStatusChanged', { detail: { action: 'cancelled' } }));
      }, 1000);
      alert("Leave application cancelled successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel leave application.");
    }
  };

  // ✅ Filter logic
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.leaveType?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (app.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (app.employeeName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  );
  const approvedApplications = applications.filter(
    (app) => app.status === "approved"
  );
  const draftApplications = applications.filter(
    (app) => app.status === "draft"
  );

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const handleEdit = (applicationId: string) => {
    // Find the application
    const application = applications.find(app => app._id === applicationId);
    if (!application) {
      alert("Application not found");
      return;
    }

    // Store draft data in sessionStorage to pre-fill the form
    sessionStorage.setItem('editingDraft', JSON.stringify({
      _id: application._id,
      leaveType: application.leaveTypeId || application.leaveType,
      startDate: application.startDate,
      endDate: application.endDate,
      reason: application.reason || "",
      contactInfo: application.contactInfo || "",
      needsSubstitute: application.needsSubstitute || false,
      substitute: application.substituteId || application.substitute || "",
      handoverNotes: application.handoverNotes || "",
      status: application.status
    }));

    // Navigate to apply-leave page using window event
    window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'apply-leave' } }));
  };

  if (loading) {
    return <LoadingPage message="Loading your applications..." fullScreen={false} />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Leave Applications</h2>
          <p className="text-muted-foreground">
            Track and manage your leave requests
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {applications.length}
          </div>
          <p className="text-sm text-muted-foreground">Total Applications</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {pendingApplications.length}
          </div>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {approvedApplications.length}
          </div>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {approvedApplications.reduce(
              (sum, app) => sum + (app.days || 0),
              0
            )}
          </div>
          <p className="text-sm text-muted-foreground">Days Taken</p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {draftApplications.length}
          </div>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftApplications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className="space-y-6">
          <div className="space-y-4">
            {draftApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No draft applications found.
              </p>
            ) : (
              draftApplications.map((app) => (
                <Card key={app._id} className="p-6 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{app.leaveType}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}{" "}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.startDate?.split("T")[0]} →{" "}
                          {app.endDate?.split("T")[0]} • {app.days} day
                          {app.days > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Draft saved on {app.appliedDate?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(app._id)}
                        title="Edit & Submit Draft"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(app._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {app.reason && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-300">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {app.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Click Edit to complete and submit this draft
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {/* Filter Bar */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Application Cards */}
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No leave applications found.
              </p>
            ) : (
              filteredApplications.map((app) => (
                <Card key={app._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{app.leaveType}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}{" "}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.startDate?.split("T")[0]} →{" "}
                          {app.endDate?.split("T")[0]} • {app.days} day
                          {app.days > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied on {app.appliedDate?.split("T")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {(app.status === "pending" || app.status === "draft") && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(app._id)}
                            title={app.status === "draft" ? "Edit & Submit Draft" : "Edit Application"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(app._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reason and Comments */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Reason:</span>{" "}
                      {app.reason}
                    </p>
                    {app.substitute && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Substitute:</span>{" "}
                        {app.substitute}
                      </p>
                    )}
                    {app.managerComments && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                        <p className="text-sm">
                          <span className="font-medium">
                            Manager's Comment:
                          </span>{" "}
                          {app.managerComments}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="space-y-4">
            {pendingApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending applications found.
              </p>
            ) : (
              pendingApplications.map((app) => (
                <Card key={app._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{app.leaveType}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}{" "}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.startDate?.split("T")[0]} →{" "}
                          {app.endDate?.split("T")[0]} • {app.days} day
                          {app.days > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied on {app.appliedDate?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(app._id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(app._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {app.reason && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {app.reason}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <div className="space-y-4">
            {approvedApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No approved applications found.
              </p>
            ) : (
              approvedApplications.map((app) => (
                <Card key={app._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{app.leaveType}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}{" "}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.startDate?.split("T")[0]} →{" "}
                          {app.endDate?.split("T")[0]} • {app.days} day
                          {app.days > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied on {app.appliedDate?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {app.reason && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {app.reason}
                      </p>
                      {app.managerComments && (
                        <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-300">
                          <p className="text-sm">
                            <span className="font-medium">Manager's Comment:</span> {app.managerComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <div className="space-y-4">
            {applications.filter(app => app.status === "rejected").length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No rejected applications found.
              </p>
            ) : (
              applications.filter(app => app.status === "rejected").map((app) => (
                <Card key={app._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{app.leaveType}</h3>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}{" "}
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {app.startDate?.split("T")[0]} →{" "}
                          {app.endDate?.split("T")[0]} • {app.days} day
                          {app.days > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied on {app.appliedDate?.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {app.reason && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {app.reason}
                      </p>
                      {app.managerComments && (
                        <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-300">
                          <p className="text-sm">
                            <span className="font-medium">Manager's Comment:</span> {app.managerComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Leave Type
                  </label>
                  <p>{selectedApplication.leaveType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    className={getStatusColor(selectedApplication.status)}
                  >
                    {selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </label>
                  <p>{selectedApplication.startDate?.split("T")[0]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    End Date
                  </label>
                  <p>{selectedApplication.endDate?.split("T")[0]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <p>
                    {selectedApplication.days} day
                    {selectedApplication.days > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Applied On
                  </label>
                  <p>{selectedApplication.appliedDate?.split("T")[0]}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Reason
                </label>
                <p className="mt-1">{selectedApplication.reason}</p>
              </div>

              {selectedApplication.substitute && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Substitute
                  </label>
                  <p className="mt-1">{selectedApplication.substitute}</p>
                </div>
              )}

              {selectedApplication.managerComments && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Manager Comments
                  </label>
                  <p className="mt-1">{selectedApplication.managerComments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
