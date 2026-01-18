import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Save, AlertCircle, CheckCircle2, Sun, Moon } from "lucide-react";
import { LoadingPage } from "../LoadingPage";

interface ShiftSettings {
  checkInStartTime: string;
  checkInEndTime: string;
  lateCheckInTime: string;
  checkOutStartTime: string;
  checkOutEndTime: string;
  earlyCheckOutTime: string;
}

interface AttendanceTimeSettings {
  _id?: string;
  dayShift: ShiftSettings;
  nightShift: ShiftSettings;
  isActive?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export function AttendanceTimeSettings() {
  const [settings, setSettings] = useState<AttendanceTimeSettings>({
    dayShift: {
      checkInStartTime: "08:00",
      checkInEndTime: "10:00",
      lateCheckInTime: "09:15",
      checkOutStartTime: "17:00",
      checkOutEndTime: "20:00",
      earlyCheckOutTime: "17:00"
    },
    nightShift: {
      checkInStartTime: "20:00",
      checkInEndTime: "22:00",
      lateCheckInTime: "21:15",
      checkOutStartTime: "05:00",
      checkOutEndTime: "08:00",
      earlyCheckOutTime: "05:00"
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/attendance-time-settings", {
        withCredentials: true
      });
      // Handle both old format (flat) and new format (nested)
      if (response.data.dayShift && response.data.nightShift) {
        setSettings(response.data);
      } else {
        // Migrate old format to new format
        setSettings({
          dayShift: {
            checkInStartTime: response.data.checkInStartTime || "08:00",
            checkInEndTime: response.data.checkInEndTime || "10:00",
            lateCheckInTime: response.data.lateCheckInTime || "09:15",
            checkOutStartTime: response.data.checkOutStartTime || "17:00",
            checkOutEndTime: response.data.checkOutEndTime || "20:00",
            earlyCheckOutTime: response.data.earlyCheckOutTime || "17:00"
          },
          nightShift: {
            checkInStartTime: "20:00",
            checkInEndTime: "22:00",
            lateCheckInTime: "21:15",
            checkOutStartTime: "05:00",
            checkOutEndTime: "08:00",
            earlyCheckOutTime: "05:00"
          }
        });
      }
      setMessage(null);
    } catch (error: any) {
      console.error("Error fetching attendance time settings:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to load attendance time settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (shift: "dayShift" | "nightShift", field: keyof ShiftSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [field]: value
      }
    }));
    setMessage(null);
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Validate all time fields for both shifts
      const timeFields: (keyof ShiftSettings)[] = [
        "checkInStartTime",
        "checkInEndTime",
        "checkOutEndTime"
      ];

      for (const field of timeFields) {
        if (!validateTime(settings.dayShift[field])) {
          setMessage({
            type: "error",
            text: `Invalid time format for day shift ${field.replace(/([A-Z])/g, ' $1').trim()}. Please use HH:MM format (24-hour).`
          });
          setSaving(false);
          return;
        }
        if (!validateTime(settings.nightShift[field])) {
          setMessage({
            type: "error",
            text: `Invalid time format for night shift ${field.replace(/([A-Z])/g, ' $1').trim()}. Please use HH:MM format (24-hour).`
          });
          setSaving(false);
          return;
        }
      }

      // Validate time ranges for day shift
      if (timeToMinutes(settings.dayShift.checkInStartTime) >= timeToMinutes(settings.dayShift.checkInEndTime)) {
        setMessage({
          type: "error",
          text: "Day shift: Check-in start time must be before check-in end time"
        });
        setSaving(false);
        return;
      }

      // Validate time ranges for night shift
      if (timeToMinutes(settings.nightShift.checkInStartTime) >= timeToMinutes(settings.nightShift.checkInEndTime)) {
        setMessage({
          type: "error",
          text: "Night shift: Check-in start time must be before check-in end time"
        });
        setSaving(false);
        return;
      }


      // Save settings
      const response = await axios.put(
        "http://localhost:5000/api/admin/attendance-time-settings",
        {
          dayShift: settings.dayShift,
          nightShift: settings.nightShift
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setMessage({
        type: "success",
        text: response.data.message || "Attendance time settings updated successfully"
      });

      // Refresh settings to get updated data
      await fetchSettings();

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error("Error saving attendance time settings:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save attendance time settings"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  const renderShiftSettings = (shift: "dayShift" | "nightShift", shiftLabel: string, icon: React.ReactNode) => {
    const shiftSettings = settings[shift];
    return (
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {icon}
          {shiftLabel} Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Check-in Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={shiftSettings.checkInStartTime}
              onChange={(e) => handleChange(shift, "checkInStartTime", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Earliest allowed check-in time
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Check-in End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={shiftSettings.checkInEndTime}
              onChange={(e) => handleChange(shift, "checkInEndTime", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Latest allowed check-in time
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Check-out Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={shiftSettings.checkOutEndTime}
              onChange={(e) => handleChange(shift, "checkOutEndTime", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Latest allowed check-out time
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Attendance Time Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure the allowed check-in and check-out time windows for day and night shift employees.
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Day Shift Settings */}
        {renderShiftSettings("dayShift", "Day Shift", <Sun className="h-5 w-5 text-primary" />)}

        {/* Night Shift Settings */}
        {renderShiftSettings("nightShift", "Night Shift", <Moon className="h-5 w-5 text-primary" />)}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>
                  <strong>Day Shift:</strong> Typically 8 AM - 5 PM. Employees assigned to day shift use these settings.
                </li>
                <li>
                  <strong>Night Shift:</strong> Typically 8 PM - 5 AM (next day). Employees assigned to night shift use these settings.
                </li>
                <li>
                  <strong>Employee Assignment:</strong> Admins can assign employees to day or night shift in User Management.
                </li>
                <li>
                  <strong>Late/Early Detection:</strong> The system automatically uses the appropriate shift settings based on the employee's assigned shift.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
            disabled={saving}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
