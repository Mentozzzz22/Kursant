import {Component, input, OnInit} from '@angular/core';
import {ProgressBarModule} from "primeng/progressbar";
import {BreadcrumbModule} from "primeng/breadcrumb";
import {NgClass, NgIf} from "@angular/common";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-sabak-page',
  standalone: true,
  imports: [
    ProgressBarModule,
    BreadcrumbModule,
    NgClass,
    NgIf
  ],
  templateUrl: './sabak-page.component.html',
  styleUrl: './sabak-page.component.css'
})
export class SabakPageComponent implements OnInit {
  sabakId = input.required<string>()

  public progress: number = 50;

  public sabaktar: any = [
    {id: 1, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 2, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 3, status: 'finished', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 4, status: 'opened', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 5, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 6, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 7, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'},
    {id: 8, status: 'closed', tema: 'Мезолит', sabakName: 'Орта тас дәуірі'}
  ]

  getTemaStatusIcon(status: string): string {
    if (status === 'finished') {
      return 'assets/images/finished.svg';
    } else if (status === 'opened') {
      return 'assets/images/opened.svg';
    } else {
      return 'assets/images/closed.svg';
    }
  }

  items: MenuItem[] | undefined;

  home: MenuItem | undefined;

  ngOnInit() {
    this.items = [
      {label: '< Қазақстан тарихы', route: '/#'},
      {label: 'Қазақстандағы ежелгі адамдардың өмірі', route: '/#'},
      {label: 'Қазақстан тарихын зерттеуші отандық тарихшылар', route: '/#'}
    ]
  }
}
