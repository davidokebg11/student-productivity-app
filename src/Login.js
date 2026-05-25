import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Student Productivity App</h1>
      <p style={{ color: '#aaaaaa', marginBottom: '40px' }}>Stay organized. Study smarter.</p>
      <button
        onClick={handleLogin}
        style={{ backgroundColor: '#00bfff', color: '#000', padding: '14px 32px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;