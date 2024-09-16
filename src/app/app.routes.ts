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
import {AccessDeniedComponent} from "./login/access-denied/access-denied.component";
import {TestPageComponent} from "./student/test-page/test-page.component";
import {ApplicationComponent} from "./admin/application/application.component";
import {AdminComponent} from "./admin/admin.component";
import {CourseComponent} from "./admin/course/course.component";
import {CuratorComponent} from "./curator/curator.component";
import {HomeworksComponent} from "./curator/homeworks/homeworks.component";
import {HomeworkDetailComponent} from "./curator/homeworks/homework-detail/homework-detail.component";
import {StudentsComponent} from "./curator/students/students.component";
import {EditCourseComponent} from "./admin/edit-course/edit-course.component";
import {EditModuleComponent} from "./admin/edit-module/edit-module.component";
import {EditTemaComponent} from "./admin/edit-tema/edit-tema.component";

export const routes: Routes = [
  {
    path: '', component: NonAuthorizedComponent, children: [
      {path: '', component: MainPageComponent},
      {path: 'cart', component: CartComponent},
    ]
  },
  {path: 'login', component: LoginComponent},
  {path: 'access-denied', component: AccessDeniedComponent},

  {
    path: 'student', component: StudentComponent, children: [
      {path: 'courses', component: CoursesComponent, children: []},
      {path: 'courses/:courseId', component: AboutCourseComponent},
      {path: 'sabak/:sabakId', component: SabakPageComponent},
      {path: 'test/:testId', component: TestPageComponent},
      {path: 'homework-list', component: HomeWorkComponent},
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'applications', component: ApplicationComponent
      },
      {
        path: 'course', component: CourseComponent
      },
      {
        path: 'edit-course/:courseId', component: EditCourseComponent,
        children: [
          {
            path: 'edit-module/:moduleId',
            component: EditModuleComponent,
            children: [
              {
                path: 'edit-tema/:temaId',
                component: EditTemaComponent
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'curator',
    component: CuratorComponent,
    children: [
      {
        path: 'curator-homework', component: HomeworksComponent
      },
      {
        path: 'homework-detail', component: HomeworkDetailComponent
      },
      {
        path: 'curator-students', component: StudentsComponent
      },
      {
        path: 'course', component: CourseComponent
      }
    ]
  },
  // {path: '**', redirectTo: '', pathMatch: 'full'},

];
