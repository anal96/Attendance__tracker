import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingPage } from "./LoadingPage";
import { Users, Clock, FileText, AlertCircle, TrendingUp, Calendar, RefreshCw } from "lucide-react";

export function DashboardOverview() {
  const [stats, setStats] = useState([
    { title: "Total Employees", value: "0", icon: Users, color: "bg-primary" },
    { title: "Pending Applications", value: "0", icon: Clock, color: "bg-orange-500" },
    { title: "Active Leave Policies", value: "0", icon: FileText, color: "bg-primary" },
    { title: "Urgent Reviews", value: "0", icon: AlertCircle, color: "bg-red-500" },
  ]);

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
        withCredentials: true
      });

      if (response.data) {
        console.log("📊 Dashboard - Received data from API:", response.data);
        console.log("📊 Dashboard - Stats:", response.data.stats);
        console.log("📊 Dashboard - Recent applications:", response.data.recentApplications);
        console.log("📊 Dashboard - Pending count:", response.data.pendingCount);
        
        // Update stats with live data
        setStats([
          { title: "Total Employees", value: response.data.stats.totalEmployees.toString(), icon: Users, color: "bg-primary" },
          { title: "Pending Applications", value: response.data.stats.pendingApplications.toString(), icon: Clock, color: "bg-orange-500" },
          { title: "Active Leave Policies", value: response.data.stats.activePolicies.toString(), icon: FileText, color: "bg-primary" },
          { title: "Urgent Reviews", value: response.data.stats.urgentReviews.toString(), icon: AlertCircle, color: "bg-red-500" },
        ]);

        setRecentApplications(response.data.recentApplications || []);
        setPendingCount(response.data.pendingCount || 0);
        
        console.log("✅ Dashboard - Data updated successfully");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data when component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    const handleFocus = () => {
      fetchDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-orange-100 text-orange-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingPage message="Loading dashboard..." fullScreen={false} showProgress={true} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome to the Leave and Attendance Management System</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold">{loading ? "..." : stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Recent Leave Applications</h3>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {pendingCount} Pending Review
          </Badge>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{app.id}</span>
                  </div>
                  <div>
                    <p className="font-medium">{app.employee}</p>
                    <p className="text-sm text-muted-foreground">{app.type} - {app.days} days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{app.date}</span>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent applications found</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'reports' } }))}
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Generate Reports</p>
              <p className="text-sm text-muted-foreground">View attendance and leave analytics</p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'users' } }))}
        >
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-muted-foreground">Add or update employee accounts</p>
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'policy_types' } }))}
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Leave Type</p>
              <p className="text-sm text-muted-foreground">Configure leave types and rules</p>
            </div>
          </div>
        </Card>
        <Card 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary/40"
          onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'policies' } }))}
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Leave Policies</p>
              <p className="text-sm text-muted-foreground">Configure leave types and rules</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}