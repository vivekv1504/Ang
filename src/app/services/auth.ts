import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersUrl = 'assets/users.json';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private users: User[] = [];

  constructor(private http: HttpClient) {
    this.loadUsers();
    // Load current user from sessionStorage
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  private loadUsers(): void {
    // Load users from JSON file
    this.http.get<User[]>(this.usersUrl).pipe(
      catchError(() => of([]))
    ).subscribe(users => {
      // Also load users from localStorage (newly registered users)
      const localUsers = this.getLocalStorageUsers();
      this.users = [...users, ...localUsers];
    });
  }

  private getLocalStorageUsers(): User[] {
    const localUsersJson = localStorage.getItem('registeredUsers');
    return localUsersJson ? JSON.parse(localUsersJson) : [];
  }

  private saveToLocalStorage(users: User[]): void {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }

  signup(user: User): Observable<{ success: boolean; message?: string }> {
    const apiUrl = `${environment.apiUrl}/api/users`;
    
    // Try backend API first
    return this.http.post<any>(apiUrl, user).pipe(
      map(response => {
        if (response.success) {
          console.log('✅ User saved to JSON file:', response.user);
          return { success: true };
        } else {
          return { success: false, message: response.error || 'Signup failed' };
        }
      }),
      catchError(error => {
        console.log('⚠️ Backend not available, using localStorage');
        // Fallback to localStorage
        return this.signupLocally(user);
      })
    );
  }

  private signupLocally(user: User): Observable<{ success: boolean; message?: string }> {
    // Check demo users (hardcoded)
    const demoUsers = [
      { id: 1, email: 'owner@sipstop.com', name: 'Store Owner', password: 'owner123', role: 'owner' as 'owner' },
      { id: 2, email: 'customer@sipstop.com', name: 'John Customer', password: 'customer123', role: 'customer' as 'customer' }
    ];
    
    // Get localStorage users
    const localUsers = this.getLocalStorageUsers();
    const allUsers = [...demoUsers, ...localUsers];
    
    // Check if email already exists
    if (allUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return of({ success: false, message: 'Email already exists' });
    }
    
    // Generate new ID
    const maxId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id || 0)) : 0;
    const newId = maxId + 1;
    const newUser = { ...user, id: newId };
    
    // Add new user to localStorage
    localUsers.push(newUser);
    this.saveToLocalStorage(localUsers);
    
    // Update in-memory users
    this.users = [...demoUsers, ...localUsers];
    
    console.log('✅ New user registered (localStorage):', newUser);
    
    return of({ success: true });
  }

  login(email: string, password: string): Observable<User | null> {
    const apiUrl = 'http://localhost:3000/api/users';
    
    // Demo users (hardcoded for reliability)
    const demoUsers: User[] = [
      { id: 1, email: 'owner@sipstop.com', name: 'Store Owner', password: 'owner123', role: 'owner' },
      { id: 2, email: 'customer@sipstop.com', name: 'John Customer', password: 'customer123', role: 'customer' }
    ];
    
    // Try to get users from backend API first
    return this.http.get<User[]>(apiUrl).pipe(
      map(users => {
        console.log('✅ Checking users from backend API:', users.length);
        // Combine with localStorage users as backup
        const localUsers = this.getLocalStorageUsers();
        const allUsers = [...users, ...localUsers];
        
        const user = allUsers.find(u => u.email === email && u.password === password);
        if (user) {
          console.log('✅ Login successful:', user.email);
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }
        console.log('❌ Invalid credentials');
        return null;
      }),
      catchError(() => {
        console.log('⚠️ Backend not available, using fallback authentication');
        // If backend fails, try JSON file
        return this.http.get<User[]>(this.usersUrl).pipe(
          map(users => {
            const localUsers = this.getLocalStorageUsers();
            const allUsers = [...users, ...localUsers];
            
            const user = allUsers.find(u => u.email === email && u.password === password);
            if (user) {
              sessionStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
            return user || null;
          }),
          catchError(() => {
            // Final fallback: demo users + localStorage only
            console.log('⚠️ Using demo users + localStorage only');
            const localUsers = this.getLocalStorageUsers();
            const allUsers = [...demoUsers, ...localUsers];
            
            const user = allUsers.find(u => u.email === email && u.password === password);
            if (user) {
              sessionStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
            return of(user || null);
          })
        );
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isOwner(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'owner';
  }

  isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'customer';
  }

  updateUserProfile(userId: number, updatedData: Partial<User>): Observable<{ success: boolean; message?: string; user?: User }> {
    const apiUrl = `${environment.apiUrl}/api/users/${userId}`;
    
    // Try backend API first
    return this.http.put<any>(apiUrl, updatedData).pipe(
      map(response => {
        if (response.success) {
          console.log('✅ User profile updated:', response.user);
          // Update current user if it's the same user
          const currentUser = this.currentUserSubject.value;
          if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, ...response.user };
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
          return { success: true, user: response.user };
        } else {
          return { success: false, message: response.error || 'Update failed' };
        }
      }),
      catchError(error => {
        console.log('⚠️ Backend not available, using localStorage');
        // Fallback to localStorage
        return this.updateUserProfileLocally(userId, updatedData);
      })
    );
  }

  private updateUserProfileLocally(userId: number, updatedData: Partial<User>): Observable<{ success: boolean; message?: string; user?: User }> {
    const localUsers = this.getLocalStorageUsers();
    const userIndex = localUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      // Update user
      localUsers[userIndex] = { ...localUsers[userIndex], ...updatedData };
      this.saveToLocalStorage(localUsers);
      
      // Update current user if it's the same user
      const currentUser = this.currentUserSubject.value;
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...localUsers[userIndex] };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }
      
      console.log('✅ User profile updated (localStorage):', localUsers[userIndex]);
      return of({ success: true, user: localUsers[userIndex] });
    } else {
      return of({ success: false, message: 'User not found' });
    }
  }

  // Get all users (for forgot password functionality)
  getUsers(): Observable<User[]> {
    const apiUrl = `${environment.apiUrl}/api/users`;
    
    // Try backend API first
    return this.http.get<User[]>(apiUrl).pipe(
      map(users => {
        const localUsers = this.getLocalStorageUsers();
        return [...users, ...localUsers];
      }),
      catchError(() => {
        // Fallback to JSON file + localStorage
        return this.http.get<User[]>(this.usersUrl).pipe(
          map(users => {
            const localUsers = this.getLocalStorageUsers();
            return [...users, ...localUsers];
          }),
          catchError(() => {
            // Final fallback: localStorage only
            const localUsers = this.getLocalStorageUsers();
            return of(localUsers);
          })
        );
      })
    );
  }
}
