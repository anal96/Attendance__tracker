import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Download, FileText, Calendar, Users, Clock } from "lucide-react";

export function ReportGenerator() {
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState("current-month");
  const [department, setDepartment] = useState("all");
  const [format, setFormat] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGenerateReport = () => {
    // TODO: Implement report generation logic
    const reportData = {
      reportType,
      dateRange,
      department,
      format,
      ...(dateRange === "custom" && { startDate, endDate })
    };
    
    console.log("Generating report:", reportData);
    
    // Placeholder: In a real implementation, this would call an API to generate the report
    if (dateRange === "custom") {
      alert(`Generating ${format.toUpperCase()} report: ${reportType} from ${startDate} to ${endDate} (${department === "all" ? "All Departments" : department})`);
    } else {
      alert(`Generating ${format.toUpperCase()} report: ${reportType} for ${dateRange} (${department === "all" ? "All Departments" : department})`);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">PDF Report Generator</h2>
            <p className="text-muted-foreground">Generate comprehensive reports in PDF format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="leave">Leave Report</SelectItem>
                <SelectItem value="employee">Employee Report</SelectItem>
                <SelectItem value="department">Department Report</SelectItem>
                <SelectItem value="summary">Summary Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="date-range">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Report Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {dateRange === "custom" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                type="date" 
                id="start-date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input 
                type="date" 
                id="end-date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={handleGenerateReport} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reports Generated</p>
              <p className="text-2xl font-semibold">1,247</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-semibold">89</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Generation Time</p>
              <p className="text-2xl font-semibold">3.2s</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

