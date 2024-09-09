import {Routes} from '@angular/router';
import {MainPageComponent} from "./non-authorized/main-page/main-page.component";
import {CartComponent} from "./non-authorized/cart/cart.component";
import {LoginComponent} from "./login/login.component";
import {StudentComponent} from "./student/student.component";
import {NonAuthorizedComponent} from "./non-authorized/non-authorized.component";
import {CoursesComponent} from "./student/courses/courses.component";
import {AboutCourseComponent} from "./student/about-course/about-course.component";
import {HomeWorkComponent} from "./student/home-work/home-work.component";
import {SabakPageComponent} from "./student/sabak-page/sabak-page.component";

export const routes: Routes = [
  {
    path: '', component: NonAuthorizedComponent, children: [
      {path: '', component: MainPageComponent},
      {path: 'cart', component: CartComponent},
    ]
  },
  {path: 'login', component: LoginComponent},
  {
    path: 'student', component: StudentComponent, children: [
      {path: 'courses', component: CoursesComponent, children: []},
      {path: 'courses/:courseId', component: AboutCourseComponent},
      {path: 'sabak/:sabakId', component: SabakPageComponent},
      {path: 'homework-list', component: HomeWorkComponent},
    ]
  },
  // {path: '**', redirectTo: '', pathMatch: 'full'},

];
