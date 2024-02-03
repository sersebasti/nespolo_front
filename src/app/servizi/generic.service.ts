import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor() { }


  arraysAreEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1 == null || arr2 == null || arr1.length !== arr2.length ) {
      return false;
    }
  
    return arr1.every((obj1, index) => JSON.stringify(obj1) === JSON.stringify(arr2[index]));
  }
  
}
