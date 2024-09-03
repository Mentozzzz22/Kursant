import {Routes} from '@angular/router';
import {MainPageComponent} from "./non-authorized/main-page/main-page.component";
import {CartComponent} from "./non-authorized/cart/cart.component";
import {LoginComponent} from "./login/login.component";
import {StudentComponent} from "./student/student.component";
import {NonAuthorizedComponent} from "./non-authorized/non-authorized.component";

export const routes: Routes = [
  {
    path: '', component: NonAuthorizedComponent, children: [
      {path: '', component: MainPageComponent},
      {path: 'cart', component: CartComponent},
    ]
  },
  {path: 'login', component: LoginComponent},
  {path: '**', redirectTo: '', pathMatch: 'full'},

];
