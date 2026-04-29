export default async (request, context) => {
  const url = new URL(request.url);
  const cookie = context.cookies.get("site-auth");

  // 1. If cookie is present, proceed to the site
  if (cookie === "authorized") {
    return;
  }

  // 2. Handle Password Submission
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === Netlify.env.get("SITE_PASSWORD")) {
      // Create a Redirect response
      const response = new Response(null, {
        status: 302,
        headers: { "Location": url.pathname }
      });

      // Set the cookie on the Redirect response
      context.cookies.set({
        name: "site-auth",
        value: "authorized",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      });

      return response;
    }
  }

  // 3. The Lock Screen
  return new Response(`
    <html>
      <head><title>KiloAlpha Actual | Secure Access</title></head>
      <body style="background:#0a0a0a; color:#00ff41; font-family:monospace; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
        <form method="POST" style="border:1px solid #00ff41; padding:2rem; background:#000; box-shadow: 0 0 15px #00ff41;">
          <h2 style="text-transform:uppercase; letter-spacing:2px;">Credential Required</h2>
          <input type="password" name="password" autofocus style="background:#000; border:1px solid #00ff41; color:#00ff41; padding:10px; width:100%; margin-bottom:1rem; outline:none;">
          <button type="submit" style="background:#00ff41; color:#000; border:none; padding:10px 20px; width:100%; font-weight:bold; cursor:pointer;">DECRYPT</button>
        </form>
      </body>
    </html>`, { headers: { "Content-Type": "text/html" } });
};