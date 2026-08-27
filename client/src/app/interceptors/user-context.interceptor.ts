import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CurrentUserService } from '../services/current-user.service';

export const userContextInterceptor: HttpInterceptorFn = (req, next) => {
    
    const currentUserService = inject(CurrentUserService);

    const clonedRequest = req.clone({
        setHeaders: {
            'X-Demo-User-Id': currentUserService.userId
        }
    });

    return next(clonedRequest);
};