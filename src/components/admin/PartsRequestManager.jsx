import React, { useState, useEffect } from 'react';
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
import { ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

const PartsRequestManager = () => {
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
      const data = await apiClient.partRequests.getAll();
      setRequests(data);
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

  if (loading) {
    return <div className="p-8 text-center">Loading part requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parts Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <React.Fragment key={request._id}>
                  <TableRow>
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
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.vehicleInfo.year} {request.vehicleInfo.make} {request.vehicleInfo.model}
                    </TableCell>
                    <TableCell>
                      {request.partDetails.system}: {request.partDetails.component}
                    </TableCell>
                    <TableCell>{request.customerInfo.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${request.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                        ${request.status === 'quoted' ? 'bg-purple-100 text-purple-800' : ''}
                        ${request.status === 'fulfilled' ? 'bg-green-100 text-green-800' : ''}
                        ${request.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(request._id) && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/50">
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                              {/* Vehicle Details */}
                              <div>
                                <h4 className="font-semibold mb-2">Vehicle Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">VIN:</span> {request.vin}</p>
                                  <p><span className="font-medium">Engine:</span> {request.vehicleInfo.engineSize}</p>
                                  {request.vehicleInfo.trim && (
                                    <p><span className="font-medium">Trim:</span> {request.vehicleInfo.trim}</p>
                                  )}
                                </div>
                              </div>

                              {/* Part Details */}
                              <div>
                                <h4 className="font-semibold mb-2">Part Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">System:</span> {request.partDetails.system}</p>
                                  <p><span className="font-medium">Component:</span> {request.partDetails.component}</p>
                                  {request.partDetails.otherComponent && (
                                    <p><span className="font-medium">Specified Component:</span> {request.partDetails.otherComponent}</p>
                                  )}
                                  {request.partDetails.additionalInfo && (
                                    <div className="mt-2">
                                      <p className="font-medium">Additional Information:</p>
                                      <p className="mt-1 text-muted-foreground">{request.partDetails.additionalInfo}</p>
                                    </div>
                                  )}
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
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartsRequestManager;