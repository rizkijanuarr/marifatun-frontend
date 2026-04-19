/** User + session payload returned by login and register. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: string[];
};

export type AuthSessionData = {
  user: AuthUser;
  token: string;
  token_type: string;
};
