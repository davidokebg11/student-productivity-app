import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

function PomodoroTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setIsBreak(b => !b);
            return isBreak ? 25 * 60 : 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, isBreak]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const reset = () => {
    setRunning(false);
    setIsBreak(false);
    setSeconds(25 * 60);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: '#aaaaaa', marginBottom: '10px' }}>{isBreak ? '☕ Break Time!' : '📖 Study Time'}</p>
      <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '20px' }}>
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={() => setRunning(r => !r)}
          style={{ backgroundColor: '#00bfff', color: '#000', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset}
          style={{ backgroundColor: 'transparent', border: '1px solid #00bfff', color: '#00bfff', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer' }}>
          Reset
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");

  const fetchAssignments = async () => {
    const q = query(collection(db, "assignments"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAssignments(data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const addAssignment = async () => {
    if (!title || !dueDate || !subject) return;
    await addDoc(collection(db, "assignments"), {
      title,
      dueDate,
      subject,
      uid: user.uid,
    });
    setTitle("");
    setDueDate("");
    setSubject("");
    fetchAssignments();
  };

  const deleteAssignment = async (id) => {
    await deleteDoc(doc(db, "assignments", id));
    fetchAssignments();
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: 'white', minHeight: '100vh', padding: '40px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#00bfff' }}>📚 Student Productivity App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#aaaaaa' }}>Welcome, {user.displayName}</span>
          <button onClick={handleSignOut}
            style={{ backgroundColor: 'transparent', border: '1px solid #00bfff', color: '#00bfff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Add Assignment Form */}
      <div style={{ backgroundColor: '#111', border: '1px solid #00bfff', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
        <h2 style={{ color: '#00bfff', marginBottom: '20px' }}>Add Assignment</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            placeholder="Assignment title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '6px', flex: '1', minWidth: '150px' }}
          />
          <input
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '6px', flex: '1', minWidth: '150px' }}
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '6px' }}
          />
          <button onClick={addAssignment}
            style={{ backgroundColor: '#00bfff', color: '#000', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Add
          </button>
        </div>
      </div>
        {/* Pomodoro Timer */}
      <div style={{ backgroundColor: '#111', border: '1px solid #00bfff', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
        <h2 style={{ color: '#00bfff', marginBottom: '20px' }}>⏱ Pomodoro Timer</h2>
        <PomodoroTimer />
      </div>

      {/* Assignments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.length === 0 && <p style={{ color: '#aaaaaa' }}>No assignments yet. Add one above!</p>}
        {assignments.map(a => (
          <div key={a.id} style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'white', marginBottom: '4px' }}>{a.title}</h3>
              <p style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>{a.subject} • Due: {a.dueDate}</p>
            </div>
            <button onClick={() => deleteAssignment(a.id)}
              style={{ backgroundColor: 'transparent', border: '1px solid red', color: 'red', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;