import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

// Функциональный guard для проверки состояния компонента
export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  // Если компонент реализует метод canDeactivate, вызываем его
  return component.canDeactivate ? component.canDeactivate() : true;
};
