import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";

function PomodoroTimer() {
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setIsBreak(b => {
              const next = !b;
              setSeconds(next ? breakMinutes * 60 : studyMinutes * 60);
              return next;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, studyMinutes, breakMinutes]);

  const reset = () => { setRunning(false); setIsBreak(false); setSeconds(studyMinutes * 60); };
  const applySettings = () => { setEditing(false); reset(); };
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = isBreak ? ((breakMinutes * 60 - seconds) / (breakMinutes * 60)) * 100 : ((studyMinutes * 60 - seconds) / (studyMinutes * 60)) * 100;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid #00bfff', borderRadius: '20px', padding: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{isBreak ? '☕' : '📖'}</div>
        <p style={{ color: '#00bfff', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '10px', textTransform: 'uppercase' }}>{isBreak ? 'Break Time' : 'Study Time'}</p>
        <h2 style={{ fontSize: '5rem', color: 'white', fontWeight: '700', marginBottom: '10px', fontFamily: 'monospace' }}>
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </h2>
        {/* Progress Bar */}
        <div style={{ backgroundColor: '#333', borderRadius: '10px', height: '8px', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: isBreak ? '#00ff88' : '#00bfff', height: '100%', width: `${progress}%`, borderRadius: '10px', transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ background: 'linear-gradient(135deg, #00bfff, #0080ff)', color: '#fff', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button onClick={reset}
            style={{ backgroundColor: 'transparent', border: '2px solid #00bfff', color: '#00bfff', padding: '12px 24px', borderRadius: '50px', cursor: 'pointer' }}>
            ↺ Reset
          </button>
          <button onClick={() => setEditing(e => !e)}
            style={{ backgroundColor: 'transparent', border: '2px solid #555', color: '#aaa', padding: '12px 20px', borderRadius: '50px', cursor: 'pointer' }}>
            ⚙️
          </button>
        </div>
        {editing && (
          <div style={{ backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ color: '#00bfff', marginBottom: '15px' }}>Adjust Timer</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '15px' }}>
              <div>
                <p style={{ color: '#aaaaaa', marginBottom: '5px', fontSize: '0.85rem' }}>Study (min)</p>
                <input type="number" value={studyMinutes} min="1" max="60" onChange={e => setStudyMinutes(Number(e.target.value))}
                  style={{ backgroundColor: '#111', border: '1px solid #00bfff', color: 'white', padding: '8px', borderRadius: '6px', width: '80px', textAlign: 'center' }} />
              </div>
              <div>
                <p style={{ color: '#aaaaaa', marginBottom: '5px', fontSize: '0.85rem' }}>Break (min)</p>
                <input type="number" value={breakMinutes} min="1" max="30" onChange={e => setBreakMinutes(Number(e.target.value))}
                  style={{ backgroundColor: '#111', border: '1px solid #00bfff', color: 'white', padding: '8px', borderRadius: '6px', width: '80px', textAlign: 'center' }} />
              </div>
            </div>
            <button onClick={applySettings}
              style={{ background: 'linear-gradient(135deg, #00bfff, #0080ff)', color: '#fff', padding: '8px 24px', borderRadius: '50px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              Apply
            </button>
          </div>
        )}
      </div>
      {/* Tips */}
      <div style={{ marginTop: '20px', backgroundColor: '#111', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>💡 <strong style={{ color: '#00bfff' }}>Tip:</strong> The Pomodoro Technique improves focus by breaking work into intervals with short breaks.</p>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState([]);
  const [page, setPage] = useState("home");

  const fetchAssignments = async () => {
    const q = query(collection(db, "assignments"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    setAssignments(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchGoals = async () => {
    const q = query(collection(db, "goals"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    setGoals(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAssignments(); fetchGoals(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addAssignment = async () => {
    if (!title || !dueDate || !subject) return;
    await addDoc(collection(db, "assignments"), { title, dueDate, subject, uid: user.uid });
    setTitle(""); setDueDate(""); setSubject("");
    fetchAssignments();
  };

  const deleteAssignment = async (id) => { await deleteDoc(doc(db, "assignments", id)); fetchAssignments(); };
  const addGoal = async () => {
    if (!goal) return;
    await addDoc(collection(db, "goals"), { text: goal, completed: false, uid: user.uid });
    setGoal(""); fetchGoals();
  };
  const completeGoal = async (id, current) => { await updateDoc(doc(db, "goals", id), { completed: !current }); fetchGoals(); };
  const deleteGoal = async (id) => { await deleteDoc(doc(db, "goals", id)); fetchGoals(); };
  const handleSignOut = async () => { await signOut(auth); };

  const navBtn = (p, label) => (
    <button onClick={() => setPage(p)} style={{
      backgroundColor: page === p ? '#00bfff' : 'transparent',
      color: page === p ? '#000' : '#aaaaaa',
      border: page === p ? '1px solid #00bfff' : '1px solid #333',
      padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
    }}>{label}</button>
  );

  const completedGoals = goals.filter(g => g.completed).length;
  const upcomingAssignments = assignments.slice(0, 3);

  return (
    <div style={{ backgroundColor: '#050510', color: 'white', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Top Nav Bar */}
      <div style={{ background: 'linear-gradient(90deg, #0a0a1a, #0d0d2b)', borderBottom: '1px solid #1a1a3e', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <h1 style={{ fontSize: '1.3rem', background: 'linear-gradient(90deg, #00bfff, #7b61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>StudyFlow</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {navBtn("home", "🏠 Home")}
          {navBtn("assignments", "📚 Assignments")}
          {navBtn("goals", "🎯 Goals")}
          {navBtn("timer", "⏱ Timer")}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={user.photoURL} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00bfff' }} />
          <span style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>{user.displayName}</span>
          <button onClick={handleSignOut} style={{ backgroundColor: 'transparent', border: '1px solid #333', color: '#aaa', padding: '6px 14px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding: '40px' }}>

        {/* HOME PAGE */}
        {page === "home" && (
          <div>
            {/* Welcome Banner */}
            <div style={{ background: 'linear-gradient(135deg, #0d0d2b, #1a1a4e)', border: '1px solid #2a2a6e', borderRadius: '20px', padding: '40px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.05 }}>🎓</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back, <span style={{ background: 'linear-gradient(90deg, #00bfff, #7b61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.displayName.split(' ')[0]}</span>! 👋</h2>
              <p style={{ color: '#aaaaaa', fontSize: '1rem' }}>Stay focused. Stay organized. You've got this.</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2a3e)', border: '1px solid #1a3a5e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📚</div>
                <h3 style={{ fontSize: '2rem', color: '#00bfff', fontWeight: '700' }}>{assignments.length}</h3>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Assignments Tracked</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #1a0d2a, #2a1a3e)', border: '1px solid #3a1a5e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎯</div>
                <h3 style={{ fontSize: '2rem', color: '#7b61ff', fontWeight: '700' }}>{completedGoals}/{goals.length}</h3>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Goals Completed</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #0d2a1a, #1a3e2a)', border: '1px solid #1a5e3a', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏱</div>
                <h3 style={{ fontSize: '2rem', color: '#00ff88', fontWeight: '700' }}>25</h3>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Min Focus Sessions</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #2a1a0d, #3e2a1a)', border: '1px solid #5e3a1a', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔥</div>
                <h3 style={{ fontSize: '2rem', color: '#ff8c00', fontWeight: '700' }}>{goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0}%</h3>
                <p style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>Goal Completion Rate</p>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div onClick={() => setPage("assignments")} style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2a3e)', border: '1px solid #1a3a5e', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <h3 style={{ color: '#00bfff', marginBottom: '16px', fontSize: '1.1rem' }}>📚 Upcoming Assignments</h3>
                {upcomingAssignments.length === 0 ? <p style={{ color: '#555' }}>No assignments yet — add some!</p> :
                  upcomingAssignments.map(a => (
                    <div key={a.id} style={{ backgroundColor: '#0a0a1a', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', borderLeft: '3px solid #00bfff' }}>
                      <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>{a.title}</p>
                      <p style={{ color: '#aaaaaa', fontSize: '0.75rem' }}>{a.subject} • Due: {a.dueDate}</p>
                    </div>
                  ))}
                <p style={{ color: '#00bfff', fontSize: '0.85rem', marginTop: '12px' }}>View all →</p>
              </div>

              <div onClick={() => setPage("goals")} style={{ background: 'linear-gradient(135deg, #1a0d2a, #2a1a3e)', border: '1px solid #3a1a5e', borderRadius: '16px', padding: '24px', cursor: 'pointer' }}>
                <h3 style={{ color: '#7b61ff', marginBottom: '16px', fontSize: '1.1rem' }}>🎯 Today's Goals</h3>
                {goals.length === 0 ? <p style={{ color: '#555' }}>No goals yet — add some!</p> :
                  goals.slice(0, 3).map(g => (
                    <div key={g.id} style={{ backgroundColor: '#0a0a1a', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', borderLeft: `3px solid ${g.completed ? '#00ff88' : '#7b61ff'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{g.completed ? '✅' : '⭕'}</span>
                      <p style={{ color: g.completed ? '#aaaaaa' : 'white', fontSize: '0.9rem', textDecoration: g.completed ? 'line-through' : 'none' }}>{g.text}</p>
                    </div>
                  ))}
                <p style={{ color: '#7b61ff', fontSize: '0.85rem', marginTop: '12px' }}>View all →</p>
              </div>

              <div onClick={() => setPage("timer")} style={{ background: 'linear-gradient(135deg, #0d2a1a, #1a3e2a)', border: '1px solid #1a5e3a', borderRadius: '16px', padding: '24px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>⏱</div>
                <h3 style={{ color: '#00ff88', marginBottom: '8px' }}>Start a Focus Session</h3>
                <p style={{ color: '#aaaaaa', fontSize: '0.85rem', marginBottom: '16px' }}>Use the Pomodoro technique to maximize your study efficiency</p>
                <div style={{ background: 'linear-gradient(135deg, #00ff88, #00bfff)', color: '#000', padding: '10px 24px', borderRadius: '50px', fontWeight: 'bold', display: 'inline-block' }}>
                  Start Timer →
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a0d, #2a2a1a)', border: '1px solid #3a3a1a', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ color: '#ffd700', marginBottom: '16px' }}>💡 Study Tips</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { icon: '🧠', tip: 'Review notes within 24 hours to retain 80% more information' },
                  { icon: '💧', tip: 'Stay hydrated — even mild dehydration affects concentration' },
                  { icon: '😴', tip: '7-9 hours of sleep improves memory consolidation significantly' },
                  { icon: '📵', tip: 'Put your phone away during study sessions to boost focus' },
                ].map((t, i) => (
                  <div key={i} style={{ backgroundColor: '#0a0a05', borderRadius: '10px', padding: '14px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                    <p style={{ color: '#aaaaaa', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.5' }}>{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ASSIGNMENTS PAGE */}
        {page === "assignments" && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>📚 <span style={{ background: 'linear-gradient(90deg, #00bfff, #7b61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Assignments</span></h2>
            <div style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2a3e)', border: '1px solid #1a3a5e', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: '#00bfff', marginBottom: '16px' }}>Add New Assignment</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input placeholder="Assignment title" value={title} onChange={e => setTitle(e.target.value)}
                  style={{ backgroundColor: '#0a0a1a', border: '1px solid #2a2a5e', color: 'white', padding: '12px', borderRadius: '10px', flex: '1', minWidth: '150px' }} />
                <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ backgroundColor: '#0a0a1a', border: '1px solid #2a2a5e', color: 'white', padding: '12px', borderRadius: '10px', flex: '1', minWidth: '150px' }} />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  style={{ backgroundColor: '#0a0a1a', border: '1px solid #2a2a5e', color: 'white', padding: '12px', borderRadius: '10px' }} />
                <button onClick={addAssignment}
                  style={{ background: 'linear-gradient(135deg, #00bfff, #0080ff)', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  + Add
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
                  <p>No assignments yet. Add your first one above!</p>
                </div>
              )}
              {assignments.map(a => (
                <div key={a.id} style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2a3e)', border: '1px solid #1a3a5e', borderRadius: '12px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: '#00bfff22', borderRadius: '10px', padding: '10px', fontSize: '1.5rem' }}>📝</div>
                    <div>
                      <h3 style={{ color: 'white', marginBottom: '4px' }}>{a.title}</h3>
                      <p style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>{a.subject} • Due: {a.dueDate}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteAssignment(a.id)}
                    style={{ backgroundColor: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GOALS PAGE */}
        {page === "goals" && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>🎯 <span style={{ background: 'linear-gradient(90deg, #7b61ff, #00bfff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Daily Goals</span></h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input placeholder="Add a goal for today..." value={goal} onChange={e => setGoal(e.target.value)}
                style={{ backgroundColor: '#0a0a1a', border: '1px solid #2a2a5e', color: 'white', padding: '12px', borderRadius: '10px', flex: '1' }} />
              <button onClick={addGoal}
                style={{ background: 'linear-gradient(135deg, #7b61ff, #00bfff)', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                + Add
              </button>
            </div>
            {goals.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #0d2a1a, #1a3e2a)', border: '1px solid #1a5e3a', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>Progress</span>
                  <span style={{ color: '#00ff88', fontSize: '0.85rem' }}>{completedGoals}/{goals.length} completed</span>
                </div>
                <div style={{ backgroundColor: '#333', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#00ff88', height: '100%', width: `${goals.length > 0 ? (completedGoals / goals.length) * 100 : 0}%`, borderRadius: '10px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
                  <p>No goals yet. Set your first goal above!</p>
                </div>
              )}
              {goals.map(g => (
                <div key={g.id} style={{ background: g.completed ? 'linear-gradient(135deg, #0d2a1a, #1a3e2a)' : 'linear-gradient(135deg, #1a0d2a, #2a1a3e)', border: `1px solid ${g.completed ? '#1a5e3a' : '#3a1a5e'}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{g.completed ? '✅' : '⭕'}</span>
                    <span style={{ color: g.completed ? '#aaaaaa' : 'white', textDecoration: g.completed ? 'line-through' : 'none' }}>{g.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => completeGoal(g.id, g.completed)}
                      style={{ backgroundColor: g.completed ? '#333' : '#00ff8822', border: `1px solid ${g.completed ? '#555' : '#00ff88'}`, color: g.completed ? '#aaa' : '#00ff88', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                      {g.completed ? 'Undo' : '✓ Done'}
                    </button>
                    <button onClick={() => deleteGoal(g.id)}
                      style={{ backgroundColor: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMER PAGE */}
        {page === "timer" && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>⏱ <span style={{ background: 'linear-gradient(90deg, #00ff88, #00bfff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pomodoro Timer</span></h2>
            <PomodoroTimer />
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;