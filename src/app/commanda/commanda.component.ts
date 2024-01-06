import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { GenericService } from '../servizi/generic.service';

//import { Product } from './product.interface.ts'; 

@Component({
  selector: 'app-commanda',
  templateUrl: './commanda.component.html',
  styleUrl: './commanda.component.css'
})



export class CommandaComponent {
  @Input() freq: any;

  @Input() dataTavolo: any;
  @Output() ToTavoli = new EventEmitter<boolean>();
  
  //mostra e nasconde gli ordini durante la modifica delle info dei prodotti selezionati
  ordiniVisible: boolean | undefined;

  products: Product[] = [];
  commanda: Commanda[] = [];
  selected_commanda: Commanda[] = [];
  filtered_products: Product[] = [];
  selected_product: Product[] = [];

  //mostra e nasconde il dati durante la ricerca prodotti
  cercaVisible: boolean = false
  
  intervalIdOrdinazioni: undefined | ReturnType<typeof setTimeout>;
  
  url_main: string = 'http://localhost:8000/commanda/';
  url_ordinazione: string = "http://localhost:8000/commanda/commande/tavolo/"
  url_commande: string = 'http://localhost:8000/commanda/commande/';
  url_tavolo_no_status: string;


  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService){

    // Acquisico i prodotti dal servizio dati 
    this.dataService.sharedData$.subscribe((data: any) => {
      this.products = JSON.parse(data)
      console.log(this.products) 
    });

    
    this.url_tavolo_no_status = "";
  }
  
  ngOnInit(): void {

    this.ordiniVisible = true

    // Identifico il tavolo
    console.log(this.dataTavolo)

    //acquisico tutte gli elementi commanda eccetto quelli in stato D = 'Servito'
    this.url_tavolo_no_status = this.url_main + "commanda_tavolo_nostatus/?tavolo=" + this.dataTavolo.id + "&production_status=D";
    
    // Acquisico Ordinazioni dal servizio django - freq (ms)
    this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
      this.commanda = data;
    });
    
   
    
    this.intervalIdOrdinazioni = setInterval(()=>{

    
      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{

        if(!this.genericService.arraysAreEqual(data, this.commanda)){
          console.log(this.commanda);
          this.commanda = data;
          console.log("aggiornato commanda")
        }

      });
    }, this.freq);

  }

  ngOnDestroy(): void {
    console.log("ngOnTavoloDestroy");
    clearInterval(this.intervalIdOrdinazioni);
  }

  toTavoli(event: any){
    console.log("toTavoli")
    this.ToTavoli.emit(true)
  }

  cercaProdotto(event:any): any{
    this.cercaVisible = true
    
    let inputElement = event.target as HTMLInputElement;
    console.log('Input value:' + inputElement.value.length, inputElement.value);

    let arr_input = inputElement.value.split(' ')
    this.filtered_products = this.products
    let count = 0
    arr_input.forEach(searchStr => {
      if (searchStr.length >= 2){
        count = count + 1
        this.filtered_products = this.filtered_products.filter((product: Product) => product.title.toLowerCase().includes(searchStr.toLowerCase()))
        console.log(this.filtered_products) 
      }
    });
    
    if(count == 0){this.filtered_products = []}

    return this.filtered_products
  }

  checkInput(products: any, str: string) {
    return products.title.includes(str)
  }
  
  
  onSelectedProductEnter(event: any){
    console.log(event)
    this.selected_product = this.cercaProdotto(event);
    if(this.selected_product.length == 1){
       console.log("ok un solo prodotto rimasto: " + this.selected_product[0].title)
       this.add_product_pending(this.selected_product[0])
    }

  }

  onSelectedProductChip(sel_product: any){
    console.log("ok selezionato prodotto: " + sel_product.title)
    this.add_product_pending(sel_product)
  }

  add_product_pending(product_to_add: any){
    let body =   {
      "tavolo": this.dataTavolo.id,
      "product": product_to_add.id,
      "quantity": 1
    }
    // Insert new product commanda
    this.django.doCreate(this.url_commande, body).subscribe((response: any) => {
            console.log(JSON.stringify(response));
            this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
              this.commanda = data;
              console.log(data);
              
              const myInputField = document.getElementById('searchInputField') as HTMLInputElement;
              // Set the value to null
              myInputField.value = "";
              this.cercaVisible = false

            });
    });
  }

  modificaElementoCommanda(element_to_mod: any){
    if(element_to_mod.production_status == 'A'){
      this.ordiniVisible = false
      this.selected_commanda = []
      this.selected_commanda.push(element_to_mod)
      console.log(element_to_mod)
      console.log(this.selected_commanda)
    }
  }

  closeModificaElementoCommanda(){
    this.ordiniVisible = true
  }

  remove(element: any){
    this.django.deleteData(this.url_commande + element.id + "/").subscribe((data: any) =>{

      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
      });

    });
  }

  upDateRadio(event: any){
    this.selected_commanda[0].quantity = event.value
    console.log(event.value)
  }
  
  aggiornaElementoCommanda(data: any){

    var body =
    {
      "id": data.id,
      "tavolo": data.tavolo,
      "product": data.product,
      "product_title": data.product_title,
      "quantity": data.quantity,
      "production_status": data.production_status,
      "note": data.note
    }

    this.django.doModify(this.url_commande + data.id + "/", body).subscribe((data: any) =>{

      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
        this.ordiniVisible = true
      });

    });

  }

  change_production_status(data: any, status: any){

    var body =
    {
      "id": data.id,
      "tavolo": data.tavolo,
      "product": data.product,
      "product_title": data.product_title,
      "product_collection_id": data.product_collection_id,
      "quantity": data.quantity,
      "production_status": status,
      "note": data.note
    }

    this.django.doModify(this.url_commande + data.id + "/", body).subscribe((data: any) =>{
      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
      });
    });

  }



}

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
  tavolo: number;
  product: number;
  product_title: string;
  product_collection_id: number;
  quantity: number;
  production_status: string;
  note: string;
}
