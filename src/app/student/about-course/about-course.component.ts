import {Component, input} from '@angular/core';

@Component({
  selector: 'app-about-course',
  standalone: true,
  imports: [],
  templateUrl: './about-course.component.html',
  styleUrl: './about-course.component.css'
})
export class AboutCourseComponent {

  courseId = input.required<string>()
}
