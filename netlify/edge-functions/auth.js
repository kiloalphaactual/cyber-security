export default async (request, context) => {
  const url = new URL(request.url);
  const cookie = context.cookies.get("site-auth");

  // 1. ALLOW ASSETS (CSS/JS) to pass through without auth
  // This ensures the "Orange Bar" and theme always load
  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    return;
  }

  // 2. CHECK AUTH
  if (cookie === "authorized") {
    return context.next(); // <--- CRITICAL: This tells Netlify "Go to the actual file now"
  }

  // 3. HANDLE LOGIN POST
  if (request.method === "POST") {
    const formData = await request.formData();
    if (formData.get("password") === Netlify.env.get("SITE_PASSWORD")) {
      
      // Success! Redirect to where they were going
      const response = new Response(null, { status: 302 });
      response.headers.set("Location", url.pathname);
      
      context.cookies.set({
        name: "site-auth",
        value: "authorized",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
      });
      
      return response;
    }
  }

  // 4. SHOW LOCK SCREEN (Shortened for clarity)
  return new Response(`
    <html>
      <body style="background:#111; color:#00ff41; font-family:monospace; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
        <form method="POST" style="border:1px solid #00ff41; padding:2rem;">
          <h2 style="margin-top:0;">CREDENTIAL REQUIRED</h2>
          <input type="password" name="password" autofocus style="background:#000; border:1px solid #00ff41; color:#00ff41; padding:10px; width:100%; margin-bottom:1rem;">
          <button type="submit" style="background:#00ff41; color:#000; border:none; padding:10px; width:100%; cursor:pointer;">DECRYPT</button>
        </form>
      </body>
    </html>`, { headers: { "content-type": "text/html" } });
};