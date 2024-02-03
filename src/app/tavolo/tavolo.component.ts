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
  
  // da fare: se ci sono molti tavoli il bottone su deve spostare più in basso
  //molti_tav = false

  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService){
  }
  
  ngOnInit(): void {
    

    // Get Tavoli
    console.log("ngOndTavoloInit");
    this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
      this.tavoli = data;
      console.log(data)
    });
    
    // Update Tavoli - freq (ms)
    this.intervalIdTavoli = setInterval(()=>{
      this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
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
      
      // Get input field value
      this.inputData = (<HTMLInputElement>event.target).value

      // Insert new element Tavolo
      this.django.doCreate(this.dataService.urls.tavoli,{"nome": this.inputData}).subscribe((response: any) => {
        console.log(JSON.stringify(response));
        
        // Update Tavoli
        this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
          this.tavoli = data;
        });

      });

    }
  }

  onTavoloClick(event: any){
   console.log(JSON.stringify(event))
   this.sendTavoloData.emit(JSON.stringify(event))
  }

    //remove(element: any){this.commandaComponent.remove(element)}
    remove(element: any){
      
      console.log("rimuovo tavolo:" + this.dataService.urls.tavoli + element.id + "/")

      this.django.deleteData(this.dataService.urls.tavoli + element.id + "/").subscribe((data: any) =>{
         
        
        // Update Tavoli
        this.django.getData(this.dataService.urls.tavoli).subscribe((data: any) =>{
          this.tavoli = data;
        });
        
      });
      
    }


  toLogin(data: any){
      console.log("toLogin")
      this.ToLogin.emit(true)
      clearInterval(this.intervalIdTavoli);
  }

 

}
