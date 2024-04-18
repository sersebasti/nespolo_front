import { Component, EventEmitter, Input, Output} from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { __values } from 'tslib';
import { GenericService } from '../servizi/generic.service';


@Component({
  selector: 'app-tavolo',
  templateUrl: './tavolo.component.html',
  styleUrl: './tavolo.component.css'
})
export class TavoloComponent {
  @Input() freq: any;
  @Output() sendTavoloData = new EventEmitter<string>();
  @Output() ToLogin = new EventEmitter<boolean>();
  

  products: any;
  tavoli: any;

  intervalIdTavoli: undefined | ReturnType<typeof setTimeout>; 
  
  inputData: any;
  coperti: any;
  bellSound: any;
  
  // da fare: se ci sono molti tavoli il bottone su deve spostare più in basso
  //molti_tav = false

  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService){
    this.bellSound = new Audio();
    this.bellSound.src = 'assets/bell-sound-1.wav';
  }
  
  ngOnInit(): void {
    
    // Test 
    //console.log("Test");

    // Get Tavoli
    console.log("ngOndTavoloInit");
    this.django.getData(this.dataService.urls.tavoli_status).subscribe((data: any) =>{
      this.tavoli = data;
      console.log(data)
    });
    
    // Update Tavoli - freq (ms)
    this.intervalIdTavoli = setInterval(()=>{
      this.django.getData(this.dataService.urls.tavoli_status).subscribe((data: any) =>{
        
        console.log(data)
        
        if(this.checkSuondCondition(this.tavoli,data)){
          this.bellSound.play();
        }

        if(!this.genericService.arraysAreEqual(data,this.tavoli)){
          this.tavoli = data;
          console.log(this.tavoli);
        }
        
        
      });
    }, this.freq);
    
    // Get Products
    this.django.getData(this.dataService.urls.products).subscribe((data: any) =>{
      this.products = data;
      console.log(this.products);
      //send poducts to data service as json file
      this.dataService.updateData(JSON.stringify(this.products));
    });
  }

  ngOnDestroy(): void {
    console.log("ngOnTavoloDestroy");
    clearInterval(this.intervalIdTavoli);
  }


  onEnterKeyPressed(event: KeyboardEvent): void {
    

    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
       
      
      // Acquisico numero coperti
      this.coperti = prompt("Inserisci numero coperti:")
      var intCoperti = parseInt(this.coperti);

      // Check if the input is a valid integer
      if (isNaN(intCoperti)) {
      // Display the integer value
      alert("Inserisci numero coperti");
      } 
      else{
        
        this.inputData = (<HTMLInputElement>event.target).value

        // Insert new element Tavolo
        this.django.doCreate(this.dataService.urls.tavoli,{"nome": this.inputData, "coperti": intCoperti}).subscribe((response: any) => {
          console.log(JSON.stringify(response));
          
          // Update Tavoli
          this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
            this.tavoli = data;
             
            (<HTMLInputElement>event.target).blur();
  
          });
  
        });
      }

    }
  }

  onTavoloClick(event: any){
   console.log(JSON.stringify(event))
   this.sendTavoloData.emit(JSON.stringify(event))
  }

    //remove(element: any){this.commandaComponent.remove(element)}
    remove(element: any){
      
      
      
      var result = window.confirm("Sicuro di voler eliminare il tavolo?");

        // Check the result
      if (result) {
        console.log("rimuovo tavolo:" + this.dataService.urls.tavoli + element.id + "/")

        this.django.deleteData(this.dataService.urls.tavoli + element.id + "/").subscribe((data: any) =>{
         
        
          // Update Tavoli
          this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
            this.tavoli = data;
          });
          
        });
        
      } else {
        // If user clicks Cancel or closes the dialog, cancel the delete action
        console.log("Delete cancelled");
      }
      
    }


  toLogin(data: any){
      console.log("toLogin")
      this.ToLogin.emit(true)
      clearInterval(this.intervalIdTavoli);
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
