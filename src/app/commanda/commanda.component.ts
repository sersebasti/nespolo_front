import { Component, EventEmitter, Input, Output, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
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
  ordiniVisible: boolean | undefined
  contoVisible: boolean | undefined
  conto_tot: number | undefined
  coperti: number | undefined 
  
  products: Product[] = [];
  commanda: Commanda[] = [];

  selected_commanda: Commanda[] = [];
  filtered_products: Product[] = [];
  selected_product: Product[] = [];

  elementiConto: Conto[] = [];
  displayedColumns: string[] = ['product__title', 'total_quantity', 'total_price'];


  //mostra e nasconde il dati durante la ricerca prodotti
  cercaVisible: boolean = false
  
  intervalIdOrdinazioni: undefined | ReturnType<typeof setTimeout>;
  
  url_main: string | undefined
  url_products: string | undefined
  url_commande: string | undefined
  url_tavolo: string | undefined
  url_ordinazione: string | undefined
  url_tavolo_no_status: string = '';

  prezzo_coperto: number = 1.5;
  numero_coperti: number = 1;
  title_coperti: string = "Coperti"
  isViewInitialized: boolean | undefined;

  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService, 
    private cdr: ChangeDetectorRef, private renderer: Renderer2, private elementRef: ElementRef){

    // Acquisico i prodotti dal servizio dati 
    this.dataService.sharedData$.subscribe((data: any) => {
      this.products = JSON.parse(data)
      console.log(this.products) 
    });
    

  }
  
  ngOnInit(): void {
    
    this.url_main  = this.dataService.urls.main

    this.ordiniVisible = true
    this.contoVisible = false

    // Identifico il tavolo
    console.log(this.dataTavolo)

    //acquisico tutte gli elementi commanda eccetto quelli in stato D = 'Servito'
    this.url_tavolo_no_status = this.url_main + "commanda_tavolo_nostatus/?tavolo=" + this.dataTavolo.id + "&production_status=D";

    
    
    // Acquisico Ordinazioni dal servizio django 
    this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
      console.log(data)
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
    })
    
    // Detect changes after the part of the page has been recreated
    this.cdr.detectChanges();

    // Perform your action after the part of the page has been recreated
    this.yourActionAfterRecreation();

    if(count == 0){this.filtered_products = []}

    return [this.filtered_products, arr_input[arr_input.length-1]]
  }

  yourActionAfterRecreation(): void {
    // Your action after the part of the page has been recreated
    const prodotto_filtrati = document.getElementById('prodotto_filtrati');
    const cerca_prodotto = this.elementRef.nativeElement.querySelector('#cerca_prodotto');
    

    if (prodotto_filtrati) {
      const height = prodotto_filtrati.offsetHeight;
      console.log('prodotto_filtrati:', height);
    } else {
      console.error('prodotto_filtrati not found');
    }
    /*
    if (cerca_prodotto && prodotto_filtrati) {
      // Get the bounding rectangle of the element
      const rect = cerca_prodotto.getBoundingClientRect();
      const height = prodotto_filtrati.offsetHeight;
      
      // Get the top position of the element relative to the document
      const topPosition = rect.top;

      console.log('Top position:', topPosition);

      let new_pos = topPosition - height;
      let new_pos_str = new_pos.toString() + 'px';
      
      this.renderer.setStyle(prodotto_filtrati, 'position', 'fixed');
      this.renderer.setStyle(prodotto_filtrati, 'top', new_pos_str);

    }
    /**/

  }

  ngAfterViewInit(): void {
    // This code will run after the component's view has been initialized
    this.isViewInitialized = true;
    this.onLoad();
  }

  onLoad(): void {
    if (this.isViewInitialized) {
      
      const element = document.getElementById('prodotto_filtrati');

      if (element) {
        const height = element.offsetHeight;
        console.log('Element height:', height);
      } else {
        console.error('Element not found');
      }


    }
  }

  checkInput(products: any, str: string) {
    return products.title.includes(str)
  }
  
  
  onSelectedProductEnter(event: any){

    (<HTMLInputElement>event.target).blur();
    console.log(event)
    
    this.selected_product = this.cercaProdotto(event)[0];
    if(this.selected_product.length == 1){
       console.log("ok un solo prodotto rimasto: " + this.selected_product[0].title)
       console.log("ultima stinga di ricerca è: " + this.cercaProdotto(event)[1])
       this.add_product_pending(this.selected_product[0], this.cercaProdotto(event)[1])
    }

  }

  onSelectedProductChip(sel_product: any){
    console.log("ok selezionato prodotto: " + sel_product.title)
    this.add_product_pending(sel_product, "1")
  }

  add_product_pending(product_to_add: any, last_str: string){
    

    let quantity = 1
    // se per ultimo ho digitato un numero inserico quel numoro di prodotti
    let parsedValue = parseInt(last_str, 10);
    if(!isNaN(parsedValue) && Number.isInteger(parsedValue) && parsedValue > 0){
       quantity = parsedValue
    }

    let body =   {
      "tavolo": this.dataTavolo.id,
      "product": product_to_add.id,
      "quantity": quantity
    }

    console.log(body);
    // Insert new product commanda
    this.django.doCreate(this.dataService.urls.commande, body).subscribe((response: any) => {
            console.log(JSON.stringify(response));
            
            this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
              this.commanda = data;
              console.log(data);
              
              const myInputField = document.getElementById('searchInputField') as HTMLInputElement;
              // Set the value to null
              myInputField.value = "";
              this.cercaVisible = false
               
              // Nel cao uno sceglie altro subito apre finestra per descrizione
              if (response.product_title == "altro Bar" || response.product_title == "altro Cucina" || response.product_title == "altro Pizzeria"){
                this.modificaElementoCommanda(response);
              }
           
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
    console.log('qui')
    console.log('qui' + this.dataService.urls.commande + element.id + "/")
    this.django.deleteData(this.dataService.urls.commande + element.id + "/").subscribe((data: any) =>{

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
  
  aggiornaElementoCommanda(){
    
    var body =
    {
      "id": this.selected_commanda[0].id,
      "tavolo": this.selected_commanda[0].tavolo,
      "product": this.selected_commanda[0].product,
      "product_title": this.selected_commanda[0].product_title,
      "quantity": this.selected_commanda[0].quantity,
      "production_status": this.selected_commanda[0].production_status,
      "note": this.selected_commanda[0].note
    }

    this.django.doModify(this.dataService.urls.commande +  this.selected_commanda[0].id + "/", body).subscribe((data: any) =>{

      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
        this.ordiniVisible = true
      });

    });

  }

  change_production_status(data: any, status: any){

    var body ={"production_status": status}

    this.django.doModify(this.dataService.urls.commande + data.id + "/", body).subscribe((data: any) =>{
      this.django.getData(this.url_tavolo_no_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
         if(status = 'D' && this.contoVisible){this.conto('no-toggle')}
      });
    });

  }

  conto(str: any){
    if(str == 'toggle'){this.contoVisible = !this.contoVisible}
    
    
    // Acquisico Coperti dal servizio django 
    this.url_tavolo = this.url_main + "tavoli/" + this.dataTavolo.id + "/";
    this.django.getData(this.url_tavolo).subscribe((data: any) =>{

      this.numero_coperti = data.coperti;
      
      var url_tavolo_status = this.url_main + "commanda_elementi_conto/?tavolo=" + this.dataTavolo.id
      this.django.getData(url_tavolo_status).subscribe((data: any) =>{
        this.elementiConto = data
        
        this.elementiConto.push({product__title: this.title_coperti, total_quantity:this.numero_coperti, total_price: (this.prezzo_coperto * this.numero_coperti).toString()})
        
        /*
        var total = 0
        
        this.elementiConto.forEach(element => {

          if(this.check_altro(element)){
            this.conto_tot = 0;
            break;
          }
          total = total  + parseFloat(element.total_price)
          console.log(parseFloat(element.total_price))
          console.log(this.check_altro(element))
        });
        this.conto_tot  = total
        */
        
        let total = 0;
        for (let i = 0; i < this.elementiConto.length; i++) {
          const element = this.elementiConto[i];
          if (this.check_altro(element)) {
            this.conto_tot = 0;
            total = 0;
            break; // exit the loop if condition is met
          }
          total += parseFloat(element.total_price);
          console.log(parseFloat(element.total_price));
          console.log(this.check_altro(element));
        }
        this.conto_tot = total;
  
        //this.conto_tot = parseInt(this.conto['tot_price'],10).reduce((sum, product) => sum + product.price, 0);
        console.log(data);
      });

    });

  }

  check_altro(elem: any){
    if (elem.product__title == "altro Bar" || elem.product__title == "altro Cucina" || elem.product__title == "altro Pizzeria"){
      return 1;
    }
    else{return 0;}
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
  product_price: number;
  product_collection_id: number;
  quantity: number;
  production_status: string;
  note: string;
}

export interface Conto{
  product__title: string;
  total_quantity: number;
  total_price: string;
}