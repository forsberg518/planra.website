module.exports = async function handler(req, res) {
  const { code } = req.query;

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
    res.status(401).send('OAuth failed: ' + (data.error || 'no token'));
    return;
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head><title>Authorized</title></head>
<body>
<script>
  (function() {
    var token = ${JSON.stringify(data.access_token)};
    var msg = 'authorization:github:success:' + JSON.stringify({ token: token, provider: 'github' });
    if (window.opener) {
      window.opener.postMessage(msg, '*');
    }
    window.close();
  })();
</script>
</body>
</html>`);
};
