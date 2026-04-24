const mongoose = require('mongoose');

// Definir el esquema
// Cada campo tiene: tipo, si es requerido, valor por defecto, etc.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true, // elimina espacios al inicio y al final
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    // timestamps: true agrega automáticamente "createdAt" y "updatedAt"
    timestamps: true,
  }
);

// Crear el Model
// "Product" → Mongoose buscará/creará la colección "products" en MongoDB
const Product = mongoose.model('Product', productSchema);

module.exports = Product;