import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserBody } from '../../models/user.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnChanges {
  // injectors
  private router = inject(Router);
  private userService = inject(UserService);
  private destroRef = inject(DestroyRef);

  // input signal
  user = input<User>();

  // signals
  error = signal<string>('');

  form = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
      ],
    }),
    surname: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
      ],
    }),
    address: new FormControl('', {
      validators: [Validators.minLength(5), Validators.maxLength(75)],
    }),
    location: new FormControl('', {
      validators: [Validators.minLength(3), Validators.maxLength(25)],
    }),
    municipality: new FormControl('', {
      validators: [Validators.minLength(3), Validators.maxLength(25)],
    }),
    province: new FormControl(''),

    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    notes: new FormControl('', {
      validators: [Validators.maxLength(300)],
    }),
  });

  ngOnChanges() {
    if (this.user()) {
      this.form.controls.name.setValue(this.user()!.name);
      this.form.controls.surname.setValue(this.user()!.surname);
      this.form.controls.address.setValue(this.user()!.address);
      this.form.controls.location.setValue(this.user()!.location);
      this.form.controls.municipality.setValue(this.user()!.municipality);
      this.form.controls.province.setValue(this.user()!.province);
      this.form.controls.email.setValue(this.user()!.email);
      this.form.controls.notes.setValue(this.user()!.notes);
    }
  }

  // Submit per la post dell'user
  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    // utilizzo  as userbody ( quindi lo casto) perchè la value del form viene interpretata come partial
    // update come reminder: è la stessa cosa di tipizzarlo ---> <UserBody>this.form.value

    const subscription = this.userService
      .addUser(this.form.value as UserBody)
      .subscribe({
        next: (resData) => {
          Swal.fire({
            title: 'Ottimo!',
            text: 'Utente creato correttamente!',
            icon: 'success',
          }).then(() => {
            this.router.navigate(['/homepage'], {
              queryParams: { highlight: this.form.value.email },
            });
          });
        },
        error: (e) => {
          this.error.set(e.error.message);

          Swal.fire({
            title: 'Attenzione!',
            text: this.error(),
            icon: 'error',
          });
        },
      });

    this.destroRef.onDestroy(() => subscription.unsubscribe());
  }

  // Sumbmit per update dell'user
  onSubmitUpdate() {
    if (this.form.invalid) {
      return;
    }

    const subscription = this.userService
      .updateUser(this.user()!.id, this.form.value as UserBody)
      .subscribe({
        next: (resData) => {
          Swal.fire({
            title: 'Ottimo!',
            text: 'Utente modificato correttamente!',
            icon: 'success',
          }).then(() => {
            this.router.navigate(['/homepage'], {
              queryParams: { highlight: this.form.value.email },
            });
          });
        },
        error: (e) => {
          this.error.set("Ci sono problemi con la modifica dell'utente.");

          Swal.fire({
            title: 'Attenzione!',
            text: this.error(),
            icon: 'error',
          });
        },
      });
    this.destroRef.onDestroy(() => subscription.unsubscribe());
  }

  // Getters per la validazione front-end del form

  inputIsInvalid(input: string) {
    const control = this.form.get(input);
    if (!control) {
      return;
    }
    return control.touched && control.dirty && control.invalid;
  }

  onReset() {
    this.form.reset();
  }
}
