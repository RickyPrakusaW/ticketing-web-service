const mongoose = require('mongoose');

const organizerSubscriptionSchema = new mongoose.Schema({
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription_plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrganizerSubscription', organizerSubscriptionSchema);