import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';

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
  
  ordiniVisible: boolean | undefined;
  products: Product[] = [];
  commanda: Commanda[] = [];
  commanda_local: Commanda[] = [];
  selected_commanda: Commanda[] = [];
  filtered_products: Product[] = [];
  selected_product: Product[] = [];
  numericValue: number = 1

  intervalIdOrdinazioni: undefined | ReturnType<typeof setTimeout>;
 
  url_ordinazione: string = "http://localhost:8000/commanda/commande/tavolo/"
  url_commande: string = 'http://localhost:8000/commanda/commande/';

  constructor(private django: DjangoService, private dataService: DataService){

    // Acquisico i prodotti dal servizio dati 
    this.dataService.sharedData$.subscribe((data: any) => {
      this.products = JSON.parse(data)
      console.log(this.products) 
    });

  }
  
  dataSource = [];
  displayedColumns: string[] = ['product', 'quantity', 'production_status'];

  
  ngOnInit(): void {
    // Identifico il tavolo
    console.log(this.dataTavolo)

    this.ordiniVisible = true

    // Acquisico Ordinazioni dal servizio django - freq (ms)
    this.intervalIdOrdinazioni = setInterval(()=>{
      this.django.getData(this.url_ordinazione + this.dataTavolo.id + "/").subscribe((data: any) =>{
        this.dataSource = data;
        this.commanda = data;
        //console.log(this.dataSource);
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

    let inputElement = event.target as HTMLInputElement;
    
    // Now you can use inputElement as an HTMLElement
    console.log('Input value:' + inputElement.value.length, inputElement.value);

    if (inputElement.value.length >= 2){
      this.filtered_products = this.products.filter((product: Product) => product.title.toLowerCase().includes(inputElement.value.toLowerCase()))
      console.log(this.filtered_products) 
    }
    else{
      this.filtered_products = []
    }
    return this.filtered_products
  }

  checkInput(products: any, str: string) {
    return products.title.includes(str)
  }
  
  
  onSelectedProductEnter(event: any){
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

            this.django.getData(this.url_ordinazione + this.dataTavolo.id + "/").subscribe((data: any) =>{
              this.dataSource = data;
              console.log(this.dataSource);
            });
            
    });
  }

  modificaProdotto(product_to_mod: any){
    this.ordiniVisible = false
    this.selected_commanda = []
    this.selected_commanda.push(product_to_mod)
    console.log(product_to_mod)
    console.log(this.selected_commanda)
  }

  closeModificaProdotto(){
    this.ordiniVisible = true
  }

  remove(element: any){
    this.django.deleteData(this.url_commande + element.id + "/").subscribe((data: any) =>{

      this.django.getData(this.url_ordinazione + this.dataTavolo.id + "/").subscribe((data: any) =>{
        this.dataSource = data;
        console.log(this.dataSource);
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

      this.django.getData(this.url_ordinazione + this.dataTavolo.id + "/").subscribe((data: any) =>{
        this.dataSource = data;
        console.log(this.dataSource);
        this.ordiniVisible = true
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
  product: number;
  product_title: string;
  production_status: string;
  quantity: number;
  tavolo: number;
  note: string;
}


