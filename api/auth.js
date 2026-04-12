module.exports = function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID,
    redirect_uri: 'https://planra.no/api/callback',
    scope: 'repo',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
