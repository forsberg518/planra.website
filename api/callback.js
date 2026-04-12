module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body>
      <p>Authorization denied: ${error}</p>
    </body></html>`);
    return;
  }

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await tokenRes.json();

  if (data.error || !data.access_token) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body>
      <p>OAuth failed: ${data.error || 'no token received'}</p>
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

    function sendMessage() {
      if (window.opener) {
        window.opener.postMessage(message, '*');
        document.getElementById('msg').textContent = 'Innlogging vellykket! Dette vinduet lukkes...';
        setTimeout(function() { window.close(); }, 500);
      } else {
        document.getElementById('msg').textContent = 'Feil: window.opener er null. Lukk dette vinduet og prøv igjen.';
      }
    }

    sendMessage();
  })();
</script>
</body>
</html>`);
};
