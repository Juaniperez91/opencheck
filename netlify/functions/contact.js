const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { nombre, empresa, email, mensaje } = JSON.parse(event.body);

  if (!email || !nombre) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Datos incompletos' })
    };
  }

  const payload = JSON.stringify({
    from: 'OpenCheck <noreply@opencheck.pro>',
    to: ['juani_91_18@hotmail.com'],
    reply_to: email,
    subject: 'Nueva consulta desde opencheck.pro — ' + nombre,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#0C4A72;margin:0">OpenCheck</h2>
          <p style="color:#666;margin:4px 0 0">Nueva consulta desde opencheck.pro</p>
        </div>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#888;width:120px">Nombre</td><td style="padding:10px 0;font-weight:600;color:#333">${nombre}</td></tr>
          <tr><td style="padding:10px 0;color:#888">Empresa</td><td style="padding:10px 0;color:#333">${empresa || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#888">Email</td><td style="padding:10px 0;color:#1A6FA8">${email}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;backgroun
$contactCode = @'
const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { nombre, empresa, email, mensaje } = JSON.parse(event.body);

  if (!email || !nombre) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Datos incompletos' })
    };
  }

  const payload = JSON.stringify({
    from: 'OpenCheck <noreply@opencheck.pro>',
    to: ['juani_91_18@hotmail.com'],
    reply_to: email,
    subject: 'Nueva consulta desde opencheck.pro — ' + nombre,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#0C4A72;margin:0">OpenCheck</h2>
          <p style="color:#666;margin:4px 0 0">Nueva consulta desde opencheck.pro</p>
        </div>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:10px 0;color:#888;width:120px">Nombre</td><td style="padding:10px 0;font-weight:600;color:#333">${nombre}</td></tr>
          <tr><td style="padding:10px 0;color:#888">Empresa</td><td style="padding:10px 0;color:#333">${empresa || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#888">Email</td><td style="padding:10px 0;color:#1A6FA8">${email}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;background:white;border-radius:8px;border:1px solid #eee">
          <div style="font-size:12px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Mensaje</div>
          <p style="color:#333;line-height:1.7;margin:0">${mensaje || '(sin mensaje)'}</p>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#aaa;font-size:12px;text-align:center">Podés responder directamente a este email para contactar a ${nombre}</p>
      </div>
    `
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