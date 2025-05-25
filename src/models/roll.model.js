import mongoose from 'mongoose';

const rollSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // sequence name
  seq: { type: Number, default: 250600 },     // current value
});

const Roll = mongoose.model('Roll', rollSchema);
export default Roll;
