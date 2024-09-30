import { CanDeactivateFn } from '@angular/router';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {inject} from "@angular/core";
import {Observable} from "rxjs";
import {ConfirmationDialogComponent} from "../confirmation-dialog/confirmation-dialog.component";

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const pendingChangeGuard: CanDeactivateFn<CanComponentDeactivate> =
  (component, route, state) => {
    const dialogService = inject(DialogService);

    if (component.canDeactivate()) {
      return true;
    }

    const dialogRef: DynamicDialogRef = dialogService.open(ConfirmationDialogComponent, {
      header: 'Подтверждение',
      width: '350px',
      data: 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?'
    });

    return dialogRef.onClose.toPromise();
  };
;
