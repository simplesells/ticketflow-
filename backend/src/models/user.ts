export interface User {
  id: number;
  username: string;
  password: string;
  role: 'submitter' | 'dispatcher' | 'resolver';
  displayName: string;
}

export const USERS: User[] = [
  { id: 1, username: 'zhaoming', password: '123456', role: 'submitter', displayName: '赵明' },
  { id: 2, username: 'qianyong', password: '123456', role: 'dispatcher', displayName: '钱勇' },
  { id: 3, username: 'sunqiang', password: '123456', role: 'resolver', displayName: '孙强' },
  { id: 4, username: 'ligang', password: '123456', role: 'resolver', displayName: '李刚' },
  { id: 5, username: 'chenfang', password: '123456', role: 'submitter', displayName: '陈芳' },
  { id: 6, username: 'zhouwei', password: '123456', role: 'resolver', displayName: '周伟' },
];

export function findUserById(id: number): User | undefined {
  return USERS.find(u => u.id === id);
}

export function findUserByUsername(username: string): User | undefined {
  return USERS.find(u => u.username === username);
}

export function findUserByDisplayName(displayName: string): User | undefined {
  return USERS.find(u => u.displayName === displayName);
}
