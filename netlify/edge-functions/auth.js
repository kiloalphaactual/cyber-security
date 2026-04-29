export default async (request, context) => {
  const url = new URL(request.url);
  const cookie = context.cookies.get("site-auth");
  
  // 1. If already authorized, let them through
  if (cookie === "authorized") {
    return; 
  }

  // 2. If submitting the password via the form
  if (request.method === "POST") {
    const body = await request.formData();
    // Fetch your password from Netlify Environment Variables
    if (body.get("password") === Netlify.env.get("SITE_PASSWORD")) {
      const response = context.next();
      context.cookies.set({
        name: "site-auth",
        value: "authorized",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      return response;
    }
  }

  // 3. Otherwise, show the login screen
  return new Response(`
    <html>
      <body style="background:#111; color:#eee; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh;">
        <form method="POST" style="background:#222; padding:2rem; border-radius:8px; border:1px solid #444;">
          <h2>Enter Persona Key</h2>
          <input type="password" name="password" style="padding:10px; width:100%; margin-bottom:1rem; border:none; border-radius:4px;">
          <button type="submit" style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Decrypt</button>
        </form>
      </body>
    </html>`, { headers: { "content-type": "text/html" } });
};