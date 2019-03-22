import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Category } from './domain/category';
import { BackEndApi } from './back-end-api';
import { catchError } from 'rxjs/operators';
import { Article } from './domain/article';

@Injectable({
  providedIn: 'root'
})

export class RequestService {

  constructor(
    private http: HttpClient,
  ) {
  }

  getNodes(): Observable<Category[]> {
    return this.http.get<Category[]>(BackEndApi.categories)
      .pipe(catchError(this.handleError<Category[]>('getNodes()')));
  }

  getArticlesByCategory(categoryUrlAlias: string, page: number, size: number): Observable<Article[]> {
    const params = new HttpParams()
      .append('categoryUrlAlias', categoryUrlAlias)
      .append('page', page.toString())
      .append('size', size.toString());
    return this.http.get<Article[]>(BackEndApi.articlesByCategory + '?' + params)
      .pipe(catchError(this.handleError<Article[]>('getArticlesByCategory')));
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      // 将错误信息打印到控制台
      console.log(`这个错误来自于：${operation}`);
      console.log(error);

      // 返回 null ，以表示网络请求错误
      return of(null as T);
    };
  }
}
