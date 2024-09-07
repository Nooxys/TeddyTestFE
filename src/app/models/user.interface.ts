export interface User {
  id: number;
  name: string;
  surname: string;
  address: string;
  location: string;
  municipality: string;
  province: string;
  email: string;
  notes: string;
}

export interface UserBody {
  name: string;
  surname: string;
  address: string;
  location: string;
  municipality: string;
  province: string;
  email: string;
  notes: string;
}
