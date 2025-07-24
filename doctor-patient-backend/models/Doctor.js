import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Doctor name is required'] 
  },
  specialty: { 
    type: String, 
    required: [true, 'Specialty is required'] 
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'] 
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords) => coords.length === 2,
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  }
}, { timestamps: true });

// Required for $near/$geoWithin queries
doctorSchema.index({ location: '2dsphere' });

// Future utility method for formatted location string
doctorSchema.methods.getLocationString = function () {
  return `(${this.location.coordinates[1]}, ${this.location.coordinates[0]})`;
};

export default mongoose.model('Doctor', doctorSchema);
