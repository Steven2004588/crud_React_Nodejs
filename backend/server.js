const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();  // Carga las variables del .env
const Product = require('./models/Product');
const app    = express();
const PORT   = process.env.PORT || 3000;

// — MIDDLEWARES ——————————————————————————————————————————————————
app.use(cors());             // Acepta peticiones desde React (otro puerto)
app.use(express.json());  // Parsea el body de las peticiones como JSON

// — CONEXIÓN A MONGODB ATLAS —————————————————————————————————————
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);  // Detiene el servidor si no puede conectar
  });

  app.get('/api/products', async (req, res) => {
  try {
    const products = await Product
      .find({})              // {} = sin filtro, trae todo
      .sort({ createdAt: -1 }); // -1 = más reciente primero
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ————————————————————————————————————————————————————————————————
// READ ONE – GET /api/products/:id
// Busca un producto por su _id de MongoDB
// ————————————————————————————————————————————————————————————————
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    // Si el id no tiene formato válido de ObjectId, mongoose lanza error
    res.status(400).json({ error: 'ID inválido' });
  }
});

// ————————————————————————————————————————————————————————————————
// CREATE – POST /api/products
// Crea un nuevo documento en la colección "products"
// ————————————————————————————————————————————————————————————————
app.post('/api/products', async (req, res) => {
  try {
    // new Product(req.body) crea la instancia con los datos del body
    const product = new Product(req.body);
    // .save() valida con el Schema y guarda en MongoDB
    const saved = await product.save();
    res.status(201).json(saved); // 201 = Created, devuelve el doc con su _id
  } catch (err) {
    // Mongoose lanza ValidationError automáticamente si falla el Schema
    res.status(400).json({ error: err.message });
  }
});

// ————————————————————————————————————————————————————————————————
// UPDATE – PUT /api/products/:id
// Actualiza los campos enviados en el body
// ————————————————————————————————————————————————————————————————
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, // ID a buscar
      req.body,      // Campos a actualizar
      {
        new: true,          // Devuelve el documento DESPUÉS del update
        runValidators: true, // Aplica las validaciones del Schema
      }
    );
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ————————————————————————————————————————————————————————————————
// DELETE – DELETE /api/products/:id
// Elimina permanentemente el documento de la colección
// ————————————————————————————————————————————————————————————————
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// — INICIAR SERVIDOR —————————————————————————————————————————————
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});