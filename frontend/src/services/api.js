const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/trips';

export async function planTrip(tripData) {
  try {
    const response = await fetch(`${API_BASE_URL}/plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.error || 'Failed to calculate trip plan';
      throw new Error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Fetch')) {
      throw new Error('Unable to connect to Django API backend. Ensure server is running at http://localhost:8000');
    }
    throw err;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health/`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}
