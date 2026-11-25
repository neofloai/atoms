import type { AccountMenuUser, WorkspaceOption } from '@neofloai/atoms';

/**
 * The signed-in user the account menu shows. Sample data: replace it with
 * the user from your session once the app has one.
 */
export const CURRENT_USER: AccountMenuUser = {
  name: 'John Doe',
  email: 'john.doe@neo.com',
  role: 'Tenant Owner',
};

/**
 * The workspaces the rail's footer switches between, each in its own
 * avatar colour. Sample data, like the user.
 */
export const WORKSPACES: readonly WorkspaceOption[] = [
  { id: 'finance', name: 'Finance', color: 'primary' },
  { id: 'procurement', name: 'Procurement', color: 'success' },
];
