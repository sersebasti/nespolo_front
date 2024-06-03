import { Injectable } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { BehaviorSubject, interval, Subject,Observable } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


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

  version: string = '1.4.2';
  version_back: string = '2.5.14';

  private readonly freq = 1500;
  selectedTable: number = 0;
  numeroCoperti: number = 0;

  //questi servono per condividere con gl'altri componenti i dati

  // commande
  private fullDataSubject = new BehaviorSubject<any>(null);
  private destroy$ = new Subject<void>();



  
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
  
  commanda_prodotte: any;
  collection_all: any;
  collection_new: any;

  last_to_production_ISODate_sala: string;
  last_to_production_ISODate_pizzeria: string;
  last_to_production_ISODate_cucina: string;

  bellSound_pizzeria_src: string;
  bellSound_cucina_src: string;



  private UsedComponentSubject = new BehaviorSubject<string>('');


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

    this.bellSound_pizzeria_src = 'assets/bell-sound-1.wav';
    this.bellSound_cucina_src = 'assets/bell-sound-2.wav';

    this.last_to_production_ISODate_sala = this.getCurrentISODate();
    this.last_to_production_ISODate_pizzeria = this.getCurrentISODate();
    this.last_to_production_ISODate_cucina = this.getCurrentISODate();
  }


  private startFetchingCommande(): void {

    interval(this.freq)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.django.getData(this.urls.full))
      )
      .subscribe((data: any) => {
        this.fullDataSubject.next(data);

        // Produco il suono a secono del component in cui mi trovo
        console.log("Active Component: " + this.getUsedComponentSubject());
        
        switch(this.getUsedComponentSubject()) {

          case 'tavoli':
            this.TavoliCommandaBell(data);
            break;

          case 'commanda':
            this.TavoliCommandaBell(data);
            break;  
          case 'pizzeria':
            this.PizzeriaBell(data);
            break;
          case 'cucina':
            this.CucinaBell(data);
            break;
        } 
        //this.dataService.filterCommandsByCollectionAndStatus(data, 1, 'B');
        
      });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get fullData$() {
    return this.fullDataSubject.asObservable();
  }
  
  get UsedComponentSubject$() {
    return this.UsedComponentSubject.asObservable();
  }

  setUsedComponentSubject(value: string): void {
    this.UsedComponentSubject.next(value);
  }

  getUsedComponentSubject(): string {
    return this.UsedComponentSubject.getValue();
  }


  public PizzeriaBell(data: any){

    this.collection_all = this.filterCommandsByCollectionAndStatus(data, 1 , 'B');
    this.collection_new = this.filterByLastToProductionDate(this.collection_all, this.last_to_production_ISODate_pizzeria);
            
    if (this.collection_new.length > 0) {
      console.log(this.collection_new.length);
      
      // Perform the action (e.g., make a sound)
      this.playSound(this.bellSound_pizzeria_src);

      // Update last_to_production_ISODate to the most recent commanda__to_production in the filtered array
      const mostRecentDate = new Date(Math.max(...this.collection_new.map((item: { commanda__to_production: string | number | Date; }) => new Date(item.commanda__to_production).getTime())));
      this.last_to_production_ISODate_pizzeria = mostRecentDate.toISOString();
      console.log(this.last_to_production_ISODate_pizzeria);
    }
  }

  public CucinaBell(data: any){
    
    this.collection_all = this.filterCommandsByCollectionAndStatus(data, 2 , 'B');
    this.collection_new = this.filterByLastToProductionDate(this.collection_all, this.last_to_production_ISODate_cucina);
            
    if (this.collection_new.length > 0) {
      console.log(this.collection_new.length);
      
      // Perform the action (e.g., make a sound)
      this.playSound(this.bellSound_cucina_src);

      // Update last_to_production_ISODate to the most recent commanda__to_production in the filtered array
      const mostRecentDate = new Date(Math.max(...this.collection_new.map((item: { commanda__to_production: string | number | Date; }) => new Date(item.commanda__to_production).getTime())));
      this.last_to_production_ISODate_cucina = mostRecentDate.toISOString();
      console.log(this.last_to_production_ISODate_cucina);
    }
  }


  public TavoliCommandaBell(data: any){

    this.commanda_prodotte = this.filterByLastToProductionDate(this.filterCommandsByStatus(data,'C'), this.last_to_production_ISODate_sala);

    if (this.commanda_prodotte.length > 0) {

      console.log(this.commanda_prodotte.length);
      console.log(this.commanda_prodotte);
      // Perform the action (e.g., make a sound)
      //this.dataService.playSound(this.bellSound_pizzeria_src);
      this.checkAndPlaySoundsTavoliCommanda(this.commanda_prodotte);
      
      // Update last_to_production_ISODate to the most recent commanda__to_production in the filtered array
      const mostRecentDate = new Date(Math.max(...this.commanda_prodotte.map((item: { commanda__to_production: string | number | Date; }) => new Date(item.commanda__to_production).getTime())));
      this.last_to_production_ISODate_sala = mostRecentDate.toISOString();
      console.log(this.last_to_production_ISODate_sala);
    }
  }

  checkAndPlaySoundsTavoliCommanda(data: any[]): void {
    // Filter the data for collection IDs 1 and 2
    const filteredData = data.filter(item =>
      item.commanda__product__collection_id === 1 || item.commanda__product__collection_id === 2
    );

    // Sort the filtered data by commanda__to_production date
    filteredData.sort((a, b) => new Date(a.commanda__to_production).getTime() - new Date(b.commanda__to_production).getTime());

    // Flags to check if sounds have been played
    let sound1Played = false;
    let sound2Played = false;

    // Play sounds based on collection IDs
    for (let item of filteredData) {
      if (item.commanda__product__collection_id === 1 && !sound1Played) {
        this.playSound(this.bellSound_pizzeria_src);
        sound1Played = true;
      }
      if (item.commanda__product__collection_id === 2 && !sound2Played) {
        this.playSound(this.bellSound_cucina_src);
        sound2Played = true;
      }

      // If both sounds have been played, break out of the loop
      if (sound1Played && sound2Played) {
        break;
      }
    }

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

  setSelectedTable(table_id: number){this.selectedTable = table_id;}

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