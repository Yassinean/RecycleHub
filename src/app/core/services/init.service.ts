// import { Injectable } from '@angular/core';
// import { User } from '../models/user.model';
// import { AuthService } from './auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class InitService {
//   constructor(private authService: AuthService) {}

//   initializeCollectors(): void {
//     const defaultCollectors: User[] = [
//       {
//         email: 'collector1@recyclehub.com',
//         password: 'Collector@123',
//         firstName: 'John',
//         lastName: 'Doe',
//         address: {
//           street: '123 Recycling St',
//           city: 'Casablanca',
//           postalCode: '20000'
//         },
//         phoneNumber: '0600000001',
//         dateOfBirth: new Date('1990-01-01'),
//         role: 'COLLECTOR',
//         points: 0
//       },
//       {
//         email: 'collector2@recyclehub.com',
//         password: 'Collector@456',
//         firstName: 'Jane',
//         lastName: 'Smith',
//         address: {
//           street: '456 Eco Ave',
//           city: 'Rabat',
//           postalCode: '10000'
//         },
//         phoneNumber: '0600000002',
//         dateOfBirth: new Date('1992-05-15'),
//         role: 'COLLECTOR',
//         points: 0
//       }
//     ];

//     this.authService.initializeCollectors(defaultCollectors).subscribe({
//       error: (error) => console.error('Error initializing collectors:', error)
//     });
//   }
// } 