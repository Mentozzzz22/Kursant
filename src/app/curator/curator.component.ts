import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-curator',
  standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet
    ],
  templateUrl: './curator.component.html',
  styleUrl: './curator.component.css'
})
export class CuratorComponent implements OnInit, OnDestroy {
  private routerSubscription!: Subscription;
  isHomeworkActive = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHomeworkActive = event.url.startsWith('/curator/curator-homework') || event.url.startsWith('/curator/homework-detail');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
