const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const nombre = body.nombre || '';
  const empresa = body.empresa || '';
  const email = body.email || '';
  const celular = body.celular || '';
  const mensaje = body.mensaje || '';

  if (!email || !nombre) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Datos incompletos' })
    };
  }

  const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">'
    + '<h2 style="color:#0C4A72">OpenCheck — Nueva consulta</h2>'
    + '<p><strong>Nombre:</strong> ' + nombre + '</p>'
    + '<p><strong>Empresa:</strong> ' + (empresa || '—') + '</p>'
    + '<p><strong>Email:</strong> ' + email + '</p>'
    + '<p><strong>Celular:</strong> ' + (celular || '—') + '</p>'
    + '<p><strong>Mensaje:</strong> ' + (mensaje || '(sin mensaje)') + '</p>'
    + '<hr><p style="color:#aaa;font-size:12px">Responde a este email para contactar a ' + nombre + '</p>'
    + '</div>';

  const payload = JSON.stringify({
    from: 'OpenCheck <noreply@opencheck.pro>',
    to: ['juani_91_18@hotmail.com'],
    reply_to: email,
    subject: 'Nueva consulta desde opencheck.pro — ' + nombre,
    html: html
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_RRoAZbTh_6ngNqbYGTd8rj5Aq7nk5uV6S',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: data
        });
      });
    });
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: e.message })
      });
    });
    req.write(payload);
    req.end();
  });
};