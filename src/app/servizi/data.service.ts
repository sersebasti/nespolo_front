import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  //constructor() { }

  private sharedData = new BehaviorSubject<string>('');
  sharedData$ = this.sharedData.asObservable();

  updateData(newData: string): void {
    this.sharedData.next(newData);
  }

}
