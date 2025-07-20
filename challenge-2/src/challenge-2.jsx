import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/goals';

export default function SmartGoalPlanner() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', category: '', deadline: '' });
  const [deposit, setDeposit] = useState({ goalId: '', amount: '' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline || !newGoal.category) return;
    const goal = { ...newGoal, savedAmount: 0, createdAt: new Date().toISOString() };
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    setNewGoal({ name: '', targetAmount: '', category: '', deadline: '' });
    fetchGoals();
  };

  const deleteGoal = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const updateGoal = async (id, updates) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setGoals(goals.map(goal => (goal.id === id ? { ...goal, ...updates } : goal)));
  };

  const handleDeposit = async () => {
    const goal = goals.find((g) => g.id === deposit.goalId);
    if (!goal || !deposit.amount) return;
    const updatedAmount = parseFloat(goal.savedAmount) + parseFloat(deposit.amount);
    await updateGoal(goal.id, { savedAmount: updatedAmount });
    setDeposit({ goalId: '', amount: '' });
  };

  const getStatus = (goal) => {
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const isComplete = parseFloat(goal.savedAmount) >= parseFloat(goal.targetAmount);
    const isOverdue = now > deadlineDate && !isComplete;
    const timeLeft = Math.max(Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)), 0);
    return { isComplete, isOverdue, timeLeft };
  };

  const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.savedAmount), 0);
  const completedGoals = goals.filter((g) => parseFloat(g.savedAmount) >= parseFloat(g.targetAmount)).length;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Smart Goal Planner</h1>

      <section>
        <h2>Add Goal</h2>
        <input value={newGoal.name} placeholder="Name" onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} /><br />
        <input value={newGoal.targetAmount} placeholder="Target Amount" type="number" onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} /><br />
        <input value={newGoal.category} placeholder="Category" onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })} /><br />
        <input value={newGoal.deadline} type="date" onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} /><br />
        <button onClick={addGoal}>Add</button>
      </section>

      <section>
        <h2>Deposit</h2>
        <select value={deposit.goalId} onChange={(e) => setDeposit({ ...deposit, goalId: e.target.value })}>
          <option value="">Select Goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select><br />
        <input value={deposit.amount} placeholder="Amount" type="number" onChange={(e) => setDeposit({ ...deposit, amount: e.target.value })} /><br />
        <button onClick={handleDeposit}>Deposit</button>
      </section>

      <section>
        <h2>Goals</h2>
        {goals.map((goal) => {
          const { isComplete, isOverdue, timeLeft } = getStatus(goal);
          const progress = parseFloat(goal.targetAmount) > 0 ? (parseFloat(goal.savedAmount) / parseFloat(goal.targetAmount)) * 100 : 0;

          return (
            <div key={goal.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
              <h3>{goal.name}</h3>
              <p>Category: {goal.category}</p>
              <p>Saved: ${goal.savedAmount} / ${goal.targetAmount}</p>
              <div style={{ background: '#eee', height: '10px', width: '100%' }}>
                <div style={{ width: `${progress}%`, height: '10px', background: 'green' }}></div>
              </div>
              <p>Status: {isComplete ? '✅ Completed' : isOverdue ? '❌ Overdue' : `${timeLeft} days left`}</p>
              <button onClick={() => deleteGoal(goal.id)}>Delete</button>
            </div>
          );
        })}
      </section>

      <section>
        <h2>Overview</h2>
        <p>Total Goals: {goals.length}</p>
        <p>Total Saved: ${totalSaved}</p>
        <p>Completed Goals: {completedGoals}</p>
      </section>
    </div>
  );
}
