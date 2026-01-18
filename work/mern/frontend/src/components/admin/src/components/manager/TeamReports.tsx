import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Users, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { ReportGenerator } from "../ReportGenerator";

export function TeamReports() {
  const teamAttendanceData = [
    { member: "Sarah J.", present: 18, absent: 2, late: 1, wfh: 2 },
    { member: "John S.", present: 16, absent: 3, late: 3, wfh: 1 },
    { member: "Emily D.", present: 19, absent: 1, late: 0, wfh: 3 },
    { member: "Alex W.", present: 20, absent: 0, late: 1, wfh: 2 },
    { member: "Lisa W.", present: 18, absent: 2, late: 0, wfh: 3 },
    { member: "David P.", present: 17, absent: 3, late: 2, wfh: 1 },
    { member: "Maria G.", present: 19, absent: 1, late: 1, wfh: 2 },
    { member: "Tom B.", present: 18, absent: 2, late: 2, wfh: 1 },
  ];

  const leaveUtilizationData = [
    { member: "Sarah Johnson", annual: 8, sick: 1, personal: 1, total: 10 },
    { member: "John Smith", annual: 5, sick: 3, personal: 0, total: 8 },
    { member: "Emily Davis", annual: 6, sick: 0, personal: 2, total: 8 },
    { member: "Alex Wilson", annual: 4, sick: 2, personal: 1, total: 7 },
    { member: "Lisa Wong", annual: 7, sick: 1, personal: 0, total: 8 },
    { member: "David Park", annual: 3, sick: 4, personal: 1, total: 8 },
  ];

  const monthlyTrendData = [
    { month: "Jan", attendance: 92, leaves: 8, productivity: 85 },
    { month: "Feb", attendance: 89, leaves: 12, productivity: 82 },
    { month: "Mar", attendance: 94, leaves: 6, productivity: 88 },
    { month: "Apr", attendance: 91, leaves: 10, productivity: 86 },
    { month: "May", attendance: 93, leaves: 7, productivity: 89 },
    { month: "Jun", attendance: 88, leaves: 15, productivity: 83 },
    { month: "Jul", attendance: 90, leaves: 11, productivity: 85 },
    { month: "Aug", attendance: 95, leaves: 5, productivity: 91 },
    { month: "Sep", attendance: 92, leaves: 9, productivity: 87 },
    { month: "Oct", attendance: 90, leaves: 11, productivity: 86 },
  ];

  const leaveTypeDistribution = [
    { name: "Annual Leave", value: 45, color: "#42c488" },
    { name: "Sick Leave", value: 30, color: "#ef4444" },
    { name: "Personal Leave", value: 15, color: "#3b82f6" },
    { name: "Emergency", value: 10, color: "#f59e0b" },
  ];

  const teamPerformanceMetrics = {
    totalTeamMembers: 8,
    averageAttendance: 92.5,
    totalLeavesTaken: 67,
    onTimeDeliveries: 94,
    teamProductivity: 87,
    substitutionSuccess: 95
  };

  const upcomingChallenges = [
    {
      type: "Multiple Leaves",
      description: "3 team members have overlapping leaves in December",
      impact: "High",
      mitigation: "Cross-training plan in progress"
    },
    {
      type: "Project Deadline",
      description: "Mobile app deadline coincides with holiday season",
      impact: "Medium",
      mitigation: "Early delivery buffer added"
    },
    {
      type: "Skill Gap",
      description: "Limited backend developers for substitute coverage",
      impact: "Medium",
      mitigation: "External contractor on standby"
    }
  ];

  const teamInsights = [
    {
      category: "Attendance Pattern",
      insight: "Team shows 15% higher attendance on Wednesdays compared to Mondays",
      trend: "positive",
      action: "Consider scheduling important meetings on Wednesdays"
    },
    {
      category: "Leave Planning",
      insight: "65% of annual leaves are taken in Q2 and Q4",
      trend: "neutral",
      action: "Encourage more balanced leave distribution"
    },
    {
      category: "Productivity Correlation",
      insight: "Teams with WFH flexibility show 8% higher productivity",
      trend: "positive",
      action: "Continue hybrid work model"
    },
    {
      category: "Substitute Effectiveness",
      insight: "Substitutions work best with 3+ days advance notice",
      trend: "neutral",
      action: "Implement early warning system for leave applications"
    }
  ];

  const getImpactColor = (impact: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-orange-100 text-orange-800 border-orange-200",
      Low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[impact as keyof typeof colors];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "positive": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negative": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">PDF Report Generator</TabsTrigger>
          <TabsTrigger value="analytics">Team Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <ReportGenerator />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2>Team Reports & Analytics</h2>
                <p className="text-muted-foreground">Comprehensive insights into team performance and attendance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="current-month">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-[#42c488]/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">Team Size</p>
              <p className="text-2xl font-semibold">{teamPerformanceMetrics.totalTeamMembers}</p>
              <p className="text-sm text-[#42c488]">active members</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Avg Attendance</p>
              <p className="text-2xl font-semibold">{teamPerformanceMetrics.averageAttendance}%</p>
              <p className="text-sm text-green-600">↑ 2.5% from last month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">Team Productivity</p>
              <p className="text-2xl font-semibold">{teamPerformanceMetrics.teamProductivity}%</p>
              <p className="text-sm text-blue-600">above baseline</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Analysis</TabsTrigger>
          <TabsTrigger value="leave-patterns">Leave Patterns</TabsTrigger>
          <TabsTrigger value="productivity">Productivity Metrics</TabsTrigger>
          <TabsTrigger value="insights">Team Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Individual Attendance Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="member" />
                  <YAxis />
                  <Bar dataKey="present" fill="#42c488" name="Present" />
                  <Bar dataKey="late" fill="#f59e0b" name="Late" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                  <Bar dataKey="wfh" fill="#8b5cf6" name="WFH" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Monthly Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#42c488" 
                    strokeWidth="3"
                    name="Attendance %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#3b82f6" 
                    strokeWidth="2"
                    name="Productivity %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Team Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamAttendanceData.map((member, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">{member.member}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Present:</span>
                      <span className="font-medium">{member.present} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">Late:</span>
                      <span className="font-medium">{member.late} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Absent:</span>
                      <span className="font-medium">{member.absent} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">WFH:</span>
                      <span className="font-medium">{member.wfh} days</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <Badge className="bg-primary/10 text-primary">
                        {Math.round((member.present / (member.present + member.absent + member.late)) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leave-patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-6">Leave Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveTypeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {leaveTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6">Individual Leave Utilization</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leaveUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="member" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Bar dataKey="annual" fill="#42c488" name="Annual" />
                  <Bar dataKey="sick" fill="#ef4444" name="Sick" />
                  <Bar dataKey="personal" fill="#3b82f6" name="Personal" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Leave Utilization Analysis</h3>
            <div className="space-y-4">
              {leaveUtilizationData.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{member.member}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {member.total} days • Annual: {member.annual} • Sick: {member.sick} • Personal: {member.personal}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      member.total <= 5 ? "bg-green-100 text-green-800" :
                      member.total <= 10 ? "bg-primary/10 text-primary" :
                      "bg-orange-100 text-orange-800"
                    }>
                      {member.total <= 5 ? "Low" : member.total <= 10 ? "Moderate" : "High"} Usage
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center border-[#42c488]/20">
              <div className="text-3xl font-bold text-[#42c488] mb-2">{teamPerformanceMetrics.onTimeDeliveries}%</div>
              <p className="text-sm text-muted-foreground">On-time Deliveries</p>
              <p className="text-xs text-[#42c488] mt-1">↑ 3% from last quarter</p>
            </Card>

            <Card className="p-6 text-center border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{teamPerformanceMetrics.substitutionSuccess}%</div>
              <p className="text-sm text-muted-foreground">Substitution Success</p>
              <p className="text-xs text-green-600 mt-1">Smooth coverage transitions</p>
            </Card>

            <Card className="p-6 text-center border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">2.1</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-xs text-blue-600 mt-1">hours for leave approvals</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6">Productivity vs Attendance Correlation</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#42c488" 
                  strokeWidth="3"
                  name="Attendance %"
                />
                <Line 
                  type="monotone" 
                  dataKey="productivity" 
                  stroke="#3b82f6" 
                  strokeWidth="3"
                  name="Productivity %"
                />
                <Line 
                  type="monotone" 
                  dataKey="leaves" 
                  stroke="#ef4444" 
                  strokeWidth="2"
                  name="Leave Days"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="mb-6">Upcoming Challenges</h3>
            <div className="space-y-4">
              {upcomingChallenges.map((challenge, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{challenge.type}</h4>
                    <Badge className={getImpactColor(challenge.impact)}>
                      {challenge.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded">
                    <p className="text-sm text-primary">
                      <span className="font-medium">Mitigation:</span> {challenge.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-6">AI-Powered Team Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getTrendIcon(insight.trend)}
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{insight.category}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.insight}</p>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Recommended Action:</span> {insight.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Team Strengths</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">High cross-functional collaboration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Excellent substitute coverage system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Proactive leave planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Strong work-life balance culture</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Monday morning punctuality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Leave distribution balance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Emergency leave procedures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Knowledge documentation for substitutes</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}