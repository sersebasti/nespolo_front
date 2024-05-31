import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { GenericService } from '../servizi/generic.service';


@Component({
  selector: 'app-pizzeria',
  templateUrl: './pizzeria.component.html',
  styleUrl: './pizzeria.component.css'
})
export class PizzeriaComponent {

  
  fullData: any;
  collection_pizze: any;
  products: any;
  commanda: any;


  url_main: string | undefined
  url_commande: string | undefined
  bellSound: HTMLAudioElement;

  constructor(private django: DjangoService, private dataService: DataService, 
    private genericService: GenericService){
    
    this.url_main  = dataService.url_main

    this.bellSound = new Audio();
    this.bellSound.src = 'assets/bell-sound-1.wav';

  }


  ngOnInit(): void {

    /*
    collection_id:
    1 -> Pizzeria
    2 -> Cucina
    3 -> Bar
    */
    this.dataService.productsData$.subscribe(data => { 
      // data potrebbe essere null se non è stata completata prima della risposta del server
      if(data !== null){
 
          this.products = data; 
          console.log('Prodotti');
          console.log(this.products)
           
          // ACquisisco commande e filto per collection_id 
          this.dataService.fullData$.subscribe(data => {
            console.log(data);
            this.collection_pizze = this.dataService.filterCommandsByCollectionAndStatus(data, this.products, 1, 'B');
            console.log(this.collection_pizze)  
          });
      }
      else{console.log("Errore. Non sono riuscito ad acquisire i prodotti");}
    });

  }

  remove(element: any){
    var result = window.confirm("Confermi di voler eliminare?");
    if(result){      
      console.log(this.dataService.urls.commande + element.commanda__id + "/")
      this.django.deleteData(this.dataService.urls.commande + element.commanda__id + "/").subscribe((data: any) =>{
        this.dataService.fetchCommandeOnce();
      });
    }

  }
  
  change_production_status(data: any, status: any){
    var body ={"production_status": status}
    this.django.doModify(this.dataService.urls.commande + data.commanda__id + "/", body).subscribe((data: any) =>{
      this.dataService.fetchCommandeOnce(); 
    });
  }

  setPage(data: string){this.dataService.setPage(data)}
}

export interface Commanda{
  id: number;
  quantity: number;
  product_id: number;
  tavolo_id: number;
  production_status: string;
  note: string;
  product__collection_id: number;
  product__title: string;
  tavolo__nome: string
}


  /*
  checkSuondCondition(arr1: any[], arr2: any[]): boolean {
    
    var id1_max = 0;
    arr1.forEach(element1 => {
      if(element1.id > id1_max){id1_max = element1.id}
    });
    
    var id2_max = 0;
    arr2.forEach(element2 => {
      if(element2.id > id2_max){id2_max = element2.id}
    });
    
    if(id2_max > id1_max){
      return true;
    }
    else{
      return false;
    }
    
  }
  /**/
