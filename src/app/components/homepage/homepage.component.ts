import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { User } from '../../models/user.interface';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit {
  // injectors
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  // signals per l'interfaccia
  originalUsers = signal<User[]>([]);
  users = computed(() => this.originalUsers());
  highlightedUser = signal<string | null>(null);
  isLoading = signal(false);
  error = signal('');

  // signals per il sorting
  sortOrder = signal<'asc' | 'desc' | 'none'>('none');
  sortBy = signal<'name' | 'surname' | 'email' | 'municipality' | ''>('');

  // signals per il filter
  filterBy = signal<'name' | 'surname' | 'email' | 'municipality' | 'Filtra'>(
    'Filtra'
  );
  filterValue = signal<string>('');

  ngOnInit() {
    this.isLoading.set(true);
    const subscription = this.userService.getAllUsers().subscribe({
      next: (resData) => {
        this.originalUsers.set(resData);
      },
      error: (e) => {
        this.error.set('Ci sono problemi con la richiesta. Riprova più tardi!');
      },
      complete: () => this.isLoading.set(false),
    });

    this.route.queryParams.subscribe((params) => {
      if (params['highlight']) {
        this.highlightedUser.set(params['highlight']);
        setTimeout(() => this.scrollToHighlightedUser(), 1000);
      }
    });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onDeleteUser(userId: number) {
    const subscription = this.userService
      .deleteUser(userId)
      .pipe(
        tap(() =>
          this.originalUsers.update((users) =>
            users.filter((user) => user.id !== userId)
          )
        )
      )
      .subscribe();
  }

  private scrollToHighlightedUser() {
    const element = document.getElementById(String(this.highlightedUser()));
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onRemoveHighlight() {
    this.highlightedUser.set(null);
  }

  sortedAndFilteredUsers = computed(() => {
    let result = this.users();
    const currentFilterBy = this.filterBy();
    const currentFilterValue = this.filterValue().toLowerCase();
    const currentSortBy = this.sortBy();
    const currentSortOrder = this.sortOrder();

    // qui filtro la lista di utenti in base al valore e al tipo di filtro
    if (currentFilterBy !== 'Filtra' && currentFilterValue) {
      result = result.filter((user) => {
        const value = user[currentFilterBy].toLowerCase();
        return value.includes(currentFilterValue);
      });
    }

    // qui permetto l'ordinamento in base all'ordine e alla colonna
    if (currentSortBy && currentSortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const compareResult = a[currentSortBy].localeCompare(b[currentSortBy]);
        return currentSortOrder === 'asc' ? compareResult : -compareResult;
      });
    }

    return result;
  });

  onSort(sortBy: 'name' | 'surname' | 'email' | 'municipality') {
    if (this.sortBy() === sortBy) {
      this.sortOrder.update((order) => {
        switch (order) {
          case 'asc':
            return 'desc';
          case 'desc':
            return 'none';
          case 'none':
            return 'asc';
        }
      });
      if (this.sortOrder() === 'none') {
        this.sortBy.set('');
      }
    } else {
      this.sortBy.set(sortBy);
      this.sortOrder.set('asc');
    }
  }

  onDeleteAlert(userId: number) {
    Swal.fire({
      title: 'Sei sicuro?',
      text: 'Non potrai più annullare questa azione!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, elimina!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.onDeleteUser(userId);
        Swal.fire({
          title: 'Eliminato!',
          text: 'Utente eliminato correttamente.',
          icon: 'success',
        });
      }
    });
  }
}
