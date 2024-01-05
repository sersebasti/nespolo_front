import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DjangoService {

  constructor(private http: HttpClient){}

  doCreate(url: string, body: {}) {
    return this.http.post(url, body)
  }

  doModify(url: string, body: {}) {
    return this.http.put(url, body)
  }

  getData(url: string){
    return this.http.get(url)
  }

  deleteData(url: string){
    return this.http.delete(url)
  }



}


