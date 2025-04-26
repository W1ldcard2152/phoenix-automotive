import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp, Mail, Phone, Calendar, Car } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

const RepairRequestManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());


  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.repairRequests.getAll();
      setRequests(response);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getServiceTypeDisplay = (request) => {
    return request.serviceInfo.serviceType === 'Other' 
      ? request.serviceInfo.otherServiceType 
      : request.serviceInfo.serviceType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading repair requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repair Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <>
                  <TableRow key={request._id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRow(request._id)}
                      >
                        {expandedRows.has(request._id) ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>{request.customerInfo.name}</TableCell>
                    <TableCell>
                      {request.vehicleInfo.year} {request.vehicleInfo.make} {request.vehicleInfo.model}
                    </TableCell>
                    <TableCell>
                      {getServiceTypeDisplay(request)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadgeColor(request.serviceInfo.urgency)}`}>
                        {request.serviceInfo.urgency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(request._id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/50">
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                              {/* Vehicle Details */}
                              <div>
                                <h4 className="font-semibold mb-2">Vehicle Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">VIN:</span> {request.vehicleInfo.vin}</p>
                                  <p><span className="font-medium">Year/Make/Model:</span> {request.vehicleInfo.year} {request.vehicleInfo.make} {request.vehicleInfo.model}</p>
                                  {request.vehicleInfo.trim && (
                                    <p><span className="font-medium">Trim:</span> {request.vehicleInfo.trim}</p>
                                  )}
                                  <p><span className="font-medium">Mileage:</span> {request.vehicleInfo.mileage.toLocaleString()} miles</p>
                                  {request.vehicleInfo.engineSize && (
                                    <p><span className="font-medium">Engine:</span> {request.vehicleInfo.engineSize}</p>
                                  )}
                                </div>
                              </div>

                              {/* Service Details */}
                              <div>
                                <h4 className="font-semibold mb-2">Service Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Service Type:</span> {getServiceTypeDisplay(request)}</p>
                                  <p><span className="font-medium">Urgency:</span> {request.serviceInfo.urgency}</p>
                                  {request.serviceInfo.preferredDate && (
                                    <p><span className="font-medium">Preferred Date:</span> {formatDate(request.serviceInfo.preferredDate)}</p>
                                  )}
                                  <div className="mt-2">
                                    <p className="font-medium">Description:</p>
                                    <p className="mt-1 text-muted-foreground">{request.serviceInfo.description}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                              {/* Customer Information */}
                              <div>
                                <h4 className="font-semibold mb-2">Customer Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <a href={`mailto:${request.customerInfo.email}`} className="text-blue-600 hover:underline">
                                      {request.customerInfo.email}
                                    </a>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <a href={`tel:${request.customerInfo.phone}`} className="text-blue-600 hover:underline">
                                      {request.customerInfo.phone}
                                    </a>
                                  </p>
                                  {request.customerInfo.address.street && (
                                    <div className="pt-2">
                                      <p className="font-medium">Address:</p>
                                      <p>{request.customerInfo.address.street}</p>
                                      <p>
                                        {request.customerInfo.address.city && `${request.customerInfo.address.city}, `}
                                        {request.customerInfo.address.state} {request.customerInfo.address.zipCode}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Notes Section */}
                              <div>
                                <h4 className="font-semibold mb-2">Notes</h4>
                                <div className="space-y-2">
                                  {request.notes && request.notes.length > 0 ? (
                                    request.notes.map((note, index) => (
                                      <div key={index} className="bg-muted p-3 rounded-md text-sm">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                          <span>{note.author}</span>
                                          <span>{new Date(note.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p>{note.content}</p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No notes yet</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairRequestManager;