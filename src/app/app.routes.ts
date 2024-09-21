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
import {CourseComponent} from "./admin/Courses/course/course.component";
import {CuratorComponent} from "./curator/curator.component";
import {HomeworksComponent} from "./curator/homeworks/homeworks.component";
import {HomeworkDetailComponent} from "./curator/homeworks/homework-detail/homework-detail.component";
import {StudentsComponent} from "./curator/students/students.component";
import {EditCourseComponent} from "./admin/Courses/edit-course/edit-course.component";
import {EditModuleComponent} from "./admin/Courses/edit-module/edit-module.component";
import {EditTopicComponent} from "./admin/Courses/edit-topic/edit-topic.component";
import {SalesComponent} from "./sales/sales.component";
import {ApplicationSalesComponent} from "./sales/application-sales/application-sales.component";
import {FlowDetailsComponent} from "./admin/Courses/flow-details/flow-details.component";
import {FlowDeadlinesComponent} from "./admin/Courses/flow-deadlines/flow-deadlines.component";
import {EmployeeComponent} from "./admin/employee/employee.component";
import {CuratorAddComponent} from "./admin/curator-add/curator-add.component";
import {LearnerComponent} from "./admin/learner/learner.component";
import {TestDetailComponent} from "./curator/homeworks/test-detail/test-detail.component";

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
      {path: 'lesson/:lessonId', component: SabakPageComponent},
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
        path: 'employees', component: EmployeeComponent
      },
      {
        path: 'curator-add', component: CuratorAddComponent
      },
      {
        path: 'learner-add', component: LearnerComponent
      },
      {
        path: 'edit-course/:courseId', component: EditCourseComponent,
        children: [
          {
            path: 'edit-module/:moduleId',
            component: EditModuleComponent,
            children: [
              {
                path: 'edit-topic/:topicId',
                component: EditTopicComponent
              }
            ]
          }
        ]
      },
      {
        path: 'flow-details/:flowId', component: FlowDetailsComponent,
        children: [
          {path: 'flow-deadlines/:courseId', component: FlowDeadlinesComponent},
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
        path: 'homework-detail/:id', component: HomeworkDetailComponent
      },
      {
        path: 'test-detail/:id', component: TestDetailComponent
      },
      {
        path: 'curator-students', component: StudentsComponent
      },
      {
        path: 'course', component: CourseComponent
      }
    ]
  },

  {
    path: 'sales',
    component: SalesComponent,
    children: [
      {
        path: 'application-sales', component: ApplicationSalesComponent
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
