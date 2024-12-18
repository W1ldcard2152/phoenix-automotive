import { Router } from 'express';
import * as PartRequestModel from '../models/PartRequestModel.js';
import mongoose from 'mongoose';

const router = Router();

// Create a new part request
router.post('/', async (req, res) => {
  try {
    console.log('Creating new part request with data:', req.body);
    const {
      vin, vehicleInfo, partDetails, customerInfo
    } = req.body;

    const partRequest = new PartRequestModel.PartRequest({
      vin,
      vehicleInfo,
      partDetails,
      customerInfo,
      status: 'pending' // Set initial status
    });

    const savedRequest = await partRequest.save();
    console.log('Part request saved successfully:', savedRequest._id);
    
    // Log email attempt but don't wait for it
    sendConfirmationEmail(savedRequest).catch(err => {
      console.error('Error sending confirmation email:', err);
    });

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating part request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Get all part requests with optional filtering
router.get('/', async (req, res) => {
  try {
    console.log('Fetching part requests with filters:', req.query);
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

    const requests = await PartRequestModel.PartRequest.find(query)
      .sort({ createdAt: -1 });
      
    console.log(`Found ${requests.length} part requests`);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching part requests:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Get a specific part request
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const request = await PartRequestModel.PartRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        error: 'Part request not found'
      });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching part request:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Update a part request
router.put('/:id', async (req, res) => {
  try {
    console.log('Received part request:', {
      body: req.body,
      headers: req.headers,
      url: req.url
    });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const updates = req.body;
    const request = await PartRequestModel.PartRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!request) {
      return res.status(404).json({
        error: 'Part request not found'
      });
    }

    console.log('Part request updated:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error updating part request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Add a note to a part request
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
    
    const request = await PartRequestModel.PartRequest.findByIdAndUpdate(
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
        error: 'Part request not found'
      });
    }

    console.log('Note added to part request:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error adding note to part request:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Update the status of a part request
router.patch('/:id/status', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'quoted', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status provided'
      });
    }
    
    const request = await PartRequestModel.PartRequest.findByIdAndUpdate(
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
        error: 'Part request not found'
      });
    }

    console.log('Status updated for part request:', request._id);
    res.json(request);
  } catch (error) {
    console.error('Error updating part request status:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Delete a part request
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid request ID format'
      });
    }

    const request = await PartRequestModel.PartRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        error: 'Part request not found'
      });
    }

    console.log('Part request deleted:', req.params.id);
    res.json({
      message: 'Part request deleted successfully',
      request
    });
  } catch (error) {
    console.error('Error deleting part request:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Helper function to send confirmation email
async function sendConfirmationEmail(partRequest) {
  // TODO: Implement actual email sending logic
  console.log('Sending confirmation email for part request:', partRequest._id);
  console.log('Customer email:', partRequest.customerInfo.email);
  return Promise.resolve(); // Placeholder for now
}

export default router;