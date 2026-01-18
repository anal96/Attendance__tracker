import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";

export function WFHRegistration() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [wfhData, setWfhData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");
  const [requestingUpdate, setRequestingUpdate] = useState(false);
  const [showUpdateRequestForm, setShowUpdateRequestForm] = useState(false);
  const [updateRequestStatus, setUpdateRequestStatus] = useState<string | null>(null);

  // Fetch existing registration
  useEffect(() => {
    fetchRegistration();
  }, []);

  const fetchRegistration = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wfh/my-registration", {
        withCredentials: true
      });
      if (response.data.registered) {
        setRegistered(true);
        setWfhData(response.data.wfhRecord);
        setAddress(response.data.wfhRecord.address);
        setCity(response.data.wfhRecord.city);
        setState(response.data.wfhRecord.state);
        setCountry(response.data.wfhRecord.country);
        setPostalCode(response.data.wfhRecord.postalCode || "");
        setLatitude(response.data.wfhRecord.latitude);
        setLongitude(response.data.wfhRecord.longitude);
        setAccuracy(response.data.wfhRecord.accuracy);
        
        // Check update request status
        if (response.data.wfhRecord.updateRequest) {
          setUpdateRequestStatus(response.data.wfhRecord.updateRequest.status);
          
          // If approved, show approved status and allow editing for 24 hours
          if (response.data.wfhRecord.updateRequest.status === 'approved' && response.data.wfhRecord.updateRequest.reviewedAt) {
            const reviewedDate = new Date(response.data.wfhRecord.updateRequest.reviewedAt);
            const hoursSinceApproval = (Date.now() - reviewedDate.getTime()) / (1000 * 60 * 60);
            if (hoursSinceApproval > 24) {
              setUpdateRequestStatus(null);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching WFH registration:", error);
    }
  };

  // Get browser location
  const getCurrentLocation = () => {
    return new Promise<any>((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        console.warn('⏱️ Location detection timeout. VPN may be slowing down location detection.');
        resolve(null);
      }, 30000); // Increased timeout for VPN scenarios

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Got location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          // Reverse geocode to get address
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(res => res.json())
            .then(data => {
              const addressParts = [];
              if (data.locality) addressParts.push(data.locality);
              if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
              if (data.countryName) addressParts.push(data.countryName);
              const fullAddress = addressParts.join(", ");
              
              resolve({
                latitude,
                longitude,
                accuracy,
                address: data.localityInfo?.administrative?.[0]?.name || data.locality || "",
                city: data.locality || data.city || "",
                state: data.principalSubdivision || "",
                country: data.countryName || "",
                postalCode: data.postcode || "",
                fullAddress
              });
            })
            .catch(err => {
              console.warn('⚠️ Reverse geocoding failed, using coordinates:', err);
              resolve({ latitude, longitude, accuracy, fullAddress: `${latitude}, ${longitude}` });
            });
        },
        (error) => {
          clearTimeout(timeout);
          if (error.code === 1) {
            console.error('❌ Location permission denied');
            console.warn('⚠️ VPN may interfere with location permissions. Check browser settings.');
          } else if (error.code === 2) {
            console.error('❌ Location unavailable');
            console.warn('⚠️ VPN detected: VPN may be blocking location access. Try disabling VPN temporarily.');
          } else if (error.code === 3) {
            console.error('❌ Location timeout');
            console.warn('⚠️ VPN detected: VPN can slow down location detection. Please try again.');
          } else {
            console.error('❌ Location error:', error.message);
            console.warn('⚠️ VPN may be interfering with location detection.');
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout for VPN scenarios
          maximumAge: 0
        }
      );
    });
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError("");
    
    const location = await getCurrentLocation();
    
    if (!location) {
      setError("Failed to get location. Please check:\n1. Location permission is allowed in browser settings\n2. If using VPN, try disabling it temporarily\n3. Ensure GPS/WiFi is enabled\n4. Try refreshing the page and try again");
      setGettingLocation(false);
      return;
    }

    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAccuracy(location.accuracy);
    
    if (location.address) setAddress(location.address);
    if (location.city) setCity(location.city);
    if (location.state) setState(location.state);
    if (location.country) setCountry(location.country);
    if (location.postalCode) setPostalCode(location.postalCode);
    
    setLocationAddress(location.fullAddress || `${location.latitude}, ${location.longitude}`);
    setShowConfirmDialog(true);
    setGettingLocation(false);
  };

  const handleRegister = async () => {
    // Validate all required fields
    const missingFields = [];
    if (!address || address.trim() === "") missingFields.push("Street Address");
    if (!city || city.trim() === "") missingFields.push("City");
    if (!state || state.trim() === "") missingFields.push("State/Province");
    if (!country || country.trim() === "") missingFields.push("Country");
    if (latitude === null || latitude === undefined || isNaN(latitude)) missingFields.push("Latitude (Get Location)");
    if (longitude === null || longitude === undefined || isNaN(longitude)) missingFields.push("Longitude (Get Location)");

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate coordinates are valid numbers
    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      setError("Invalid coordinates. Please click 'Get My Location' again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/wfh/register",
        {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postalCode: postalCode ? postalCode.trim() : null,
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy ? Number(accuracy) : null
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setSuccess(registered ? "WFH address updated successfully!" : "WFH address registered successfully!");
      setRegistered(true);
      setWfhData(response.data.wfhRecord);
      setShowConfirmDialog(false);
      
      // Refresh registration data
      await fetchRegistration();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || "Failed to register WFH address";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = async () => {
    // If approved, use regular register endpoint to save changes
    if (updateRequestStatus === 'approved') {
      await handleRegister();
      return;
    }

    // Validate all required fields
    const missingFields = [];
    if (!address || address.trim() === "") missingFields.push("Street Address");
    if (!city || city.trim() === "") missingFields.push("City");
    if (!state || state.trim() === "") missingFields.push("State/Province");
    if (!country || country.trim() === "") missingFields.push("Country");
    if (latitude === null || latitude === undefined || isNaN(latitude)) missingFields.push("Latitude (Get Location)");
    if (longitude === null || longitude === undefined || isNaN(longitude)) missingFields.push("Longitude (Get Location)");

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      setError("Invalid coordinates. Please click 'Get My Location' again.");
      return;
    }

    setRequestingUpdate(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/wfh/request-update",
        {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postalCode: postalCode ? postalCode.trim() : null,
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: accuracy ? Number(accuracy) : null
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      setSuccess("Update request submitted successfully! Your manager/admin will review it.");
      setUpdateRequestStatus("pending");
      setShowUpdateRequestForm(false);
      await fetchRegistration();
      setTimeout(() => setSuccess(""), 5000);
    } catch (error: any) {
      console.error("Request update error:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || "Failed to submit update request";
      setError(errorMessage);
    } finally {
      setRequestingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Work From Home Registration</h2>
        <p className="text-muted-foreground">
          Register your home address and exact coordinates for work-from-home verification
        </p>
      </div>

      {/* Approval Required Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Important:</strong> Your work from home registration must be approved by your manager or admin before you can register on this page. Please ensure you have received approval before proceeding.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Home Address Details</h3>
              {registered && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>
            {registered && wfhData && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>✓ Registration Active</strong>
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-green-800">
                        <strong>Registered on:</strong> {wfhData.createdAt ? new Date(wfhData.createdAt).toLocaleDateString() : "N/A"}
                        {wfhData.lastUpdated && wfhData.lastUpdated !== wfhData.createdAt && (
                          <span className="ml-2"> • <strong>Last updated:</strong> {new Date(wfhData.lastUpdated).toLocaleDateString()}</span>
                        )}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>Current Address:</strong> {wfhData.address}, {wfhData.city}, {wfhData.state}, {wfhData.country}
                      </p>
                      {wfhData.isVerified && (
                        <p className="text-sm text-green-800">
                          <strong>Status:</strong> <span className="text-green-600">✓ Verified by Admin</span>
                        </p>
                      )}
                      {updateRequestStatus === 'pending' && (
                        <p className="text-sm text-orange-800">
                          <strong>Update Request:</strong> <span className="text-orange-600">⏳ Pending Approval</span>
                        </p>
                      )}
                      {updateRequestStatus === 'approved' && (
                        <p className="text-sm text-green-800">
                          <strong>Update Request:</strong> <span className="text-green-600">✅ Approved - You can now edit</span>
                        </p>
                      )}
                      {updateRequestStatus === 'rejected' && (
                        <p className="text-sm text-red-800">
                          <strong>Update Request:</strong> <span className="text-red-600">❌ Rejected</span>
                          {wfhData.updateRequest?.reviewComments && (
                            <span className="block mt-1">Comments: {wfhData.updateRequest.reviewComments}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  {!showUpdateRequestForm && updateRequestStatus !== 'pending' && updateRequestStatus !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowUpdateRequestForm(true);
                        // Reset to current values for editing
                        setAddress(wfhData.address);
                        setCity(wfhData.city);
                        setState(wfhData.state);
                        setCountry(wfhData.country);
                        setPostalCode(wfhData.postalCode || "");
                        setLatitude(wfhData.latitude);
                        setLongitude(wfhData.longitude);
                        setAccuracy(wfhData.accuracy);
                      }}
                      className="ml-4 whitespace-nowrap"
                      disabled={loading}
                    >
                      Request Update
                    </Button>
                  )}
                </div>
                {updateRequestStatus === 'pending' ? (
                  <Alert className="mt-3 bg-orange-100 border-orange-300">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-900 text-sm">
                      <strong>⏳ Update Request Pending:</strong> Your update request has been submitted and is awaiting approval from your manager or admin. You will be notified once it's reviewed.
                    </AlertDescription>
                  </Alert>
                ) : updateRequestStatus === 'approved' ? (
                  <Alert className="mt-3 bg-blue-100 border-blue-300">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 text-sm">
                      <strong>✅ Update Approved:</strong> Your update request has been approved! You can now edit the fields below and save changes. This editing window is available for 24 hours after approval.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="mt-3 bg-green-100 border-green-300">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 text-sm">
                      <strong>✓ Registration Complete:</strong> Your WFH address has been successfully registered. Click "Request Update" above to request changes to your address.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address"
                required
                disabled={loading || (registered && !showUpdateRequestForm && updateRequestStatus !== 'approved')}
                className={registered && !showUpdateRequestForm && updateRequestStatus !== 'approved' ? "bg-gray-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
                required
                disabled={loading || (registered && !showUpdateRequestForm && updateRequestStatus !== 'approved')}
                className={registered && !showUpdateRequestForm && updateRequestStatus !== 'approved' ? "bg-gray-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state"
                required
                disabled={loading || (registered && !showUpdateRequestForm && updateRequestStatus !== 'approved')}
                className={registered && !showUpdateRequestForm && updateRequestStatus !== 'approved' ? "bg-gray-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter country"
                required
                disabled={loading || (registered && !showUpdateRequestForm && updateRequestStatus !== 'approved')}
                className={registered && !showUpdateRequestForm && updateRequestStatus !== 'approved' ? "bg-gray-50" : ""}
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal/Zip Code</Label>
              <Input
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code"
                disabled={loading || (registered && !showUpdateRequestForm && updateRequestStatus !== 'approved')}
                className={registered && !showUpdateRequestForm && updateRequestStatus !== 'approved' ? "bg-gray-50" : ""}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold mb-1">Location Coordinates</h4>
                <p className="text-sm text-muted-foreground">
                  {registered ? "Registered GPS coordinates for location verification" : "Get your exact GPS coordinates for location verification"}
                </p>
              </div>
              {(!registered || showUpdateRequestForm || updateRequestStatus === 'approved') && (
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation || loading || requestingUpdate}
                  variant="outline"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      {registered ? "Update Location" : "Get My Location"}
                    </>
                  )}
                </Button>
              )}
            </div>

            {latitude && longitude && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <Label className="text-sm text-muted-foreground">Latitude</Label>
                  <p className="font-mono text-sm font-semibold">{latitude.toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Longitude</Label>
                  <p className="font-mono text-sm font-semibold">{longitude.toFixed(6)}</p>
                </div>
                {accuracy && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Accuracy</Label>
                    <p className="font-mono text-sm font-semibold">±{accuracy.toFixed(0)}m</p>
                  </div>
                )}
              </div>
            )}

            {!latitude && !longitude && (!registered || showUpdateRequestForm || updateRequestStatus === 'approved') && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click "Get My Location" to automatically capture your GPS coordinates. 
                  This is required for location verification during check-in.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="pt-4 border-t">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Important:</strong> Your location will be verified during check-in. 
                If your check-in location is more than 500 meters (1/2 km) away from your registered address, 
                an alert will be sent to you, your manager, and admin.
              </AlertDescription>
            </Alert>
          </div>

          {(!registered || showUpdateRequestForm || updateRequestStatus === 'approved') && (
            <div className="flex justify-end gap-3">
              {showUpdateRequestForm && updateRequestStatus !== 'approved' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUpdateRequestForm(false);
                    setError("");
                    // Reset to original values
                    if (wfhData) {
                      setAddress(wfhData.address);
                      setCity(wfhData.city);
                      setState(wfhData.state);
                      setCountry(wfhData.country);
                      setPostalCode(wfhData.postalCode || "");
                      setLatitude(wfhData.latitude);
                      setLongitude(wfhData.longitude);
                      setAccuracy(wfhData.accuracy);
                    }
                  }}
                  disabled={requestingUpdate}
                  type="button"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={registered ? handleRequestUpdate : handleRegister}
                disabled={loading || gettingLocation || requestingUpdate || !address?.trim() || !city?.trim() || !state?.trim() || !country?.trim() || latitude === null || latitude === undefined || isNaN(latitude) || longitude === null || longitude === undefined || isNaN(longitude)}
                type="button"
              >
                {loading || requestingUpdate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {registered ? "Submitting Request..." : "Registering..."}
                  </>
                ) : registered ? (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    {updateRequestStatus === 'approved' ? "Save Changes" : "Submit Update Request"}
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Register Address
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Location Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Location</DialogTitle>
            <DialogDescription>
              Please verify the location details below before registering:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Detected Address:</Label>
              <p className="font-medium">{locationAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Latitude:</Label>
                <p className="font-mono text-sm">{latitude?.toFixed(6)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Longitude:</Label>
                <p className="font-mono text-sm">{longitude?.toFixed(6)}</p>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Please review and update the address fields above if needed before registering.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
              <Button onClick={() => { 
                setShowConfirmDialog(false); 
                if (registered) {
                  handleRequestUpdate();
                } else {
                  handleRegister();
                }
              }}>
                Confirm & {registered ? "Submit Request" : "Register"}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


