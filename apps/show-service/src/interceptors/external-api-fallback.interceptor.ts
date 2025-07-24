// interceptors/external-api-fallback.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, NotFoundException } from '@nestjs/common';
import { from, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TmdbApiService } from '../tv-shows/tmdb-api/tmdb-api.service'
// import { TvShowQueueService } from '../queues/tv-show.queue';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExternalApiFallbackInterceptor implements NestInterceptor {
    constructor(
        private tmdbApi: TmdbApiService,
        // private queueService: TvShowQueueService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            catchError((error) => {
                console.log('########Falling back to external API requests########', request.url);

                if (error instanceof NotFoundException || error.status === 404) {
                    // Check if response has already been sent
                    if (response.headersSent) {
                        console.log('Headers already sent, cannot modify response');
                        return throwError(() => error);
                    }

                    // Handle the external API call and manually send response
                    return from(this.handleExternalApiAndRespond(request, response)).pipe(
                        // tap(() => console.log('Response handled')),
                        // Return EMPTY to prevent further processing
                        // switchMap(() => EMPTY)
                    );
                }

                return throwError(() => error);
            })
        );
    }

    private async handleExternalApiAndRespond(request: any, response: any): Promise<void> {
        try {
            const data = await this.tmdbApi.handleOtherRequests(request.url);
            console.log('External API response:', data);

            // Manually send the response
            response.status(200);
            response.setHeader('Content-Type', 'application/json');
            response.send(data);
        } catch (apiError) {
            console.error('External API error:', apiError);
            response.status(502);
            response.send({ error: 'External API error', message: apiError.message });
        }
    }

    private async handleMissingResource(
        tmdbId: number,
        request: any
    ): Promise<Observable<any>> {
        /*
        try {
          // Quick check if exists in TMDB
          const exists = await this.tmdbApi.checkIfExists(tmdbId);
          
          if (exists) {
            // Generate request ID for tracking
            const requestId = uuidv4();
            
            // Queue for processing
            await this.queueService.queueNewShowFetch(
              tmdbId,
              requestId,
              request.user?.id
            );
            
            // Return pending response
            return new Observable(subscriber => {
              subscriber.next({
                status: 'pending',
                message: 'Resource is being fetched from external source',
                requestId,
                estimatedTime: '30-60 seconds',
                pollUrl: `/api/requests/${requestId}/status`,
              });
              subscriber.complete();
            });
          }
        } catch (error) {
          // If TMDB check fails, return original not found
        }
        */

        return throwError(() => new NotFoundException('Resource not found'));
    }
}