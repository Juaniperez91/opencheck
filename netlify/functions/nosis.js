const https = require('https');

function parseNosisXML(xml) {
  var variables = [];
  var varRe = /<Variable>[\s\S]*?<Nombre>([^<]+)<\/Nombre>[\s\S]*?<Valor>([^<]*)<\/Valor>[\s\S]*?<\/Variable>/g;
  var match;
  while ((match = varRe.exec(xml)) !== null) {
    variables.push({ Nombre: match[1].trim(), Valor: match[2].trim() });
  }
  var estadoMatch = /<Estado>(\d+)<\/Estado>/.exec(xml);
  var novedadMatch = /<Novedad>([^<]+)<\/Novedad>/.exec(xml);
  return {
    Contenido: {
      Resultado: { Estado: estadoMatch ? parseInt(estadoMatch[1]) : 500, Novedad: novedadMatch ? novedadMatch[1] : '' },
      Datos: { Variables: variables }
    }
  };
}

exports.handler = async function(event) {
  const cuit = event.queryStringParameters && event.queryStringParameters.cuit;
  if (!cuit) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'CUIT requerido' })
    };
  }
  const NOSIS_KEY = '73643825-1dab-4d12-bff7-4d32af2331ba';
  const url = `https://ws01.nosis.com/rest/variables?documento=${cuit}&VR=1&formato=JSON`;
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'X-API-KEY': NOSIS_KEY, 'Accept': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(json)
          });
        } catch(e) {
          try {
            const parsed = parseNosisXML(data);
            resolve({
              statusCode: res.statusCode,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify(parsed)
            });
          } catch(e2) {
            resolve({
              statusCode: 500,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ error: 'Parse error: ' + e2.message })
            });
          }
        }
      });
    });
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: e.message })
      });
    });
    req.end();
  });
};
