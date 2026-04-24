import { useState, useEffect } from 'react'
import axios from 'axios'

// —————————————————————————————————————————————————————————————————————————————
// COMPONENTE: ProductForm
// Sirve tanto para CREAR como para EDITAR un producto
// —————————————————————————————————————————————————————————————————————————————
function ProductForm({ onSave, editingProduct, onCancel }) {
  // Estado inicial del formulario
  const emptyForm = { name: '', price: '', stock: '', description: '' }
  const [form, setForm] = useState(emptyForm)

  // Cuando editingProduct cambia (el usuario hizo clic en Editar),
  // llenamos el formulario con los datos del producto
  useEffect(() => {
    setForm(editingProduct || emptyForm)
  }, [editingProduct])

  // Actualiza solo el campo que cambió, deja los demás igual
  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)        // Llama a la función del padre (crear o editar)
    setForm(emptyForm)  // Limpia el formulario
  }

  const styles = {
    form: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' },
    input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #dee2e6', fontSize: '14px', flex: '1', minWidth: '120px' },
    btn: { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        style={styles.input} name="name"
        placeholder="Nombre del producto" required
        value={form.name} onChange={handleChange}
      />
      <input
        style={styles.input} name="price"
        type="number" step="0.01" placeholder="Precio" required
        value={form.price} onChange={handleChange}
      />
      <input
        style={styles.input} name="stock"
        type="number" placeholder="Stock"
        value={form.stock} onChange={handleChange}
      />
      <input
        style={styles.input} name="description"
        placeholder="Descripción (opcional)"
        value={form.description} onChange={handleChange}
      />
      <button
        type="submit"
        style={{ ...styles.btn, background: editingProduct ? '#fd7e14' : '#28a745', color: '#fff' }}
      >
        {editingProduct ? '💾 Guardar cambios' : '➕ Agregar producto'}
      </button>
      {editingProduct && (
        <button
          type="button" onClick={onCancel}
          style={{ ...styles.btn, background: '#6c757d', color: '#fff' }}
        >
          Cancelar</button>
      )}
    </form>
  )
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENTE PRINCIPAL: App
// —————————————————————————————————————————————————————————————————————————————
export default function App() {
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Al montar el componente, cargar los productos
  useEffect(() => { fetchProducts() }, [])

  // — READ: Obtener todos los productos —
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/products')
      setProducts(data)
      setError('')
    } catch (e) {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  // — CREATE / UPDATE —
  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        // UPDATE: usa el _id de MongoDB
        await axios.put(`/api/products/${editingProduct._id}`, formData)
        setEditingProduct(null)
      } else {
        // CREATE
        await axios.post('/api/products', formData)
      }
      fetchProducts()  // Recarga la lista
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message))
    }
  }

  // — DELETE —
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await axios.delete(`/api/products/${id}`)
      fetchProducts()
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '8px' }
  const thStyle = { padding: '10px 14px', background: '#343a40', color: '#fff', textAlign: 'left', fontSize: '13px' }
  const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #dee2e6', fontSize: '14px' }
  const btnStyle = { padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '13px', marginRight: '4px' }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '8px' }}>📦 Gestión de Productos</h1>
      <p style={{ color: '#6c757d', marginBottom: '24px' }}>
        {products.length} producto(s) en la base de datos
      </p>

      <ProductForm
        onSave={handleSave}
        editingProduct={editingProduct}
        onCancel={() => setEditingProduct(null)}
      />

      {error && (
        <div style={{ background: '#f8d7da', color: '#842029', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#6c757d' }}>No hay productos todavía. ¡Agrega el primero! 👇</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}> {/* En MongoDB el ID es _id, no id */}
                <td style={tdStyle}><strong>{p.name}</strong></td>
                <td style={tdStyle}>${Number(p.price).toFixed(2)}</td>
                <td style={tdStyle}>{p.stock}</td>
                <td style={{ ...tdStyle, color: '#6c757d' }}>{p.description || '-'}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...btnStyle, background: '#fd7e14', color: '#fff' }}
                    onClick={() => setEditingProduct(p)}
                  >
                    📝 Editar</button>
                  <button
                    style={{ ...btnStyle, background: '#dc3545', color: '#fff' }}
                    onClick={() => handleDelete(p._id)}
                  >
                    🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}