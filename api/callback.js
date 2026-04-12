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

  const { access_token, error } = await tokenRes.json();

  if (error || !access_token) {
    res.status(401).send('OAuth failed: ' + (error || 'no token'));
    return;
  }

  const content = JSON.stringify({ token: access_token, provider: 'github' });

  res.send(`<!DOCTYPE html><html><body><script>
    (function() {
      window.opener.postMessage(
        'authorization:github:success:' + ${JSON.stringify(content)},
        '*'
      );
      window.close();
    })();
  <\/script></body></html>`);
}
