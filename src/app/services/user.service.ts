import { computed, inject, Injectable, signal } from '@angular/core';
import { User, UserBody } from '../models/user.interface';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // creo la lista privata per utilizzarelasolamente all'interno del service
  private users = signal<User[]>([]);
  private httpClient = inject(HttpClient);

  fetchUrl = 'http://localhost:3001/users';

  // la lista di utenti readonly utilizzabile in tutta l'app
  loadedUsers = computed(() => this.users());

  constructor() {
    this.getAllUsers();
  }

  // trova utente per id -
  getUserById(id: number) {
    return this.httpClient.get<User>(`${this.fetchUrl}/${id}`);
  }

  // trova tutti gli utenti

  getAllUsers() {
    return this.httpClient
      .get<User[]>(this.fetchUrl)
      .pipe(tap((users) => this.users.set(users)));
  }

  //  post utente
  addUser(body: UserBody) {
    return this.httpClient
      .post<User>(this.fetchUrl, body)
      .pipe(
        tap((newUser) => this.users.update((users) => [...users, newUser]))
      );
  }

  // upgrade utente per id
  updateUser(userId: number, userBody: UserBody) {
    return this.httpClient
      .put<User>(`${this.fetchUrl}/${userId}`, userBody)
      .pipe(
        tap((updatedUser) =>
          this.users.update((users) =>
            users.map((user) => (user.id === userId ? updatedUser : user))
          )
        )
      );
  }

  // delete utente per id
  deleteUser(userId: number) {
    return this.httpClient
      .delete(`${this.fetchUrl}/${userId}`)
      .pipe(
        tap(() =>
          this.users.update((users) =>
            users.filter((user) => user.id !== userId)
          )
        )
      );
  }
}
