import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { GenericService } from '../servizi/generic.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-pizzeria',
  templateUrl: './pizzeria.component.html',
  styleUrl: './pizzeria.component.css'
})
export class PizzeriaComponent {

  
  fullData: any;
  collection_pizze: any;
  collection_new_things: any;
  commanda: any;


  url_main: string | undefined
  url_commande: string | undefined
  
  last_to_production_ISODate: string;
  //bellSound_src: string;

  subscription: Subscription | undefined;


  constructor(private django: DjangoService, private dataService: DataService){
    this.url_main  = dataService.url_main

    //this.bellSound_src = 'assets/bell-sound-1.wav';
    this.last_to_production_ISODate = this.dataService.getCurrentISODate();

  }


  ngOnInit(): void {

    /*
    collection_id:
    1 -> Pizzeria
    2 -> Cucina
    3 -> Bar
    */
          this.dataService.setUsedComponentSubject('pizzeria');
          // Acquisisco commande e filto per collection e status 
          this.subscription = this.dataService.fullData$.subscribe(data => {
        
            //console.log(data);
            this.collection_pizze = this.dataService.filterCommandsByCollectionAndStatus(data, 1, 'B');
           
            
          });


  }

  ngOnDestroy(): void {
    if(this.subscription){this.subscription.unsubscribe();}
    this.dataService.setUsedComponentSubject('');
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
  
  handleChangeProductionStatus(element: any, status: string): void {
    this.dataService.change_production_status(element, status);
  }

  setPage(data: string){
    if(data == "main" && this.subscription){this.subscription.unsubscribe();}
    this.dataService.setPage(data)
  }
}
