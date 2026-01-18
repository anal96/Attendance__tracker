import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Users, Clock, CheckCircle, AlertTriangle, Calendar, TrendingUp, UserCheck, Bell, FileText, RefreshCw } from "lucide-react";
import { LoadingPage } from "../LoadingPage";

export function ManagerDashboard() {
  const [managerInfo, setManagerInfo] = useState({
    name: "Manager",
    id: "",
    department: "",
    teamSize: 0,
    role: "Manager"
  });
  const [teamStats, setTeamStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingRequests: 0,
    attendanceRate: 0,
    activeSubstitutes: 0
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [workflowAlerts, setWorkflowAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when component becomes visible (handles navigation back to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    const handleFocus = () => {
      fetchDashboardData();
    };

    // Listen for custom event to refresh dashboard
    const handleRefresh = () => {
      fetchDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('refreshDashboard', handleRefresh);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/manager/dashboard", {
        withCredentials: true
      });

      console.log("Manager Dashboard API Response:", response.data);

      if (response.data) {
        setManagerInfo(response.data.managerInfo || managerInfo);
        setTeamStats(response.data.teamStats || teamStats);
        setPendingRequests(response.data.pendingRequests || []);
        setTodayAttendance(response.data.todayAttendance || []);
        setWorkflowAlerts(response.data.workflowAlerts || []);
        
        console.log("Team Stats:", response.data.teamStats);
        console.log("Today Attendance:", response.data.todayAttendance);
        console.log("Team Size:", response.data.teamStats?.totalEmployees);
      }
    } catch (error) {
      console.error("Error fetching manager dashboard:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: "bg-green-100 text-green-800",
      late: "bg-orange-100 text-orange-800",
      on_leave: "bg-blue-100 text-blue-800",
      absent: "bg-red-100 text-red-800",
      half_day_leave: "bg-purple-100 text-purple-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "late": return <Clock className="h-4 w-4 text-orange-600" />;
      case "on_leave": return <Calendar className="h-4 w-4 text-blue-600" />;
      case "absent": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "substitute_needed": return <UserCheck className="h-5 w-5 text-orange-600" />;
      case "coverage_gap": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "attendance_concern": return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleReviewRequest = (requestId: string) => {
    window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'team-requests' } }));
  };

  if (loading) {
    return <LoadingPage message="Loading dashboard..." fullScreen={false} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Welcome back, {managerInfo.name}</h2>
          <p className="text-muted-foreground">Manage your team's attendance and leave requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {managerInfo.teamSize} Team Members
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-primary/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Team Size</p>
              <p className="text-2xl font-semibold">{teamStats.totalEmployees}</p>
              <p className="text-sm text-primary">active members</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Present Today</p>
              <p className="text-2xl font-semibold">{teamStats.presentToday}</p>
              <p className="text-sm text-green-600">of {teamStats.totalEmployees} members</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-semibold">{teamStats.pendingRequests}</p>
              <p className="text-sm text-orange-600">need review</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-semibold">{teamStats.attendanceRate}%</p>
              <p className="text-sm text-blue-600">this month</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Pending Leave Requests</h3>
            <Badge className="bg-orange-100 text-orange-800">
              {pendingRequests.length} Pending
            </Badge>
          </div>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending leave requests</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{request.employee}</p>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.type} - {request.days} day{request.days > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Starts {new Date(request.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleReviewRequest(request.id)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Today's Attendance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Today's Attendance</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {teamStats.presentToday}/{teamStats.totalEmployees} Present
              </span>
              <Progress 
                value={teamStats.totalEmployees > 0 ? (teamStats.presentToday / teamStats.totalEmployees) * 100 : 0} 
                className="w-20 h-2" 
              />
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {todayAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No attendance data for today</p>
              </div>
            ) : (
              todayAttendance.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(member.status)}
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(member.status)}>
                      {member.status === "half_day_leave" ? "Half Day Leave" :
                       member.status.replace('_', ' ')}
                    </Badge>
                    {member.checkIn !== "-" && (
                      <p className="text-xs text-muted-foreground mt-1">{member.checkIn}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Workflow Alerts */}
      <Card className="p-6">
        <h3 className="mb-6">Workflow Alerts</h3>
        <div className="space-y-4">
          {workflowAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No workflow alerts at this time</p>
            </div>
          ) : (
            workflowAlerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                </div>
                <Badge className={getPriorityColor(alert.priority)}>
                  {alert.priority}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'mark-attendance' } }))}
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Mark Attendance</p>
              <p className="text-sm text-muted-foreground">Record daily team attendance</p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'duty-handover' } }))}
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">Duty Handover</p>
              <p className="text-sm text-muted-foreground">Manage work handovers</p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-400"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'leave-balance' } }))}
        >
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium">Leave Balance</p>
              <p className="text-sm text-muted-foreground">View your leave balances</p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-400"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'team-requests' } }))}
        >
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="font-medium">Review Requests</p>
              <p className="text-sm text-muted-foreground">Approve or reject leave applications</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
          <div className="flex items-center space-x-3">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">Manage Substitutes</p>
              <p className="text-sm text-muted-foreground">Assign work coverage during leaves</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

