import { auth } from "./firebase";
import { signOut } from "firebase/auth";

function Dashboard({ user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh', padding: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#00bfff' }}>Student Productivity App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#aaaaaa' }}>Welcome, {user.displayName}</span>
          <button onClick={handleSignOut}
            style={{ backgroundColor: 'transparent', border: '1px solid #00bfff', color: '#00bfff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #00bfff', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '200px' }}>
          <h2 style={{ color: '#00bfff', marginBottom: '10px' }}>📚 Assignments</h2>
          <p style={{ color: '#aaaaaa' }}>No assignments yet</p>
        </div>
        <div style={{ backgroundColor: '#111', border: '1px solid #00bfff', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '200px' }}>
          <h2 style={{ color: '#00bfff', marginBottom: '10px' }}>⏱ Pomodoro Timer</h2>
          <p style={{ color: '#aaaaaa' }}>Coming soon</p>
        </div>
        <div style={{ backgroundColor: '#111', border: '1px solid #00bfff', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '200px' }}>
          <h2 style={{ color: '#00bfff', marginBottom: '10px' }}>🎯 Daily Goals</h2>
          <p style={{ color: '#aaaaaa' }}>No goals yet</p>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;