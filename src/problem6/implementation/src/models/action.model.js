const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const actionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scoreValue: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    type: Object,
    default: {}
  },
  processed: {
    type: Boolean,
    default: false
  }
});

// Compound index for idempotent processing
actionSchema.index({ userId: 1, id: 1 });

module.exports = mongoose.model('Action', actionSchema);