import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval, switchMap, tap } from 'rxjs';
import { DjangoService } from '../servizi/django.service';
import { GenericService } from '../servizi/generic.service';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  collection: number;
  tipo_prodotto: number;
}

export interface Commanda{
  id: number;
  nome: string;
  coperti: number;
  commanda__id: number;
  commanda__product_id: number;
  commanda__quantity: number;
  commanda__production_status: string;
  commanda__note: string;
}


@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  url_main: string = 'https://sersebasti.ddns.net/commanda/'
  //url_main: string = 'http://localhost:8000/commanda/'

  urls: { main: string; products: string; commande: string; tavoli: string; tavoli_status: string; ordinazione: string; full: string;}

  version: string = '1.2.0';
  version_back: string = '2.5.14';

  freq: number = 2000;
  selectedTable: number = 0;
  numeroCoperti: number = 0;

  //questi servono per condividere con gl'altri componenti i dati

  // commande
  private fullDataSubject = new BehaviorSubject<any>(null);
  public fullData$ = this.fullDataSubject.asObservable();

  
  // prodotti
  private productsDataSubject = new BehaviorSubject<any>(null);
  productsData$ = this.productsDataSubject.asObservable();
  
  // visibilità pagine
  private mainVisibleSubject = new BehaviorSubject<boolean>(false);
  mainVisible$ = this.mainVisibleSubject.asObservable();
  private tavoliVisibleSubject = new BehaviorSubject<boolean>(false);
  tavoliVisible$ = this.tavoliVisibleSubject.asObservable();
  private commandaVisibleSubject = new BehaviorSubject<boolean>(false);
  commandaVisible$ = this.commandaVisibleSubject.asObservable();
  private pizzeriaVisibleSubject = new BehaviorSubject<boolean>(false);
  pizzeriaVisible$ = this.pizzeriaVisibleSubject.asObservable();
  private cucinaVisibleSubject = new BehaviorSubject<boolean>(false);
  cucinaVisible$ = this.cucinaVisibleSubject.asObservable();
  

  constructor(private django: DjangoService) {
    
    this.urls = {
      'main': this.url_main,
      'products': this.url_main + 'products/',
      'commande': this.url_main + 'commande/',
      'tavoli': this.url_main + 'tavoli/',
      'tavoli_status': this.url_main + 'commanda_tavoli_status/',
      'ordinazione': this.url_main + 'tavolo/',
      'full': this.url_main + 'full/'
    };

    this.startFetchingCommande();
    this.fetchProducts();
    this.setPage('main');

  }

  private startFetchingCommande(): void {

    interval(this.freq).subscribe(() => {
      this.django.getData(this.urls.full).subscribe((data: any) => {
        //console.log(data)
        this.fullDataSubject.next(data);
      });
    });

  }


  public fetchCommandeOnce(): any {
    this.django.getData(this.urls.full).subscribe((data: any) => {
      console.log("fetchCommandeOnce");
      console.log(data);
      this.fullDataSubject.next(data); // Updating the subject with the fetched data
    });
  }

  public fetchCommandeRetrunData(): Observable<any> {
    return this.django.getData(this.urls.full);
  }


  private fetchProducts(): void {

    this.django.getData(this.urls.products).subscribe((data: any) => {
        this.productsDataSubject.next(data);
    });

  }
  

  public setPage(page: string) {

    this.mainVisibleSubject.next(false);
    this.tavoliVisibleSubject.next(false);
    this.commandaVisibleSubject.next(false);
    this.pizzeriaVisibleSubject.next(false);
    this.cucinaVisibleSubject.next(false);

    switch(page) {
      case 'main':
        this.mainVisibleSubject.next(true);
        break;
      case 'tavoli':
        this.tavoliVisibleSubject.next(true);
        break;
      case 'commanda':
        this.commandaVisibleSubject.next(true);
        break;
      case 'pizzeria':
        this.pizzeriaVisibleSubject.next(true);
        break;
      case 'cucina':
        this.cucinaVisibleSubject.next(true);
        break;
      default:
        console.log("Nessuna azione per: " + page)
        break;
    } 

  }

  setSelectedTable(table_id: number){
    
    this.selectedTable = table_id;



  }

  getSelectedTable(callback: (selectedTable: any, numeroCoperti: any) => void) {
    this.django.getData(this.urls['tavoli'] + this.selectedTable + '/').subscribe((data: any) => {
      this.numeroCoperti = data.coperti;
      callback(this.selectedTable, this.numeroCoperti);
    });

  }

  filterCommandsByCollectionAndStatus(commandObjects: any[], products: any[], collection: number, productionStatus: string): any[] {
    if (!commandObjects || !products) {
      return [];
    }

    return commandObjects
      .filter(command => {
        // Find the corresponding product
        const product = products.find(p => p.id === command.commanda__product_id);

        // Check if the product exists and has the specified collection and production status
        return product && 
               product.collection === collection && 
               command.commanda__production_status === productionStatus;
      })
      .map(command => {
        // Find the corresponding product
        const product = products.find(p => p.id === command.commanda__product_id);
        return {
          ...command,
          product__title: product ? product.title : null
        };
      });
  }

  




}