const express = require('express');
const bodyParser = require('body-parser');
const { getConnection, sql } = require('./dbConfig'); 

const app = express();
app.use(bodyParser.json());

// Ruta GET para la raíz que muestra un mensaje de bienvenida
app.get('/', (req, res) => {
    res.send('API Janam');
});

app.post('/webhook', async (req, res) => {
    try {
        // Datos de ejemplo de un pedido
        const order = req.body;

        // Verificar que line_items es un arreglo
        if (!Array.isArray(order.line_items)) {
            return res.status(400).send('Invalid payload structure: line_items should be an array');
        }

        // Conexión a la base de datos
        const pool = await getConnection();

        // Iterar sobre los artículos del pedido para actualizar el stock
        for (const item of order.line_items) {
            const sku = item.sku; // Asegúrate de que el SKU esté presente en los artículos
            const quantity = item.quantity; // Cantidad ordenada

            // Actualizar el stock en la base de datos
            await pool.request()
                .input('sku', sql.VarChar, sku)
                .input('quantity', sql.Int, quantity)
                .query('UPDATE productot SET cantidad = cantidad - @quantity WHERE cod_prod = @sku');
        }

        res.json({ message: 'Stock actualizado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al procesar el webhook');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
