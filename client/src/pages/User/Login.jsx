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
    if (isLogin) {
      // 1) ADMIN LOGIN
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
        // Admin logged in successfully
        navigate("/admin", { replace: true });
        return;
      }

      // 2) USER LOGIN
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
        login(userData.user);
        navigate(from, { replace: true });
      } else {
        setError(userData.message || "Authentication failed");
      }

    } else {
      // 3) USER REGISTER
      const regRes = await fetch(`${API}/user/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const regData = await regRes.json();

      if (regRes.ok) {
        login(regData.user);
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
