require('dotenv').config();

const { google } = require('googleapis');
const http = require('http');

const redirectUri = 'http://localhost:53682/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);

  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404);
    return res.end('Ruta no encontrada');
  }

  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400);
    return res.end('No se recibió el código de autorización');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\nREFRESH TOKEN:\n');
    console.log(tokens.refresh_token || 'Google no devolvió un refresh token');

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('Autorización completada. Puedes cerrar esta ventana.');

  } catch (error) {
    console.error('Error obteniendo tokens:', error);
    res.writeHead(500);
    res.end('No se pudo obtener el token');
  } finally {
    server.close();
  }
});

server.listen(53682, '127.0.0.1', () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive'],
  });

  console.log('\nAbre esta dirección en tu navegador:\n');
  console.log(authUrl);
});