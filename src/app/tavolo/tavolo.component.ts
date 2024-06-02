import { Component, EventEmitter, Input, Output} from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { __values } from 'tslib';
import { GenericService } from '../servizi/generic.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-tavolo',
  templateUrl: './tavolo.component.html',
  styleUrl: './tavolo.component.css'
})
export class TavoloComponent {
  
  @Output() ToLogin = new EventEmitter<boolean>();
  
  tavoli: any;
  //intervalIdTavoli: undefined | ReturnType<typeof setTimeout>; 
  inputData: any;
  coperti: any;
  bellSound: any;

  commanda_prodotte: any;

  bellSound_pizzeria_src: string;
  bellSound_cucina_src: string;

  last_to_production_ISODate: string;

  subscription: Subscription | undefined;

  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService){
    
    this.bellSound_pizzeria_src = 'assets/bell-sound-1.wav';
    this.bellSound_cucina_src = 'assets/bell-sound-2.wav';

    this.last_to_production_ISODate = this.dataService.getCurrentISODate();
    
  }
  
  ngOnInit(): void {

    
    // Aquisico full data
    this.subscription = this.dataService.fullData$.subscribe(data => {

      console.log('tavoli');
      
      // data potrebbe essere null se non è stata completata a prima risposta del server
      if(data !== null){
        //console.log(data);

        // Initialize an empty object to store the grouped orders
        const groupedOrders: GroupedOrders = {};
        
        /*
        STATUS_A = 'A'
        STATUS_B = 'B'
        STATUS_C = 'C'
        STATUS_D = 'D'
      
        STATUS = [
            (STATUS_A, 'SuCommanda'),
            (STATUS_B, 'InProduzione'),
            (STATUS_C, 'ProduzioneCompletata'),
            (STATUS_D, 'Servito'),
        ]
        /**/ 
        
        // Loop through each order in the data array
        data.forEach((elem: { id: any; nome: any; commanda__production_status: any; }) => {

          // Extract relevant information from the current order
          const tavoloId = elem.id;
          const tavolo_nome = elem.nome;
          const production_status = elem.commanda__production_status;

          // Determine whether the current order contributes to AC and C counts
          const production_status_AC_Count = production_status === 'A' || production_status === 'C' ? 1 : 0;
          const production_status_C_Count = production_status === 'C' ? 1 : 0;
          
          // If the table ID doesn't exist in groupedOrders, initialize it
          if (!groupedOrders[tavoloId]) {
            groupedOrders[tavoloId] = { tavoloId, tavolo_nome, status_AC_Count: 0,  status_C_Count: 0};
          }
          
          // Increment the counts for AC and C statuses for the current table
          groupedOrders[tavoloId].status_AC_Count += production_status_AC_Count;
          groupedOrders[tavoloId].status_C_Count += production_status_C_Count;
        });
        
        // Convert the grouped orders object to an array and assign it to this.tavoli
        this.tavoli = Object.values(groupedOrders);
        console.log(this.tavoli);
        console.log(this.dataService.getCurrentISODate())

        this.commanda_prodotte = this.dataService.filterByLastToProductionDate(this.dataService.filterCommandsByStatus(data,'C'), this.last_to_production_ISODate);
        if (this.commanda_prodotte.length > 0) {
          console.log(this.commanda_prodotte.length);
          console.log(this.commanda_prodotte);
          // Perform the action (e.g., make a sound)
          //this.dataService.playSound(this.bellSound_pizzeria_src);
          this.checkAndPlaySounds(this.commanda_prodotte);
    
          // Update last_to_production_ISODate to the most recent commanda__to_production in the filtered array
          const mostRecentDate = new Date(Math.max(...this.commanda_prodotte.map((item: { commanda__to_production: string | number | Date; }) => new Date(item.commanda__to_production).getTime())));
          this.last_to_production_ISODate = mostRecentDate.toISOString();
          console.log(this.last_to_production_ISODate);
        }


      }
    });


  }


  
  // Quando aggiungo un nuovo tavolo
  onEnterKeyPressed(event: KeyboardEvent): void {

    if (event.key === 'Enter') {

      this.coperti = prompt("Inserisci numero coperti:")
      var intCoperti = parseInt(this.coperti);

      if (isNaN(intCoperti)) {alert("Inserisci numero coperti");} 
      else{
        this.inputData = (<HTMLInputElement>event.target).value

        this.django.doCreate(this.dataService.urls.tavoli,{"nome": this.inputData, "coperti": intCoperti}).subscribe((response: any) => {
          console.log("Creato tavolo: " + this.inputData);
          console.log(JSON.stringify(response));
        });
      }

    }
  }
  
  // Vado sulla commanda del tavolo
  onTavoloClick(event: any){
   console.log(JSON.stringify(event));

   // Imposto valore a tavolo selezionato
   this.dataService.setSelectedTable(event.tavoloId);
   
   // Visualizzo pagina commanda
   this.setPage('commanda');
  }

  // rimuovo il tavolo
  removeTavolo(element: any){
    var result = window.confirm("Sicuro di voler eliminare il tavolo?");
    if (result) {
      this.django.deleteData(this.dataService.urls.tavoli + element.tavoloId + "/").subscribe((data: any) =>{  
        console.log("Eliminato il tavolo: " + element.tavoloId);
      });
    }
  }

  checkAndPlaySounds(data: any[]): void {
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
        this.dataService.playSound(this.bellSound_pizzeria_src);
        sound1Played = true;
      }
      if (item.commanda__product__collection_id === 2 && !sound2Played) {
        this.dataService.playSound(this.bellSound_cucina_src);
        sound2Played = true;
      }

      // If both sounds have been played, break out of the loop
      if (sound1Played && sound2Played) {
        break;
      }
    }
  }

  setPage(data: string){
    if(data == "main" && this.subscription){this.subscription.unsubscribe();}
    this.dataService.setPage(data)
  }
 
}



// Define an interface for the grouped orders (optional, for better type checking)
export interface GroupedOrders {
  [tavoloId: number]: { 
    tavoloId: number; tavolo_nome: string, status_AC_Count: number, status_C_Count: number
  };
}
      
