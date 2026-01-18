import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

interface LeaveType {
  _id?: string;
  type: string;
}

export function LeaveTypes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState({ type: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all leave types
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
    fetchLeaveTypes();
  }, []);

  // Submit new or edited leave type
  const handleSubmit = async () => {
    if (!formData.type.trim()) return alert("Please enter a leave type name.");

    try {
      const url = editingId
        ? `http://localhost:5000/updateleavetype/${editingId}`
        : "http://localhost:5000/addleavetype";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Leave type ${editingId ? "updated" : "created"} successfully!`);
        handleCancel();
        fetchLeaveTypes();
      } else {
        alert(data.message || "Failed to save leave type");
      }
    } catch (err) {
      console.error("❌ Error saving leave type:", err);
    }
  };

  // Delete leave type
  const handleDelete = async (id: string | undefined) => {
    if (!id || !confirm("Are you sure you want to delete this leave type?")) return;

    try {
      const response = await fetch(`http://localhost:5000/deleteleavetype/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Leave type deleted!");
        setLeaveTypes((prev) => prev.filter((lt) => lt._id !== id));
      } else {
        alert("❌ Failed to delete leave type.");
      }
    } catch (err) {
      console.error("❌ Error deleting leave type:", err);
    }
  };

  // Start editing
  const handleEdit = (leave: LeaveType) => {
    if (!leave._id) return;
    setFormData({ type: leave.type });
    setEditingId(leave._id);
    setIsDialogOpen(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({ type: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leave Types</h2>
          <p className="text-muted-foreground">Configure types of leave available to employees</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            handleCancel();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingId(null);
              setFormData({ type: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Label htmlFor="type">Leave Type Name</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ type: e.target.value })}
                placeholder="e.g., Sick Leave, Vacation, Personal"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards for each leave type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaveTypes.length === 0 ? (
          <p className="text-muted-foreground">No leave types found.</p>
        ) : (
          leaveTypes.map((leave) => (
            <Card key={leave._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{leave.type}</h3>
                    <p className="text-sm text-muted-foreground">{leave._id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-gray-100 text-gray-800 capitalize">{leave.type}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(leave)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(leave._id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Category</span>
                <span className="text-sm font-medium capitalize">{leave.type}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
