import {
  findUserByEmail,
  findAgentById,
  findPropertyById,
  findPropertiesByAgentId,
  mockUsers,
  mockAgents,
  mockProperties,
  mockClients,
  db,
} from '@/lib/db';

describe('Database Layer', () => {
  it('should have mock users', () => {
    expect(mockUsers.length).toBeGreaterThan(0);
    expect(mockUsers[0]).toHaveProperty('email');
    expect(mockUsers[0]).toHaveProperty('role');
  });

  it('should have mock agents', () => {
    expect(mockAgents.length).toBeGreaterThan(0);
    expect(mockAgents[0]).toHaveProperty('name');
    expect(mockAgents[0]).toHaveProperty('bio');
  });

  it('should have mock properties', () => {
    expect(mockProperties.length).toBeGreaterThan(0);
    expect(mockProperties[0]).toHaveProperty('title');
    expect(mockProperties[0]).toHaveProperty('agentId');
  });

  it('should have mock clients', () => {
    expect(mockClients.length).toBeGreaterThan(0);
    expect(mockClients[0]).toHaveProperty('email');
  });

  it('should find user by email', () => {
    const user = findUserByEmail('michael.johnson@orthanc.com');
    expect(user).toBeDefined();
    expect(user?.role).toBe('agent');
  });

  it('should find agent by id', () => {
    const agent = findAgentById('agent-1');
    expect(agent).toBeDefined();
    expect(agent?.name).toBeDefined();
  });

  it('should find property by id', () => {
    const prop = findPropertyById('prop-1');
    expect(prop).toBeDefined();
    expect(prop?.title).toBeDefined();
  });

  it('should find properties by agent id', () => {
    const props = findPropertiesByAgentId('agent-1');
    expect(Array.isArray(props)).toBe(true);
  });

  it('should have accessible database instance', () => {
    expect(db).toHaveProperty('users');
    expect(db).toHaveProperty('agents');
    expect(db).toHaveProperty('properties');
    expect(db).toHaveProperty('clients');
  });
});
