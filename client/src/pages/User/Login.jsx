const API = import.meta.env.VITE_API_URL;

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  if (!formData.email || !formData.password) {
    setError("Please fill in all required fields");
    setLoading(false);
    return;
  }

  try {
    // ========== LOGIN MODE ==========
    if (isLogin) {

      /* ---------------------------------------------------------
          1) TRY ADMIN LOGIN FIRST → /auth/login
      --------------------------------------------------------- */
      const adminRes = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      if (adminRes.ok) {
        navigate("/admin", { replace: true });
        return; // STOP here — admin login success
      }

      /* ---------------------------------------------------------
          2) IF NOT ADMIN → TRY USER LOGIN → /user/login
      --------------------------------------------------------- */
      const userRes = await fetch(`${API}/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        login(userData.user);            // store user in context
        navigate(from, { replace: true });
      } else {
        setError(userData.message || "Authentication failed");
      }

    } 
    
    // ========== REGISTER MODE ==========
    else {
      /* ---------------------------------------------------------
          3) USER REGISTRATION → /user/register
      --------------------------------------------------------- */
      const regRes = await fetch(`${API}/user/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const regData = await regRes.json();

      if (regRes.ok) {
        login(regData.user);             // store user
        navigate(from, { replace: true });
      } else {
        setError(regData.message || "Registration failed");
      }
    }
  } catch (err) {
    console.error(err);
    setError("Unable to connect to server.");
  } finally {
    setLoading(false);
  }
};
