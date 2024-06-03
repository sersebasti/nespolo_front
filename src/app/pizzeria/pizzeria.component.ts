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
  bellSound_src: string;

  subscription: Subscription | undefined;


  constructor(private django: DjangoService, private dataService: DataService){
    this.url_main  = dataService.url_main

    this.bellSound_src = 'assets/bell-sound-1.wav';
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
            console.log('pizzeria');
            //console.log(data);
            this.collection_pizze = this.dataService.filterCommandsByCollectionAndStatus(data, 1, 'B');
            console.log(this.collection_pizze);
            
            this.collection_new_things = this.dataService.filterByLastToProductionDate(this.collection_pizze, this.last_to_production_ISODate);
            
            console.log(this.last_to_production_ISODate);
            if (this.collection_new_things.length > 0) {
              console.log(this.collection_new_things.length);
              
              // Perform the action (e.g., make a sound)
              this.dataService.playSound(this.bellSound_src);
        
              // Update last_to_production_ISODate to the most recent commanda__to_production in the filtered array
              const mostRecentDate = new Date(Math.max(...this.collection_new_things.map((item: { commanda__to_production: string | number | Date; }) => new Date(item.commanda__to_production).getTime())));
              this.last_to_production_ISODate = mostRecentDate.toISOString();
              console.log(this.last_to_production_ISODate);
            }

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
