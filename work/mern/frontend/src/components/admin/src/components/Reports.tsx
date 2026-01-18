import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Users, Calendar, Clock } from "lucide-react";
import { ReportGenerator } from "./ReportGenerator";

export function Reports() {
  const leaveUtilizationData = [
    { department: "Engineering", used: 85, available: 20, utilization: 81 },
    { department: "Marketing", used: 72, available: 18, utilization: 80 },
    { department: "Sales", used: 65, available: 20, utilization: 76 },
    { department: "HR", used: 55, available: 18, utilization: 75 },
    { department: "Finance", used: 48, available: 20, utilization: 71 },
  ];

  const leaveTypeData = [
    { name: "Annual Leave", value: 45, color: "#3b82f6" },
    { name: "Sick Leave", value: 25, color: "#ef4444" },
    { name: "Personal Leave", value: 15, color: "#10b981" },
    { name: "Maternity Leave", value: 10, color: "#f59e0b" },
    { name: "Other", value: 5, color: "#8b5cf6" },
  ];

  const monthlyTrendData = [
    { month: "Jan", applications: 45, approved: 42, rejected: 3 },
    { month: "Feb", applications: 38, approved: 35, rejected: 3 },
    { month: "Mar", applications: 52, approved: 48, rejected: 4 },
    { month: "Apr", applications: 41, approved: 38, rejected: 3 },
    { month: "May", applications: 48, approved: 44, rejected: 4 },
    { month: "Jun", applications: 55, approved: 51, rejected: 4 },
    { month: "Jul", applications: 62, approved: 58, rejected: 4 },
    { month: "Aug", applications: 58, approved: 54, rejected: 4 },
    { month: "Sep", applications: 49, approved: 46, rejected: 3 },
    { month: "Oct", applications: 42, approved: 39, rejected: 3 },
  ];

  const attendanceData = [
    { department: "Engineering", present: 92, absent: 8, avgHours: 8.2 },
    { department: "Marketing", present: 89, absent: 11, avgHours: 8.0 },
    { department: "Sales", present: 94, absent: 6, avgHours: 8.4 },
    { department: "HR", present: 91, absent: 9, avgHours: 8.1 },
    { department: "Finance", present: 88, absent: 12, avgHours: 7.9 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">PDF Report Generator</TabsTrigger>
          <TabsTrigger value="analytics">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <ReportGenerator />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2>Reports & Analytics</h2>
                <p className="text-muted-foreground">Comprehensive insights into attendance and leave patterns</p>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="current-year">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-year">Current Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
              </div>
            </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-semibold">248</p>
              <p className="text-sm text-green-600">↑ 12% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Average Attendance</p>
              <p className="text-2xl font-semibold">91.2%</p>
              <p className="text-sm text-green-600">↑ 2.1% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Leave Utilization</p>
              <p className="text-2xl font-semibold">76.8%</p>
              <p className="text-sm text-orange-600">↑ 5.2% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Applications YTD</p>
              <p className="text-2xl font-semibold">490</p>
              <p className="text-sm text-green-600">↑ 8.4% from last year</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="leave-utilization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leave-utilization">Leave Utilization</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
        </TabsList>

        <TabsContent value="leave-utilization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Leave Utilization by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaveUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Bar dataKey="utilization" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Department Leave Summary</h3>
              <div className="space-y-4">
                {leaveUtilizationData.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{dept.department}</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.used} days used of {dept.used + dept.available} available
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={dept.utilization > 80 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {dept.utilization}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Attendance Rate by Department</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Average Working Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Bar dataKey="avgHours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Attendance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attendanceData.map((dept) => (
                <div key={dept.department} className="text-center p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">{dept.department}</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{dept.present}%</span>
                      <p className="text-sm text-muted-foreground">Present</p>
                    </div>
                    <div>
                      <span className="text-lg font-medium">{dept.avgHours}h</span>
                      <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">Monthly Application Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth="3" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth="2" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth="2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Approved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Rejected</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">94.2%</div>
              <p className="text-muted-foreground">Approval Rate</p>
              <p className="text-sm text-green-600 mt-1">↑ 1.2% from last quarter</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3.2</div>
              <p className="text-muted-foreground">Avg Days per Application</p>
              <p className="text-sm text-blue-600 mt-1">→ No change</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">1.8</div>
              <p className="text-muted-foreground">Avg Processing Time (days)</p>
              <p className="text-sm text-green-600 mt-1">↓ 0.3 days improvement</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leave-types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Leave Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Leave Type Statistics</h3>
              <div className="space-y-4">
                {leaveTypeData.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">{type.value}%</span>
                      <p className="text-sm text-muted-foreground">of total applications</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Top Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Most Popular Leave Type</h4>
                  <p className="text-blue-700">Annual Leave accounts for 45% of all applications, indicating healthy work-life balance usage.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Peak Application Period</h4>
                  <p className="text-green-700">July shows the highest number of applications (62), likely due to summer vacation planning.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Processing Efficiency</h4>
                  <p className="text-orange-700">Average processing time has improved by 0.3 days, showing better administrative efficiency.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Department Performance</h4>
                  <p className="text-purple-700">Sales department shows highest attendance rate (94%) and optimal leave utilization.</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}