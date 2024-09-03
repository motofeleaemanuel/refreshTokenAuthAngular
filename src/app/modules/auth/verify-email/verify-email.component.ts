import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseLoadingService } from '@fuse/services/loading';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  alertType: string = '';
  alertMessage: string = '';

  private _fuseLoadingService = inject(FuseLoadingService);
  private _route = inject(ActivatedRoute);
  private _authService = inject(AuthService);

  ngOnInit(): void {
    const token = this._route.snapshot.queryParamMap.get('token');

    if (!token) {
      this._setAlert('error', 'Invalid verification link.');
      return;
    }

    this._fuseLoadingService.show();
    this._authService.verifyEmail(token).subscribe({
      next: (response: any) => {
        this._fuseLoadingService.hide();
        this._setAlert(
          response.message === 'Email is already verified' ? 'warning' : 'success',
          response.message
        );
      },
      error: (error) => {
        this._fuseLoadingService.hide();
        this._setAlert('error', this._getErrorMessage(error.status));
      }
    });
  }

  private _setAlert(type: string, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  private _getErrorMessage(status: number): string {
    const messages: { [key: number]: string } = {
      400: 'Invalid or expired token.',
      404: 'User not found.',
      500: 'Server error. Please try again later.'
    };

    return messages[status] || 'An unexpected error occurred.';
  }
}