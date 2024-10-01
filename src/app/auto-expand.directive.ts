import {Directive, ElementRef, HostListener, OnInit} from '@angular/core';

@Directive({
  selector: '[appAutoExpand]',
  standalone: true
})
export class AutoExpandDirective implements OnInit {

  constructor(private element: ElementRef) {}

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  ngOnInit(): void {
    this.adjust();  // Применяем авторасширение при загрузке
  }

  adjust(): void {
    const textarea = this.element.nativeElement.querySelector('.ui-inputtext');
    if (textarea) {
      textarea.style.overflow = 'hidden';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

}
