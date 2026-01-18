import { useState, useEffect, SetStateAction } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";

interface LeavePolicy {
  _id?: string;
  name: string;
  type: string;
  leaveTypeId?: string | { _id: string; type: string; leaveid?: string };
  accrualRate: number;
  maxDays: number;
  carryForward: boolean;
  carryForwardLimit: number;
  status: "active" | "inactive";
  description: string;
}

interface LeaveType {
  _id: string;
  type: string;
  leaveid?: string;
}

export function LeavePolicies() {
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    leaveTypeId: "",
    accrualRate: "",
    maxDays: "",
    carryForward: false,
    carryForwardLimit: "",
    status: "active",
    description: "",
  });

  // Fetch all policies from backend
  const fetchPolicies = async () => {
    try {
      const response = await fetch("http://localhost:5000/view_policy");
      const data = await response.json();
      setPolicies(data);
    } catch (err) {
      console.error("❌ Error fetching policies:", err);
    }
  };

  // Fetch all leave types from backend
  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch("http://localhost:5000/viewleavetype");
      const data = await response.json();
      setLeaveTypes(data);
    } catch (err) {
      console.error("❌ Error fetching leave types:", err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchLeaveTypes();
  }, []);

  // Get available leave types (not already used by existing policies)
  const getAvailableLeaveTypes = () => {
    if (isEditing && editingPolicyId) {
      // When editing, show all leave types (including the one currently used)
      return leaveTypes;
    }
    // When creating, filter out leave types already used by existing policies
    const usedLeaveTypeIds = policies
      .filter(p => p.leaveTypeId)
      .map(p => typeof p.leaveTypeId === 'object' ? p.leaveTypeId._id : p.leaveTypeId);
    return leaveTypes.filter(lt => !usedLeaveTypeIds.includes(lt._id));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };

  // Submit new or update policy
  const handleSubmit = async () => {
    try {
      const url = isEditing && editingPolicyId
        ? `http://localhost:5000/update_policy/${editingPolicyId}`
        : "http://localhost:5000/create_policy";
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(isEditing ? "✅ Leave policy updated successfully!" : "✅ Leave policy created successfully!");
        setIsAddPolicyOpen(false);
        setIsEditing(false);
        setEditingPolicyId(null);
        setFormData({
          name: "",
          type: "",
          leaveTypeId: "",
          accrualRate: "",
          maxDays: "",
          carryForward: false,
          carryForwardLimit: "",
          status: "active",
          description: "",
        });
        fetchPolicies(); // 🔄 Refresh list
      } else {
        alert(data.message || `Failed to ${isEditing ? "update" : "create"} policy`);
      }
    } catch (err) {
      console.error(`❌ Error ${isEditing ? "updating" : "creating"} policy:`, err);
      alert("Error connecting to backend");
    }
  };
  const handleEdit = (policy: LeavePolicy) => {
    if (!policy._id) return;
    
    setIsEditing(true);
    setEditingPolicyId(policy._id);
    const leaveTypeId = typeof policy.leaveTypeId === 'object' 
      ? policy.leaveTypeId?._id || "" 
      : policy.leaveTypeId || "";
    setFormData({
      name: policy.name || "",
      type: policy.type || "",
      leaveTypeId: leaveTypeId,
      accrualRate: policy.accrualRate?.toString() || "",
      maxDays: policy.maxDays?.toString() || "",
      carryForward: policy.carryForward || false,
      carryForwardLimit: policy.carryForwardLimit?.toString() || "",
      status: policy.status || "active",
      description: policy.description || "",
    });
    setIsAddPolicyOpen(true);
  };

  const handleCancel = () => {
    setIsAddPolicyOpen(false);
    setIsEditing(false);
    setEditingPolicyId(null);
    setFormData({
      name: "",
      type: "",
      leaveTypeId: "",
      accrualRate: "",
      maxDays: "",
      carryForward: false,
      carryForwardLimit: "",
      status: "active",
      description: "",
    });
  };

  const handleDelete = async (id: string | undefined) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    try {
      const response = await fetch(`http://localhost:5000/delete_policy/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ Policy deleted successfully!");
        setPolicies(policies.filter((p) => p._id !== id));
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting policy:", err);
      alert("Error connecting to backend");
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      maternity: "bg-pink-100 text-pink-800",
      personal: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Leave Policies</h2>
          <p className="text-muted-foreground">Configure leave types, accrual rates, and rules</p>
        </div>

        <Dialog open={isAddPolicyOpen} onOpenChange={(open) => {
          setIsAddPolicyOpen(open);
          if (open) {
            // Refresh leave types when dialog opens to get latest data
            fetchLeaveTypes();
            fetchPolicies();
          } else {
            handleCancel();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Leave Policy" : "Create Leave Policy"}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Policy Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Annual Leave" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveTypeId">Leave Type</Label>
                <Select 
                  value={formData.leaveTypeId} 
                  onValueChange={(value) => {
                    const selectedLeaveType = leaveTypes.find(lt => lt._id === value);
                    setFormData((prev) => ({ 
                      ...prev, 
                      leaveTypeId: value,
                      type: selectedLeaveType?.type || prev.type
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableLeaveTypes().length === 0 ? (
                      <SelectItem value="" disabled>No available leave types</SelectItem>
                    ) : (
                      getAvailableLeaveTypes().map((leaveType) => (
                        <SelectItem key={leaveType._id} value={leaveType._id}>
                          {leaveType.type}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {getAvailableLeaveTypes().length === 0 && !isEditing && (
                  <p className="text-sm text-muted-foreground">
                    All leave types are already assigned to policies. Please create a new leave type first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accrualRate">Accrual Rate (days/year)</Label>
                <Input id="accrualRate" type="number" value={formData.accrualRate} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDays">Max Days/Year</Label>
                <Input id="maxDays" type="number" value={formData.maxDays} onChange={handleChange} />
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  checked={formData.carryForward}
                  onCheckedChange={(checked: any) => setFormData((prev) => ({ ...prev, carryForward: checked }))}
                />
                <Label htmlFor="carryForward">Allow Carry Forward</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carryForwardLimit">Carry Forward Limit</Label>
                <Input id="carryForwardLimit" type="number" value={formData.carryForwardLimit} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Policy" : "Create Policy"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dynamic Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.length === 0 ? (
          <p className="text-muted-foreground">No policies found.</p>
        ) : (
          policies.map((policy) => (
            <Card key={policy._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{policy.name}</h3>
                    <p className="text-sm text-muted-foreground">{policy._id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(policy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => handleDelete(policy._id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>

                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge className={getTypeColor(policy.type)}>{policy.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accrual Rate</span>
                  <span className="text-sm">{policy.accrualRate} days/year</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Max Days</span>
                  <span className="text-sm">{policy.maxDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carry Forward</span>
                  <span className="text-sm">
                    {policy.carryForward ? `Yes (${policy.carryForwardLimit} days)` : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{policy.description}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

