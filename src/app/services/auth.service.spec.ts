import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should surface the backend login error message', () => {
    service.login('demo@example.com', 'wrong-password').subscribe({
      next: () => fail('Expected login to fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe('Invalid email or password');
      },
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
  });
});
