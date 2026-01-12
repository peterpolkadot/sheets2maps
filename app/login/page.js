"use client";

import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError(true);
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      setError(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo') || '/';
      window.location.href = returnTo;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: "400px",
        margin: "20px"
      }}>
        <h1 style={{
          margin: "0 0 10px 0",
          fontSize: "28px",
          fontWeight: 700,
          color: "#006a8e",
          textAlign: "center"
        }}>
          AVR CONSULTING
        </h1>
        
        <p style={{
          margin: "0 0 30px 0",
          fontSize: "14px",
          color: "#64748b",
          textAlign: "center"
        }}>
          Catholic Diocese Property Dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "15px",
                border: error ? "2px solid #ef4444" : "2px solid #e2e8f0",
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
            />
            {error && (
              <p style={{
                margin: "8px 0 0 0",
                fontSize: "13px",
                color: "#ef4444"
              }}>
                Invalid password
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #006a8e 0%, #008bb3 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Access Dashboard
          </button>
        </form>

        <p style={{
          margin: "24px 0 0 0",
          fontSize: "12px",
          color: "#94a3b8",
          textAlign: "center"
        }}>
          🔒 Protected Access
        </p>
      </div>
    </div>
  );
}