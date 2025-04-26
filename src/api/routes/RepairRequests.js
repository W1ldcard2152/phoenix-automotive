import { Router } from 'express';
import * as RepairRequestModel from '../models/RepairRequestModel.js';
import mongoose from 'mongoose';

const router = Router();

// Create a new repair request
router.post('/', async (req, res) => {
  try {
    console.log('Creating new repair request with data:', req.body);
    const {
      customerInfo, vehicleInfo, serviceInfo
    } = req.body;

    // Validate required fields
    if (!customerInfo || !vehicleInfo || !serviceInfo) {
      return res.status(400).json({
        error: 'Missing required information'
      });
    }

    const repairRequest = new RepairRequestModel.RepairRequest({
      customerInfo,
      vehicleInfo,
      serviceInfo,
      status: 'pending' // Set initial status
    });

    const savedRequest = await repairRequest.save();
    console.log('Repair request saved successfully:', savedRequest._id);
    
    // Email notification could be added here in the future

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating repair request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Get all repair requests with optional filtering
router.get('/', async (req, res) => {
  try {
    console.log('Fetching repair requests with filters:', req.query);
    const { status, dateFrom, dateTo } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const requests = await RepairRequestModel.RepairRequest.find(query)
      .sort({ createdAt: -1 });
      
    console.log(`Found ${requests.length} repair requests`);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Get a specific repair request
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const request = await RepairRequestModel.RepairRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        error: 'Repair request not found'
      });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching repair request:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Update a repair request
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const updates = req.body;
    const request = await RepairRequestModel.RepairRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!request) {
      return res.status(404).json({
        error: 'Repair request not found'
      });
    }

    console.log('Repair request updated:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error updating repair request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Add a note to a repair request
router.post('/:id/notes', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const { content, author } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({
        error: 'Note content and author are required'
      });
    }
    
    const request = await RepairRequestModel.RepairRequest.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            content,
            author,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        error: 'Repair request not found'
      });
    }

    console.log('Note added to repair request:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error adding note to repair request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Update the status of a repair request
router.patch('/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const { status } = req.body;
    
    if (!status || !['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status provided'
      });
    }
    
    const request = await RepairRequestModel.RepairRequest.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { status },
        $push: {
          notes: {
            content: `Status updated to ${status}`,
            author: 'SYSTEM',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        error: 'Repair request not found'
      });
    }

    console.log('Status updated for repair request:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error updating repair request status:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Delete a repair request
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const request = await RepairRequestModel.RepairRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        error: 'Repair request not found'
      });
    }

    console.log('Repair request deleted:', req.params.id);
    res.json({
      message: 'Repair request deleted successfully',
      request
    });
  } catch (error) {
    console.error('Error deleting repair request:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;