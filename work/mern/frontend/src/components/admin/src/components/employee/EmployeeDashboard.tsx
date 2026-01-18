import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Calendar, Clock, FileText, User, AlertCircle, CheckCircle, Plus } from "lucide-react";
import Cookies from "js-cookie";

interface EmployeeDashboardProps {
  onNavigate?: (view: string) => void;
}

export function EmployeeDashboard({ onNavigate }: EmployeeDashboardProps) {
  const [employeeName, setEmployeeName] = useState("");
  const userId = Cookies.get("userId");

  // ✅ State variables
  interface LeaveBalance {
    type: string;
    used: number;
    total: number;
  }

  interface LeaveApplication {
    _id?: string;
    employeeName?: string;
    status?: string;
    appliedDate?: string;
    leaveType?: string;
    startDate?: string;
    days?: number;
  }

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [recentApplications, setRecentApplications] = useState<LeaveApplication[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>({
    thisMonth: { present: 0, absent: 0, late: 0 },
    attendanceRate: 0,
    manager: null
  });
  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState<any>(null);

  // ✅ Fetch today's attendance status
  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/attendance/today", {
        withCredentials: true
      });
      setTodayStatus(response.data);
    } catch (error) {
      console.error("Error fetching today's status:", error);
      setTodayStatus({
        hasRecord: false,
        checkInTime: null,
        checkOutTime: null,
        status: null,
        workedHours: 0,
        isLate: false,
        isEarlyLeave: false
      });
    }
  };

  // ✅ Fetch Data from Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile to get employee name
        const profileResponse = await axios.get("http://localhost:5000/api/employee/profile", { 
          withCredentials: true 
        });
        // Use name directly from API response
        const name = profileResponse.data.name?.trim() || Cookies.get("username") || "Employee";
        console.log("Dashboard - Setting employee name:", name);
        setEmployeeName(name);

        // Fetch dashboard data
        const response = await axios.get("http://localhost:5000/api/employee/dashboard", { 
          withCredentials: true 
        });

        console.log("📊 Employee Dashboard - Received data from API:", response.data);
        console.log("📊 Employee Dashboard - Leave balances:", response.data.leaveBalances);
        console.log("📊 Employee Dashboard - Recent applications:", response.data.recentApplications);
        console.log("📊 Employee Dashboard - Attendance stats:", response.data.attendanceStats);

        setLeaveBalances(response.data.leaveBalances || []);
        setRecentApplications(response.data.recentApplications || []);
        setAttendanceStats({
          ...(response.data.attendanceStats || {
            thisMonth: { present: 0, absent: 0, late: 0 },
            attendanceRate: 0,
          }),
          manager: response.data.manager || null
        });
        
        console.log("✅ Employee Dashboard - Data updated successfully");

        // Fetch today's attendance status
        await fetchTodayStatus();
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Fallback to cookies
        const cookieName = Cookies.get("username") || "";
        console.log("Dashboard - Using cookie name:", cookieName);
        setEmployeeName(cookieName);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Helpers
  const getStatusColor = (status: any) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "rejected": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Attendance action handlers removed from dashboard UI

  if (loading) return <p className="p-6 text-center text-muted-foreground">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2>Welcome back, {employeeName}</h2>
          <p className="text-muted-foreground">Here's your leave and attendance summary</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Apply for Leave Button */}
          <Button 
            onClick={() => onNavigate?.("apply-leave")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Leave Balance */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Leave Balance</p>
              <p className="text-2xl font-semibold">
                {leaveBalances.length > 0 
                  ? leaveBalances.reduce((acc, leave) => acc + ((leave as any).available || (leave.total - leave.used)), 0)
                  : 0}
              </p>
              <p className="text-sm text-primary">days remaining</p>
       </div>
          </div>
        </Card>

        {/* Attendance */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-semibold">{attendanceStats.attendanceRate}%</p>
              <p className="text-sm text-green-600">this month</p>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Pending Applications</p>
              <p className="text-2xl font-semibold">
                {recentApplications.filter((a) => a.status === "pending").length}
              </p>
              <p className="text-sm text-orange-600">awaiting approval</p>
            </div>
          </div>
        </Card>

        {/* Manager */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Manager</p>
              <p className="text-lg font-semibold">
                {attendanceStats.manager?.name || "Not Assigned"}
              </p>
              <p className="text-sm text-purple-600">your supervisor</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Balances */}
      <Card className="p-6">
        <h3 className="mb-6">Leave Balances</h3>
        <div className="space-y-4">
          {leaveBalances.length > 0 ? (
            leaveBalances.map((leave) => {
              const available = (leave as any).available !== undefined 
                ? (leave as any).available 
                : (leave.total - leave.used);
              const pending = (leave as any).pending || 0;
              const total = leave.total || 0;
              const used = leave.used || 0;
              
              return (
                <div key={leave.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{leave.type}</span>
                  </div>
                  <Progress value={total > 0 ? (used / total) * 100 : 0} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {pending > 0 && <span className="text-orange-600">Pending: {pending} days</span>}
                    <span>Remaining: {available} days</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No leave balances available. Leave policies may not be configured yet.
            </p>
          )}
        </div>
      </Card>

      {/* Recent Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Recent Applications</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate?.("my-applications")}
          >
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {recentApplications.length > 0 ? (
            recentApplications.map((app) => (
              <div key={app._id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(app.status)}
                  <div>
                    <p className="font-medium">{app.leaveType || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.startDate ? new Date(app.startDate).toLocaleDateString() : "—"} - {(app.days ?? 0)} day{(app.days ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(app.status)}>
                  {(app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Unknown")}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">No recent leave applications.</p>
          )}
        </div>
      </Card>

      {/* Quick Actions / Fast Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => onNavigate?.("attendance")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-muted-foreground">View attendance records</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300"
          onClick={() => onNavigate?.("apply-leave")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Apply for Leave</p>
              <p className="text-sm text-muted-foreground">Submit leave request</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300"
          onClick={() => onNavigate?.("my-applications")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">My Applications</p>
              <p className="text-sm text-muted-foreground">View leave applications</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-300"
          onClick={() => onNavigate?.("leave-balance")}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Leave Balance</p>
              <p className="text-sm text-muted-foreground">Check leave balances</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance action dialog removed from dashboard */}
    </div>
  );
}
