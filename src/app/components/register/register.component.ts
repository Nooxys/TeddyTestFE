import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  userId = input.required<string>();

  user = signal<User | undefined>(undefined);

  ngOnInit() {
    if (this.userId()) {
      const subscription = this.userService
        .getUserById(+this.userId())
        .subscribe({
          next: (data) => {
            this.user.set(data);
          },
        });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }
}
