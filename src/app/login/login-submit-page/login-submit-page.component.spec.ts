import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSubmitPageComponent } from './login-submit-page.component';

describe('LoginSubmitPageComponent', () => {
  let component: LoginSubmitPageComponent;
  let fixture: ComponentFixture<LoginSubmitPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSubmitPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginSubmitPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
