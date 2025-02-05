export interface User {
  id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phoneNumber: string;
  dateOfBirth: Date;
  profilePicture?: string;
  role: 'COLLECTOR' | 'CUSTOMER';
  points?: number;
}