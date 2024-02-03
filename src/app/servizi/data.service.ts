import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  url_main: string = 'http://sersebasti.ddns.net/commanda/'
  //url_main: string = 'http://localhost:8000/commanda/'
  urls: { main: string; products: string; commande: string; tavoli: string; ordinazione: string; };

  constructor() {  
    this.urls = {
      'main': this.url_main,
      'products': this.url_main + 'products/',
      'commande': this.url_main + 'commande/',
      'tavoli': this.url_main + 'tavoli/',
      'ordinazione': this.url_main + 'tavolo/'
    };
  }

  private sharedData = new BehaviorSubject<string>('');
  sharedData$ = this.sharedData.asObservable();
  
  updateData(newData: string): void {
    this.sharedData.next(newData);
  }
}
