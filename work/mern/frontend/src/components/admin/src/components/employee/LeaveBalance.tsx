import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, Clock, TrendingUp, AlertCircle, Plus, History } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export function LeaveBalance() {
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
  const [monthlyUsage, setMonthlyUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leave balance data
  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balancesRes, historyRes, usageRes] = await Promise.all([
        axios.get("http://localhost:5000/api/employee/leave-balances", { withCredentials: true }),
        axios.get("http://localhost:5000/api/employee/leave-history", { withCredentials: true }),
        axios.get("http://localhost:5000/api/employee/monthly-leave-usage", { withCredentials: true })
      ]);

      console.log("📊 Leave Balance Data Check:");
      console.log("1. Leave Balances Response:", balancesRes.data);
      console.log("   - leaveBalances array length:", balancesRes.data?.leaveBalances?.length || 0);
      if (balancesRes.data?.leaveBalances?.length > 0) {
        console.log("   - First balance sample:", balancesRes.data.leaveBalances[0]);
        console.log("   - Balance fields check:", {
          hasType: !!balancesRes.data.leaveBalances[0].type,
          hasTotal: typeof balancesRes.data.leaveBalances[0].total !== 'undefined',
          hasUsed: typeof balancesRes.data.leaveBalances[0].used !== 'undefined',
          hasPending: typeof balancesRes.data.leaveBalances[0].pending !== 'undefined',
          hasAvailable: typeof balancesRes.data.leaveBalances[0].available !== 'undefined',
          hasColor: !!balancesRes.data.leaveBalances[0].color,
        });
      }
      
      console.log("2. Leave History Response:", historyRes.data);
      console.log("   - Upcoming leaves:", historyRes.data?.upcomingLeaves?.length || 0);
      console.log("   - Leave history:", historyRes.data?.leaveHistory?.length || 0);
      
      console.log("3. Monthly Usage Response:", usageRes.data);
      console.log("   - Monthly usage array length:", usageRes.data?.monthlyUsage?.length || 0);
      if (usageRes.data?.monthlyUsage?.length > 0) {
        console.log("   - First month sample:", usageRes.data.monthlyUsage[0]);
      }
      
      // Check if we got leave balances
      if (balancesRes.data.leaveBalances && balancesRes.data.leaveBalances.length > 0) {
        setLeaveBalances(balancesRes.data.leaveBalances);
        console.log(`✅ Loaded ${balancesRes.data.leaveBalances.length} leave balances`);
      } else {
        setLeaveBalances([]);
        console.warn("⚠️ No leave balances returned from API");
        if (balancesRes.data.message) {
          console.warn("API message:", balancesRes.data.message);
        }
      }
      
      setUpcomingLeaves(historyRes.data.upcomingLeaves || []);
      setLeaveHistory(historyRes.data.leaveHistory || []);
      setMonthlyUsage(usageRes.data.monthlyUsage || []);
      
      console.log("✅ All data loaded successfully");
    } catch (error: any) {
      console.error("❌ Error fetching leave data:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  // Use only dynamic data from API
  const pieData = leaveBalances.slice(0, 4).map(leave => ({
    name: leave.type,
    value: leave.used,
    color: leave.color
  }));

  const displayBalances = leaveBalances;

  const getUtilizationColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 80) return "text-red-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-orange-100 text-orange-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Leave Balance</h2>
          <p className="text-muted-foreground">Track your available leave days and usage</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-primary/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Total Available</p>
              <p className="text-2xl font-semibold">
              {loading ? "..." : displayBalances.reduce((sum, leave) => sum + leave.available, 0)}
            </p>
              <p className="text-sm text-primary">days remaining</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Used This Year</p>
              <p className="text-2xl font-semibold">
              {loading ? "..." : displayBalances.reduce((sum, leave) => sum + leave.used, 0)}
            </p>
              <p className="text-sm text-green-600">days taken</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-semibold">
              {loading ? "..." : displayBalances.reduce((sum, leave) => sum + leave.pending, 0)}
            </p>
              <p className="text-sm text-orange-600">days pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-semibold">3</p>
              <p className="text-sm text-purple-600">days in Dec</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="balances" className="space-y-6">
        <TabsList>
          <TabsTrigger value="balances">Current Balances</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Leaves</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Balances */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading leave balances...</p>
                </div>
              ) : displayBalances.length > 0 ? (
                displayBalances.map((leave, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{leave.type}</h3>
                      <p className="text-sm text-muted-foreground">{leave.description}</p>
                    </div>
                    <Badge 
                      className={`${getUtilizationColor(leave.used, leave.total)} bg-transparent`}
                    >
                      {Math.round((leave.used / leave.total) * 100)}% used
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available</span>
                      <span className="font-medium">{leave.available} days</span>
                    </div>
                    
                    <Progress 
                      value={(leave.used / leave.total) * 100} 
                      className="h-3"
                      style={{ 
                        background: `linear-gradient(to right, ${leave.color}22 0%, ${leave.color}22 100%)`
                      }}
                    />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Used</p>
                        <p className="font-medium">{leave.used}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-medium">{leave.pending}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{leave.total}</p>
                      </div>
                    </div>

                    {leave.accrualRate > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Accrues {leave.accrualRate} days/month
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leave policies configured yet.</p>
                </div>
              )}
            </div>

            {/* Usage Overview */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-6">Leave Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'apply-leave' } }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Apply for Leave
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateToView', { detail: { view: 'my-applications' } }))}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View Leave History
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">Leave Tips</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      You have 3 annual leave days expiring in December. Plan your holidays!
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Great job maintaining work-life balance with your leave usage.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Monthly Leave Usage Trend</h3>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading usage data...</p>
              </div>
            ) : monthlyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="annual" fill="#3b82f6" name="Annual" />
                <Bar dataKey="sick" fill="#ef4444" name="Sick" />
                <Bar dataKey="personal" fill="#10b981" name="Personal" />
                  <Bar dataKey="casual" fill="#f59e0b" name="Casual" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No usage data available.</p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">Mar</div>
              <p className="text-sm text-muted-foreground">Highest usage month</p>
              <p className="text-xs text-muted-foreground">5 days total</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1.2</div>
              <p className="text-sm text-muted-foreground">Avg days per month</p>
              <p className="text-xs text-muted-foreground">well balanced</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">67%</div>
              <p className="text-sm text-muted-foreground">Annual leave usage</p>
              <p className="text-xs text-muted-foreground">vs peers: average</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Upcoming Approved Leaves</h3>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading upcoming leaves...</p>
              </div>
            ) : upcomingLeaves.length > 0 ? (
              <div className="space-y-4">
                {upcomingLeaves.map((leave, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{leave.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} to {leave.endDate} • {leave.days} day{leave.days > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming leaves scheduled.</p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Next 30 Days</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Scheduled leaves</span>
                  <Badge variant="secondary">1 leave</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total days off</span>
                  <span className="font-medium">5 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Working days</span>
                  <span className="font-medium">17 days</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Reminders</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Substitute Assignment</p>
                    <p className="text-xs text-muted-foreground">Assign someone to cover your Nov 15-19 leave</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Project Handover</p>
                    <p className="text-xs text-muted-foreground">Complete pending tasks before your leave</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Leave History (Last 6 Months)</h3>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading leave history...</p>
              </div>
            ) : leaveHistory.length > 0 ? (
              <div className="space-y-4">
                {leaveHistory.map((leave, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{leave.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} to {leave.endDate} • {leave.days} day{leave.days > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leave history found.</p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">5</div>
              <p className="text-sm text-muted-foreground">Leave applications</p>
              <p className="text-xs text-muted-foreground">in last 6 months</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Approval rate</p>
              <p className="text-xs text-muted-foreground">all approved</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">2.4</div>
              <p className="text-sm text-muted-foreground">Avg days per leave</p>
              <p className="text-xs text-muted-foreground">reasonable duration</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}