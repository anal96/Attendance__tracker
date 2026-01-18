import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { CheckCircle, Clock, AlertCircle, Pause, Calendar, Edit, Plus, Send, Inbox } from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedBy: { _id: string; name: string; usertype: string };
  assignedTo: { _id: string; name: string };
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "on_hold";
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function EmployeeTaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [taskView, setTaskView] = useState<"all" | "received" | "sent">("all");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    notes: ""
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    const interval = setInterval(fetchTasks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tasks', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      console.log('Fetched tasks:', data);
      console.log('Tasks count:', Array.isArray(data) ? data.length : 0);
      
      if (Array.isArray(data)) {
        // Log task breakdown
        const userId = Cookies.get('userId');
        const assignedToMe = data.filter(t => t.assignedTo && t.assignedTo._id === userId);
        const assignedByMe = data.filter(t => t.assignedBy && t.assignedBy._id === userId);
        console.log('Task breakdown:', {
          total: data.length,
          assignedToMe: assignedToMe.length,
          assignedByMe: assignedByMe.length,
          assignedToMeTasks: assignedToMe.map(t => ({ id: t._id, title: t.title, assignedBy: t.assignedBy?.name })),
          assignedByMeTasks: assignedByMe.map(t => ({ id: t._id, title: t.title, assignedTo: t.assignedTo?.name }))
        });
      }
      
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employee/employees', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const responseData = await response.json();
      console.log('Employees API response:', responseData);
      
      // Handle different response structures (for backward compatibility)
      let employeesArray = [];
      if (Array.isArray(responseData)) {
        employeesArray = responseData;
      } else if (responseData.employees && Array.isArray(responseData.employees)) {
        employeesArray = responseData.employees;
      } else if (responseData.teamMembers && Array.isArray(responseData.teamMembers)) {
        employeesArray = responseData.teamMembers;
      } else {
        console.error('Unexpected response structure:', responseData);
        setEmployees([]);
        return;
      }
      
      console.log('Employees array:', employeesArray);
      console.log('Employees count:', employeesArray.length);
      
      // Format employees to ensure correct structure with proper IDs
      const formattedEmployees = employeesArray.map(employee => ({
        _id: (employee._id && employee._id.toString()) || employee.id || '',
        name: employee.name || employee.displayName || 'Unknown',
        email: employee.email || '',
        department: employee.department || '',
        employeeId: employee.employeeId || ''
      })).filter(employee => employee._id); // Filter out any invalid entries
      
      console.log('Formatted employees:', formattedEmployees);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.assignedTo) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data.task, ...tasks]);
        resetForm();
        setIsCreateDialogOpen(false);
        fetchTasks(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
      notes: ""
    });
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate,
          notes: editingTask.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(t => t._id === editingTask._id ? data.task : t));
        setEditingTask(null);
        setIsEditDialogOpen(false);
        fetchTasks(); // Refresh
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "in_progress": return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "on_hold": return <Pause className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors];
  };

  const getAssignedByBadgeColor = (usertype: string) => {
    return usertype === 'manager' ? 
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' : 
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  };

  // Get current user ID
  const currentUserId = Cookies.get('userId');
  
  // Categorize tasks
  const receivedTasks = tasks.filter(task => 
    task.assignedTo && task.assignedTo._id === currentUserId
  );
  const sentTasks = tasks.filter(task => 
    task.assignedBy && task.assignedBy._id === currentUserId && 
    task.assignedTo && task.assignedTo._id !== currentUserId
  );
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || filterStatus === "all" || task.status === filterStatus;
    
    // Filter by view type
    let matchesView = true;
    if (taskView === "received") {
      matchesView = task.assignedTo && task.assignedTo._id === currentUserId;
    } else if (taskView === "sent") {
      matchesView = task.assignedBy && task.assignedBy._id === currentUserId && 
                    task.assignedTo && task.assignedTo._id !== currentUserId;
    }
    
    return matchesSearch && matchesStatus && matchesView;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    on_hold: filteredTasks.filter(t => t.status === 'on_hold')
  };

  const TaskCard = ({ task, showEditButton = true }: { task: Task; showEditButton?: boolean }) => {
    const isManagedByManager = task.assignedBy.usertype === 'manager';
    const isAssignedToMe = task.assignedTo && task.assignedTo._id === currentUserId;
    const isAssignedByMe = task.assignedBy && task.assignedBy._id === currentUserId;
    
    return (
      <Card className="p-4 !bg-white dark:!bg-gray-900 border-l-4" style={{
        borderLeftColor: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#ea580c' : '#3b82f6'
      }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon(task.status)}
              <h3 className="font-semibold text-foreground">{task.title}</h3>
              {isAssignedByMe && !isAssignedToMe && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  Sent by Me
                </Badge>
              )}
              {isAssignedToMe && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-xs">
                  <Inbox className="h-3 w-3 mr-1" />
                  Assigned to Me
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {isAssignedToMe && (
                <Badge className={getAssignedByBadgeColor(task.assignedBy.usertype)}>
                  {isManagedByManager ? 'From Manager' : 'From Employee'}: {task.assignedBy.name}
                </Badge>
              )}
              {isAssignedByMe && !isAssignedToMe && task.assignedTo && (
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                  Assigned To: {task.assignedTo.name}
                </Badge>
              )}
              {task.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), "MMM dd, yyyy")}
                </Badge>
              )}
            </div>
          </div>
          {showEditButton && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingTask(task);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {task.notes && (
          <div className="mt-3 p-3 !bg-gray-50 dark:!bg-gray-800/70 rounded-lg border-l-4 border-gray-400 dark:border-gray-400">
            <p className="text-sm text-gray-900 dark:!text-gray-100">
              <span className="font-semibold text-gray-900 dark:!text-gray-200">Notes:</span> <span className="dark:!text-gray-200">{task.notes}</span>
            </p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>My Tasks</h2>
          <p className="text-muted-foreground">View and manage your tasks ({receivedTasks.length} received, {sentTasks.length} sent)</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
            {tasksByStatus.pending.length} Pending
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            {tasksByStatus.in_progress.length} In Progress
          </Badge>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            {tasksByStatus.completed.length} Completed
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Assigning as: {Cookies.get("username") || "Current User"}
                </p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Task Title *</Label>
                  <Input
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter task description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign To *</Label>
                  <Select value={formData.assignedTo} onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder={employees.length > 0 ? "Select employee" : "Loading employees..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No employees available</div>
                      ) : (
                        employees.map(employee => {
                          const currentUserId = Cookies.get('userId');
                          const isCurrentUser = employee._id === currentUserId;
                          return (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.name} {isCurrentUser ? '(You)' : ''} {employee.department ? `(${employee.department})` : ''}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {employees.length === 0 && !loading && (
                    <p className="text-xs text-muted-foreground">No employees found. Please check your permissions.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm">Search Tasks</Label>
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Filter by Status</Label>
            <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">View</Label>
            <Select value={taskView} onValueChange={(val: "all" | "received" | "sent") => setTaskView(val)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks ({tasks.length})</SelectItem>
                <SelectItem value="received">Received ({receivedTasks.length})</SelectItem>
                <SelectItem value="sent">Sent by Me ({sentTasks.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tasks by Status */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Tasks ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({tasksByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({tasksByStatus.in_progress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tasksByStatus.completed.length})</TabsTrigger>
          <TabsTrigger value="on_hold">On Hold ({tasksByStatus.on_hold.length})</TabsTrigger>
        </TabsList>

        {/* All Tasks */}
        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No tasks assigned to you yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Tasks */}
        <TabsContent value="pending" className="space-y-4">
          {tasksByStatus.pending.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No pending tasks</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasksByStatus.pending.map(task => (
                <div key={task._id} className="!bg-orange-50 dark:!bg-orange-900/20">
                  <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <h3 className="font-semibold text-foreground">{task.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getAssignedByBadgeColor(task.assignedBy.usertype)}>
                            {task.assignedBy.usertype === 'manager' ? 'From Manager' : 'From Employee'}: {task.assignedBy.name}
                          </Badge>
                          {task.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.dueDate), "MMM dd, yyyy")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  {task.notes && (
                    <div className="mt-3 p-3 !bg-orange-100 dark:!bg-orange-800/70 rounded-lg border-l-4 border-orange-400 dark:!border-orange-400">
                      <p className="text-sm text-gray-900 dark:!text-orange-100">
                        <span className="font-semibold text-gray-900 dark:!text-orange-100">Notes:</span> <span className="dark:!text-orange-100">{task.notes}</span>
                      </p>
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* In Progress Tasks */}
        <TabsContent value="in_progress" className="space-y-4">
          {tasksByStatus.in_progress.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No tasks in progress</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasksByStatus.in_progress.map(task => (
                <div key={task._id} className="p-4 rounded-lg !bg-blue-50 dark:!bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getAssignedByBadgeColor(task.assignedBy.usertype)}>
                          {task.assignedBy.usertype === 'manager' ? 'From Manager' : 'From Employee'}: {task.assignedBy.name}
                        </Badge>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTask(task);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {task.notes && (
                    <div className="mt-3 p-3 !bg-blue-100 dark:!bg-blue-800/70 rounded-lg border-l-4 border-blue-400 dark:!border-blue-400">
                      <p className="text-sm text-gray-900 dark:!text-blue-100">
                        <span className="font-semibold text-gray-900 dark:!text-blue-100">Notes:</span> <span className="dark:!text-blue-100">{task.notes}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Completed Tasks */}
        <TabsContent value="completed" className="space-y-4">
          {tasksByStatus.completed.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No completed tasks yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasksByStatus.completed.map(task => (
                <div key={task._id} className="p-4 rounded-lg !bg-green-50 dark:!bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold text-foreground line-through">{task.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getAssignedByBadgeColor(task.assignedBy.usertype)}>
                          {task.assignedBy.usertype === 'manager' ? 'From Manager' : 'From Employee'}: {task.assignedBy.name}
                        </Badge>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {task.notes && (
                    <div className="mt-3 p-3 !bg-green-100 dark:!bg-green-800/70 rounded-lg border-l-4 border-green-400 dark:!border-green-400">
                      <p className="text-sm text-gray-900 dark:!text-green-100">
                        <span className="font-semibold text-gray-900 dark:!text-green-100">Notes:</span> <span className="dark:!text-green-100">{task.notes}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* On Hold Tasks */}
        <TabsContent value="on_hold" className="space-y-4">
          {tasksByStatus.on_hold.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No tasks on hold</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasksByStatus.on_hold.map(task => (
                <div key={task._id} className="p-4 rounded-lg !bg-gray-50 dark:!bg-gray-800/40 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Pause className="h-4 w-4 text-gray-600" />
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getAssignedByBadgeColor(task.assignedBy.usertype)}>
                          {task.assignedBy.usertype === 'manager' ? 'From Manager' : 'From Employee'}: {task.assignedBy.name}
                        </Badge>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTask(task);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {task.notes && (
                    <div className="mt-3 p-3 !bg-gray-100 dark:!bg-gray-800/70 rounded-lg border-l-4 border-gray-400 dark:!border-gray-400">
                      <p className="text-sm text-gray-900 dark:!text-gray-100">
                        <span className="font-semibold text-gray-900 dark:!text-gray-200">Notes:</span> <span className="dark:!text-gray-200">{task.notes}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Task Title</Label>
                <Input
                  disabled
                  value={editingTask.title}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea
                  disabled
                  rows={4}
                  value={editingTask.description}
                />
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={editingTask.status} onValueChange={(val) => setEditingTask({ ...editingTask, status: val as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editingTask.priority} onValueChange={(val) => setEditingTask({ ...editingTask, priority: val as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editingTask.notes}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdateTask}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}





