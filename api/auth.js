module.exports = function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri: 'https://www.planra.no/api/callback',
    scope: 'repo',
  });
  const githubUrl = `https://github.com/login/oauth/authorize?${params}`;

  // Sveltia CMS requires the popup to send 'authorizing:github' before redirecting.
  // A plain redirect skips this handshake and causes an AbortError after 1 second.
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  }
  window.location.href = ${JSON.stringify(githubUrl)};
</script>
</body>
</html>`);
}
