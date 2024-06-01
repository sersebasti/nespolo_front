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

  version: string = '1.3.0';
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
  
  bellSound: HTMLAudioElement;

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

    this.bellSound = new Audio();

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

  filterCommandsByCollectionAndStatus(commandObjects: any[], collection: number, productionStatus: string): any[] {
    if (!commandObjects) {
        return [];
    }

    // Filter the command objects based on the provided criteria
    const filteredCommands = commandObjects.filter(command => {
        // Check if the command has the specified collection and production status
        return command.commanda__product__collection_id === collection &&
               command.commanda__production_status === productionStatus;
    });

    // Sort the filtered commands by commanda__to_production in ascending order
    filteredCommands.sort((a, b) => {
      // Assuming commanda__to_production is a date/time field
      const dateA = new Date(a.commanda__to_production).getTime();
      const dateB = new Date(b.commanda__to_production).getTime();
      return dateA - dateB;
    });

    return filteredCommands;
  }

  filterCommandsByStatus(commandObjects: any[], productionStatus: string): any[] {
    if (!commandObjects) {
        return [];
    }

    // Filter the command objects based on the provided criteria
    const filteredCommands = commandObjects.filter(command => {
        // Check if the command has the specified collection and production status
        return command.commanda__production_status === productionStatus;
    });

    // Sort the filtered commands by commanda__to_production in ascending order
    filteredCommands.sort((a, b) => {
      // Assuming commanda__to_production is a date/time field
      const dateA = new Date(a.commanda__to_production).getTime();
      const dateB = new Date(b.commanda__to_production).getTime();
      return dateA - dateB;
    });

    return filteredCommands;
  }

  filterByLastToProductionDate(data: any[], last_to_production_ISODate: string): any[] {
    if (!data) {
        return [];
    }

    // Convert last_to_production_ISODate string to Date object
    const lastToProductionDate = new Date(last_to_production_ISODate);

    // Filter elements where commanda__to_production date is greater than lastToProductionDate
    const filteredData = data.filter(item => {
        const itemToProductionDate = new Date(item.commanda__to_production);
        return itemToProductionDate > lastToProductionDate;
    });

    return filteredData;
  }

  getCurrentISODate(): string {
    const now = new Date();
    return now.toISOString();
  }
  
  playSound(src: any){
    const audio = new Audio(src);
    audio.play();
    //console.log(src);
  }

  change_production_status(data: any, status: any){
    var body ={
      "production_status": status,
      "to_production": this.getCurrentISODate()
    }
    this.django.doModify(this.urls.commande + data.commanda__id + "/", body).subscribe((data: any) =>{
      this.fetchCommandeOnce(); 
    });
  }

}