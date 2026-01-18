import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LogIn, LogOut, Search, Filter, Download, RefreshCw, AlertCircle, CheckCircle, XCircle, History, FileText } from "lucide-react";
import { LoadingPage } from "../LoadingPage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface UserLog {
  _id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  userType: string;
  action: 'login' | 'logout';
  ipAddress: string;
  userAgent: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  timestamp: string;
  status: 'success' | 'failed';
  failureReason?: string;
  formattedDate: string;
}

interface LogStatistics {
  totalLogins: number;
  totalLogouts: number;
  failedLogins: number;
  todayLogins: number;
  todayLogouts: number;
}

export function UserLogs() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 50;

  useEffect(() => {
    if (currentPage === 1) {
      fetchLogs();
    } else {
      setCurrentPage(1);
    }
  }, [actionFilter, userTypeFilter, statusFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: limit
      };

      if (actionFilter !== "all") params.action = actionFilter;
      if (userTypeFilter !== "all") params.userType = userTypeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get("http://localhost:5000/api/admin/user-logs", {
        params,
        withCredentials: true
      });

      console.log("📊 User Logs API Response:", response.data);
      console.log("📊 Logs count:", response.data.logs?.length || 0);
      console.log("📊 Statistics:", response.data.statistics);

      let filteredLogs = response.data.logs || [];

      // Apply search filter on frontend (for client-side filtering)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredLogs = filteredLogs.filter((log: UserLog) =>
          log.userName.toLowerCase().includes(query) ||
          log.userEmail.toLowerCase().includes(query) ||
          log.ipAddress.toLowerCase().includes(query) ||
          (log.location && log.location.toLowerCase().includes(query))
        );
      }

      setLogs(filteredLogs);
      setStatistics(response.data.statistics);
      setTotalPages(response.data.pagination.totalPages);
      setTotalLogs(response.data.pagination.totalLogs);
    } catch (err: any) {
      console.error("Error fetching user logs:", err);
      setError(err.response?.data?.error || "Failed to load user logs");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setActionFilter("all");
    setUserTypeFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    return action === 'login' ? (
      <LogIn className="h-4 w-4" />
    ) : (
      <LogOut className="h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const colors: { [key: string]: string } = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      employee: "bg-green-100 text-green-800",
      unknown: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={colors[userType] || colors.unknown}>
        {userType.charAt(0).toUpperCase() + userType.slice(1)}
      </Badge>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      ['User Name', 'Email', 'User Type', 'Action', 'Status', 'IP Address', 'Location', 'Latitude', 'Longitude', 'Accuracy (m)', 'Timestamp', 'Failure Reason'].join(','),
      ...logs.map(log => [
        log.userName,
        log.userEmail,
        log.userType,
        log.action,
        log.status,
        log.ipAddress,
        log.location || 'Unknown',
        log.latitude || '',
        log.longitude || '',
        log.accuracy ? Math.round(log.accuracy) : '',
        log.formattedDate,
        log.failureReason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    try {
      if (logs.length === 0) {
        alert('No logs to export. Please load logs first.');
        return;
      }
      
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('User Activity Logs Report', 14, 15);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      
      // Add statistics if available
      if (statistics) {
        doc.setFontSize(10);
        const statsText = `Total Logins: ${statistics.totalLogins} | Total Logouts: ${statistics.totalLogouts} | Failed Logins: ${statistics.failedLogins}`;
        // Split long text if needed
        const maxWidth = 270; // A4 landscape width minus margins
        const splitStats = doc.splitTextToSize(statsText, maxWidth);
        doc.text(splitStats, 14, 28);
      }
      
      // Prepare table data - ensure all values are strings
      const tableData = logs.map(log => [
        String(log.userName || 'N/A'),
        String(log.userEmail || 'N/A'),
        String(log.userType || 'N/A'),
        String(log.action || 'N/A'),
        String(log.status || 'N/A'),
        String(log.ipAddress || 'N/A'),
        String(log.location || 'Unknown'),
        log.latitude ? log.latitude.toFixed(6) : 'N/A',
        log.longitude ? log.longitude.toFixed(6) : 'N/A',
        log.accuracy ? String(Math.round(log.accuracy)) : 'N/A',
        String(log.formattedDate || 'N/A'),
        String(log.failureReason || '-')
      ]);
      
      // Try to use autoTable if available, otherwise use fallback
      try {
        // Use autoTable function directly (newer API)
        if (autoTable && typeof autoTable === 'function') {
          autoTable(doc, {
            head: [['User Name', 'Email', 'User Type', 'Action', 'Status', 'IP Address', 'Location', 'Latitude', 'Longitude', 'Accuracy (m)', 'Timestamp', 'Failure Reason']],
            body: tableData,
            startY: statistics ? 35 : 28,
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [66, 196, 136], // Brand green color
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245],
            },
            margin: { top: 14, right: 14, bottom: 14, left: 14 },
          });
        } else if ((doc as any).autoTable && typeof (doc as any).autoTable === 'function') {
          // Fallback to old API (method on doc)
          (doc as any).autoTable({
            head: [['User Name', 'Email', 'User Type', 'Action', 'Status', 'IP Address', 'Location', 'Latitude', 'Longitude', 'Accuracy (m)', 'Timestamp', 'Failure Reason']],
            body: tableData,
            startY: statistics ? 35 : 28,
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [66, 196, 136], // Brand green color
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245],
            },
            margin: { top: 14, right: 14, bottom: 14, left: 14 },
          });
        } else {
          throw new Error('autoTable not available');
        }
      } catch (autoTableError) {
        console.warn('autoTable not available, using fallback method:', autoTableError);
        // Fallback: Create simple table without autoTable
        let yPos = statistics ? 35 : 28;
        const colWidths = [25, 30, 15, 12, 12, 20, 30, 20, 20, 15, 30, 20];
        const headers = ['User Name', 'Email', 'Type', 'Action', 'Status', 'IP', 'Location', 'Lat', 'Lng', 'Acc', 'Timestamp', 'Reason'];
        
        // Draw header
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(66, 196, 136);
        let xPos = 14;
        headers.forEach((header, i) => {
          doc.rect(xPos, yPos, colWidths[i], 8, 'F');
          doc.text(header, xPos + 2, yPos + 5);
          xPos += colWidths[i];
        });
        
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        
        // Draw rows
        tableData.forEach((row, rowIndex) => {
          if (yPos > 190) { // New page if needed
            doc.addPage();
            yPos = 14;
            // Redraw header on new page
            xPos = 14;
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(66, 196, 136);
            headers.forEach((header, i) => {
              doc.rect(xPos, yPos, colWidths[i], 8, 'F');
              doc.text(header, xPos + 2, yPos + 5);
              xPos += colWidths[i];
            });
            yPos += 8;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(7);
          }
          xPos = 14;
          row.forEach((cell, colIndex) => {
            const cellText = doc.splitTextToSize(String(cell), colWidths[colIndex] - 2);
            doc.text(cellText, xPos + 1, yPos + 4);
            xPos += colWidths[colIndex];
          });
          yPos += 6;
        });
      }
      
      // Save PDF
      const fileName = `user-logs-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please check the console for details.`);
    }
  };

  if (loading && logs.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>User Activity Logs</h2>
          <p className="text-muted-foreground">Monitor employee login and logout activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <LogIn className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Logins</p>
                <p className="text-2xl font-semibold">{statistics.totalLogins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Logouts</p>
                <p className="text-2xl font-semibold">{statistics.totalLogouts}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-semibold">{statistics.failedLogins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <LogIn className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today Logins</p>
                <p className="text-2xl font-semibold">{statistics.todayLogins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today Logouts</p>
                <p className="text-2xl font-semibold">{statistics.todayLogouts}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name, email, IP, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Logs</h3>
          <p className="text-sm text-muted-foreground">
            Showing {logs.length} of {totalLogs} logs
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Timestamp</th>
                <th className="text-left p-3 font-semibold">User</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Action</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">IP Address</th>
                <th className="text-left p-3 font-semibold">Location</th>
                <th className="text-left p-3 font-semibold">Device</th>
                <th className="text-left p-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-muted rounded-full">
                        <History className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground mb-1">No logs found</p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {error ? (
                            <span className="text-red-600">{error}</span>
                          ) : (
                            <>
                              No login/logout activities have been recorded yet. Logs will appear here once users log in or log out of the system.
                              <br />
                              <span className="text-xs mt-2 block">
                                Tip: Try logging out and logging back in to generate test logs.
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm">{log.formattedDate}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{log.userName}</p>
                        <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-3">{getUserTypeBadge(log.userType)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(log.status)}</td>
                    <td className="p-3 text-sm font-mono">{log.ipAddress}</td>
                    <td className="p-3 text-sm">
                      <div className="space-y-1">
                        {log.location === 'Localhost' ? (
                          <span className="text-muted-foreground italic">Localhost</span>
                        ) : log.location && log.location !== 'Unknown' ? (
                          <span>{log.location}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Unknown</span>
                        )}
                        {log.latitude && log.longitude && (
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            📍 {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                            {log.accuracy && (
                              <span className="ml-1">(±{Math.round(log.accuracy)}m)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs truncate" title={log.userAgent}>
                      {log.userAgent}
                    </td>
                    <td className="p-3 text-sm text-red-600">
                      {log.failureReason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

