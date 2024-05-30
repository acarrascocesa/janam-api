const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { getConnection, sql } = require('./dbConfig'); 

const app = express();
app.use(bodyParser.json());

// Ruta GET para la raíz que muestra un mensaje de bienvenida
app.get('/', (req, res) => {
    res.send('API Janam');
});

app.post('/webhook', async (req, res) => {
    const secret = 'apijanam'; // El mismo secreto configurado en WooCommerce
    const signature = req.headers['x-wc-webhook-signature'];
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(JSON.stringify(req.body)).digest('base64');

    console.log('Received Signature:', signature);
    console.log('Calculated Digest:', digest);

    if (digest !== signature) {
        console.log('Signatures do not match');
        return res.status(401).send('Invalid signature');
    }

    try {
        const order = req.body;

        if (!Array.isArray(order.line_items)) {
            return res.status(400).send('Invalid payload structure: line_items should be an array');
        }

        const pool = await getConnection();

        for (const item of order.line_items) {
            const sku = item.sku;
            const quantity = item.quantity;

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
