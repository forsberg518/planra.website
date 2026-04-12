const https = require('https');

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        Accept: 'application/json',
      },
    };
    const req = https.request(url, options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('Invalid JSON: ' + raw)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><p>Authorization denied: ${error}</p></body></html>`);
    return;
  }

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  let data;
  try {
    data = await postJSON('https://github.com/login/oauth/access_token', {
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    });
  } catch (err) {
    res.status(500).send('Token exchange failed: ' + err.message);
    return;
  }

  if (data.error || !data.access_token) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body>
      <p>OAuth feilet: ${data.error || 'ingen token mottatt'}</p>
      <pre>${JSON.stringify(data)}</pre>
    </body></html>`);
    return;
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head><title>Authorized</title></head>
<body>
<p id="msg">Fullfører innlogging...</p>
<script>
  (function() {
    var token = ${JSON.stringify(data.access_token)};
    var message = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
    var sent = false;
    function trySend() {
      if (window.opener && !sent) {
        sent = true;
        window.opener.postMessage(message, '*');
        document.getElementById('msg').textContent = 'Innlogging vellykket!';
        setTimeout(function() { window.close(); }, 2000);
      } else if (!window.opener) {
        document.getElementById('msg').textContent = 'Feil: window.opener er null. Lukk dette vinduet og prøv igjen.';
      }
    }
    // Try immediately, then retry once after a short delay
    trySend();
    setTimeout(trySend, 200);
  })();
</script>
</body>
</html>`);
};
