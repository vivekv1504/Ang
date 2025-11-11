export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'owner';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}



