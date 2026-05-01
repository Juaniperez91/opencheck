const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);
  const tipo = body.tipo || '';
  const destinatario = body.destinatario || '';
  const data = body.data || {};

  if (!destinatario || !tipo) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Datos incompletos' })
    };
  }

  let subject = '';
  let html = '';

  if (tipo === 'nueva_oferta') {
    subject = 'Nueva oferta en tu eCheck — OpenCheck';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">'
      + '<h2 style="color:#0C4A72">OpenCheck</h2>'
      + '<p>Hola ' + (data.nombre || '') + ',</p>'
      + '<p>Recibiste una nueva oferta en uno de tus eCheques:</p>'
      + '<div style="background:white;padding:20px;border-radius:8px;border:1px solid #eee;margin:20px 0">'
      + '<p style="margin:6px 0"><strong>Librador:</strong> ' + (data.librador || '—') + '</p>'
      + '<p style="margin:6px 0"><strong>Monto:</strong> $' + (data.monto || '—') + '</p>'
      + '<p style="margin:6px 0"><strong>Tasa ofertada:</strong> ' + (data.tasa || '—') + '% TNA</p>'
      + '</div>'
      + '<p><a href="https://opencheck.pro/app" style="background:#0F6E56;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Ver oferta en OpenCheck</a></p>'
      + '<hr><p style="color:#aaa;font-size:12px">OpenCheck — Marketplace de eCheques</p>'
      + '</div>';
  } else if (tipo === 'oferta_aceptada') {
    subject = '¡Tu oferta fue aceptada! — OpenCheck';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">'
      + '<h2 style="color:#0C4A72">OpenCheck</h2>'
      + '<p>Hola ' + (data.nombre || '') + ',</p>'
      + '<p>¡Excelente noticia! Tu oferta fue <strong>aceptada</strong>:</p>'
      + '<div style="background:white;padding:20px;border-radius:8px;border:1px solid #eee;margin:20px 0">'
      + '<p style="margin:6px 0"><strong>Librador:</strong> ' + (data.librador || '—') + '</p>'
      + '<p style="margin:6px 0"><strong>Monto:</strong> $' + (data.monto || '—') + '</p>'
      + '<p style="margin:6px 0"><strong>Tasa acordada:</strong> ' + (data.tasa || '—') + '% TNA</p>'
      + '</div>'
      + '<p><a href="https://opencheck.pro/app" style="background:#0F6E56;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Ver detalle</a></p>'
      + '<hr><p style="color:#aaa;font-size:12px">OpenCheck — Marketplace de eCheques</p>'
      + '</div>';
  } else if (tipo === 'oferta_rechazada') {
    subject = 'Tu oferta fue rechazada — OpenCheck';
    html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">'
      + '<h2 style="color:#0C4A72">OpenCheck</h2>'
      + '<p>Hola ' + (data.nombre || '') + ',</p>'
      + '<p>Tu oferta fue rechazada:</p>'
      + '<div style="background:white;padding:20px;border-radius:8px;border:1px solid #eee;margin:20px 0">'
      + '<p style="margin:6px 0"><strong>Librador:</strong> ' + (data.librador || '—') + '</p>'
      + '<p style="margin:6px 0"><strong>Monto:</strong> $' + (data.monto || '—') + '</p>'
      + '</div>'
      + '<p>Podés explorar otros cheques disponibles en el marketplace.</p>'
      + '<p><a href="https://opencheck.pro/app" style="background:#0F6E56;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Explorar marketplace</a></p>'
      + '<hr><p style="color:#aaa;font-size:12px">OpenCheck — Marketplace de eCheques</p>'
      + '</div>';
  }

  const payload = JSON.stringify({
    from: 'OpenCheck <noreply@opencheck.pro>',
    to: [destinatario],
    subject: subject,
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