import { findUserByEmail, createUser } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.json();
  const { action, email, password, role } = body;

  if (action === 'login') {
    const user = findUserByEmail(email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }
    return new Response(JSON.stringify({ user, token: 'mock-jwt-token' }), { status: 200 });
  }

  if (action === 'signup') {
    const existing = findUserByEmail(email);
    if (existing) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 409 });
    }

    const newUser = createUser({ id: `${role}-${Date.now()}`, email, role, createdAt: new Date() } as any);
    return new Response(JSON.stringify({ user: newUser, token: 'mock-jwt-token' }), { status: 201 });
  }

  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
}
