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

  checkSuondCondition(arr1: any[], arr2: any[]): boolean {
    
    for (let i = 0; i < arr1.length; i++) {
      const matchingElement = arr2.find(item => item.id === arr1[i].id);
      if (matchingElement && matchingElement.status_A > arr1[i].status_A) {
          return true;
      }
    }

    return false;
  }
  
}
