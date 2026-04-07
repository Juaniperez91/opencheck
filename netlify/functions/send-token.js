const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, token, nombre } = JSON.parse(event.body);

  if (!email || !token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Email y token requeridos' })
    };
  }

  const payload = JSON.stringify({
    from: 'OpenCheck <onboarding@resend.dev>',
    to: [email],
    subject: 'Tu codigo de verificacion OpenCheck',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#1a7a4a;margin:0">OpenCheck</h2>
          <p style="color:#666;margin:4px 0 0">Marketplace de eCheques</p>
        </div>
        <p style="color:#333">Hola <strong>${nombre || ''}</strong>,</p>
        <p style="color:#333">Tu codigo de verificacion es:</p>
        <div style="text-align:center;margin:32px 0">
          <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#1a7a4a">${token}</span>
        </div>
        <p style="color:#888;font-size:13px">Este codigo vence en 10 minutos. No lo compartas con nadie.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#aaa;font-size:12px;text-align:center">OpenCheck — Marketplace de eCheques Argentina</p>
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