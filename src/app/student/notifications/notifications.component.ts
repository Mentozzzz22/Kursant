import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {NotificationService} from "../../service/notification.service";
import {Message} from "../../../assets/models/message.interface";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {

  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  public messages: { created_at: string, text: SafeHtml, is_read: boolean }[] = [];


  ngOnInit() {
    this.getMessages()
  }

  public getMessages() {
    this.notificationService.getMessages().subscribe(data => {
      this.messages = data.messages.map(message => ({
        ...message,
        text: this.sanitizer.bypassSecurityTrustHtml(message.text) // Bypass sanitization
      }));
    });
  }
}
