const express = require('express');
const bodyParser = require('body-parser');
const { getConnection, sql } = require('./dbConfig'); 

const app = express();
app.use(bodyParser.json());

// Ruta GET para la raíz que muestra un mensaje de bienvenida
app.get('/', (req, res) => {
    res.send('API Janam');  // Puedes cambiar esto por cualquier mensaje o HTML
});

app.post('/webhook', async (req, res) => {
    const { sku, quantity } = req.body; 
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('sku', sql.VarChar, sku)
            .input('quantity', sql.Int, quantity)
            .query('UPDATE productot SET cantidad = @quantity WHERE cod_prod = @sku');
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
