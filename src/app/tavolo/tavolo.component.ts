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
  
 
  url_tavoli: string = 'http://localhost:8000/commanda/tavoli/';
  url_products: string = 'http://localhost:8000/commanda/products/';

  //@Input() url_tavoli: any;
  //@Input() url_products: any; 
  
  products: any;
  tavoli: any;

  intervalIdTavoli: undefined | ReturnType<typeof setTimeout>; 
  
  inputData: any;
  
  // da fare: se ci sono molti tavoli il bottone su deve spostare più in basso
  //molti_tav = false

  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService){}
  
  ngOnInit(): void {
   

    // Get Tavoli
    console.log("ngOndTavoloInit");
    this.django.getData(this.url_tavoli).subscribe((data: any) =>{
      this.tavoli = data;
      console.log(data)
    });
    
    // Update Tavoli - freq (ms)
    this.intervalIdTavoli = setInterval(()=>{
      this.django.getData(this.url_tavoli).subscribe((data: any) =>{
        if(!this.genericService.arraysAreEqual(data,this.tavoli)){
          this.tavoli = data;
          console.log(this.tavoli);
        }
        
      });
    }, this.freq);
    
    // Get Products
    this.django.getData(this.url_products).subscribe((data: any) =>{
      this.products = data;
      console.log(this.products);
      //send poducts to data service as json file
      this.dataService.updateData(JSON.stringify(this.products));
    });
  }


  onEnterKeyPressed(event: KeyboardEvent): void {
    
    // Check if the pressed key is "Enter"
    if (event.key === 'Enter') {
      
      // Get input field value
      this.inputData = (<HTMLInputElement>event.target).value

      // Insert new element Tavolo
      this.django.doCreate(this.url_tavoli,{"nome": this.inputData}).subscribe((response: any) => {
        console.log(JSON.stringify(response));
        
        // Update Tavoli
        this.django.getData(this.url_tavoli).subscribe((data: any) =>{
          this.tavoli = data;
        });

      });

    }
  }

  onTavoloClick(event: any){
   console.log(JSON.stringify(event))
   this.sendTavoloData.emit(JSON.stringify(event))
  }

  
  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    //console.log("ngAfterTavoloContentInit");
  }
  ngAfterContentChecked(): void {
    //Called after every check of the component's or directive's content.
    //Add 'implements AfterContentChecked' to the class.
    //console.log("ngAfterContentChecked");
  }

  ngDoCheck(): void {
    //Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    //Add 'implements DoCheck' to the class.
    //console.log("ngDoCheck");
    
  }

  ngOnDestroy(): void {
    console.log("ngOnTavoloDestroy");
    clearInterval(this.intervalIdTavoli);
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //console.log("ngAfterViewInit");
  }

 

}
