import { Component, EventEmitter, Input, Output, ChangeDetectorRef, Renderer2, ElementRef, ComponentFactoryResolver } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService, Product, Commanda } from '../servizi/data.service';
import { GenericService } from '../servizi/generic.service';
import { AnimateTimings } from '@angular/animations';


//import { Product } from './product.interface.ts'; 


@Component({
  selector: 'app-commanda',
  templateUrl: './commanda.component.html',
  styleUrl: './commanda.component.css'
})


export class CommandaComponent {
  
  selectedTable: number = 0;
  numeroCoperti: number = 0;
  fullData: any;

  selected_commanda!: Commanda[];
  selected_commanda_element!: Commanda;

  commanda: any;
  elementiConto: any;
  
  nomeTavolo: string = '';

  ordiniVisible: boolean = true;

  quantity: number = 0;
  selectedRadioValue: number = 0;
  textareaContent: string = ''; 
  

  contoVisible: boolean | undefined
  conto_tot: number | undefined
  conto_contine_altro: number = 0;
  coperti: number | undefined
  
  
  filtered_products: Product[] = [];
  selected_product: Product[] = [];

 
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
  title_coperti: string = "Coperti"
  isViewInitialized: boolean | undefined;
  
  
  tavoli: any;
  bellSound: HTMLAudioElement;
  commandeData: any;
  products: any;
  overallTotalPriceString: string | undefined;



  constructor(private django: DjangoService, private dataService: DataService, private genericService: GenericService, 
    private cdr: ChangeDetectorRef, private renderer: Renderer2, private elementRef: ElementRef){
    this.bellSound = new Audio();
    this.bellSound.src = 'assets/bell-sound-1.wav';
  }
  
  ngOnInit(): void {

    // Acquisico i prodotti
    this.dataService.productsData$.subscribe(data => {
      
        // data potrebbe essere null se non è stata completata prima della risposta del server
        if(data !== null){
   
            this.products = data; 
            console.log('Prodotti');
            console.log(this.products)

            // Mosta ordini
            this.ordiniVisible = true;
            
            // Identifico il tavolo selezionato
            this.dataService.getSelectedTable((selectedTableID, numeroCoperti) => {

              this.selectedTable = selectedTableID;
              this.numeroCoperti = numeroCoperti;

              console.log('Tavolo selezionato: ' + this.selectedTable)
              console.log('Numero Coperti: ' + this.numeroCoperti)
              
              // Seleziono un array da tabella identificato dal tavolo selezionato
              // Se non ci sono ordinazioni comunque ritorna un array di un solo elemento indicate 
              // il i dati del tavolo e gl'altri campi nulli
              this.dataService.fullData$.subscribe(data => {
                this.commanda = this.updateCommandaData(data,  this.selectedTable);
                console.log(this.commanda);
              });

            });



        }
        else{console.log("Errore. Non sono riuscito ad acquisire i prodotti");}
    
    
    });
    
  
  }

  // Update data 
  updateCommandaData(data: any[], selectedTableID: number){
    let commanda: any;

    //  Filtro i dati per il tavolo selezionato 
    this.selected_commanda = data.filter((item: { id: number; }) => item.id === selectedTableID);
    
    console.log(this.selected_commanda.length);
    // Identifico il nome del tavolo
    // Controllo se tutti gli elementi hanno lo stesso nome del tavolo
    const sameNome = this.selected_commanda.every((item, index, array) => item.nome === array[0].nome);

    if (sameNome && this.selected_commanda.length > 0) {
        // Extract the "nome" value since it's the same for all elements
        const nomeValue = this.selected_commanda[0].nome;
        this.nomeTavolo = nomeValue;
    } else {console.log("The 'nome' values are not the same for all elements or there no elements.");}

    // Elimino gli con commanda__id = null (solo il tavolo senza nessun ordine) - - che non voglio far vedere
    commanda = this.selected_commanda.filter((item: { commanda__id: number | undefined; }) => item.commanda__id !== null); 

    // ordina gli elementi per id commanda desc 
    commanda.sort((a: { commanda__id: number }, b: { commanda__id: number }) => -b.commanda__id + a.commanda__id);

    return commanda;

  }
  
  // Funzione che cerca i prodotti quando l'utente scrive nel campo testuale
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

    if(count == 0){this.filtered_products = []}

    return [this.filtered_products, arr_input[arr_input.length-1]]
  }

  onSelectedProductEnter(event: any){

    (<HTMLInputElement>event.target).blur();
    console.log(event)
    
    this.selected_product = this.cercaProdotto(event)[0];
    if(this.selected_product.length == 1){
       console.log("ok un solo prodotto rimasto: " + this.selected_product[0].title)
       console.log("ultima stinga di ricerca è: " + this.cercaProdotto(event)[1])
       this.onSelectedProductToAdd(this.selected_product[0])
    }

  }
  
  onSelectedProductToAdd(sel_product: any){

    let body =   {
      "tavolo": this.selectedTable,
      "product": sel_product.id,
      "quantity": 1
    }

    this.django.doCreate(this.dataService.urls.commande, body).subscribe((response: any) => {
      console.log(JSON.stringify(response));
      
      // Cancello testo prodotto cercato
      const myInputField = document.getElementById('searchInputField') as HTMLInputElement;
      myInputField.value = "";
      
      // Nascondo prodotti crecati
      this.cercaVisible = false
      
      // Aggiorno commanda - se hasSpecialTitle apro subito l'interfaccia per editare la nota
      if(this.hasSpecialTitle(response.product_title)){
        console.log("tipo altro")
        this.dataService.fetchCommandeRetrunData().subscribe((data: any) => {
          this.commanda = data;
          console.log(this.commanda);
          console.log(this.getSelectedCommandaByID(response.id));
          this.modificaElementoCommanda(this.getSelectedCommandaByID(response.id));
        });
      }
      else{this.dataService.fetchCommandeOnce();}
    });

  }

  hasSpecialTitle(str: string){
    if (str === "altro Bar" || str === "altro Cucina" || str === "altro Pizzeria") {return true;}
    else{return false;}
  }
  
  getSelectedCommandaByID(id: number){
    return this.commanda.filter((item: { commanda__id: any; }) => item.commanda__id === id)[0];
  }

  modificaElementoCommanda(element_to_mod: any){
    console.log('Elemento commanda selezionato:');
    console.log(element_to_mod);
    this.selected_commanda_element = element_to_mod;
    if(this.selected_commanda_element.commanda__production_status == 'A'){
      console.log("mosta per editare elemento commnda");
      this.ordiniVisible = false;
    } 
  }

  closeModificaElementoCommanda(){
    // Se l'elento è di tipo alto occorre che il campo note non sia vuoto - altrimenti non si capisce cosa è
    if(this.check_TipoAltro_NotaLen(this.selected_commanda_element)){
      window.alert("Inserire info nel campo nota");
    }
    else{
      this.ordiniVisible = true;
    }
  }

  remove(element: any){
    console.log(this.dataService.urls.commande + element.commanda__id + "/")
    this.django.deleteData(this.dataService.urls.commande + element.commanda__id + "/").subscribe((data: any) =>{
      // Aggiorno i dati della commanda sul servizio che poi sono aggiornati in questo componente
      this.dataService.fetchCommandeOnce();
    });
  }

  onEnterPressed(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {this.aggiornaElementoCommanda(); }
  }
  
  aggiornaElementoCommanda(){
    
    // Se l'elento è di tipo alto occorre che il campo note non sia vuoto - altrimenti non si capisce cosa è
    if(this.check_TipoAltro_NotaLen(this.selected_commanda_element)){
      window.alert("Inserire info nel campo nota");
    }
    else{
      var body =
      {
        "quantity": this.selected_commanda_element.commanda__quantity,
        "note": this.selected_commanda_element.commanda__note
      }
  
      this.django.doModify(this.dataService.urls.commande + this.selected_commanda_element.commanda__id + "/", body).subscribe((data: any) =>{
        this.dataService.fetchCommandeOnce();
        this.ordiniVisible = true
      });
    }
  
  }
  
  // Se l'elento è di tipo alto occorre che il campo note non sia vuoto - altrimenti non si capisce cosa è
  check_TipoAltro_NotaLen(element: any){
    if( (element.commanda__note === null || element.commanda__note.length == 0)
      && this.hasSpecialTitle(this.getSelectedCommandaByID(element.commanda__id).commanda__product__title)){
      return true;
    }
    else{
      return false;
    }
  }

  change_production_status(data: any, status: any){
    
    var body ={"production_status": status}
    this.django.doModify(this.dataService.urls.commande + data.commanda__id + "/", body).subscribe((data: any) =>{
  
      this.dataService.fetchCommandeOnce(); 

      // Subscribing to fullData$ to execute code after the fetch completes
      this.dataService.fullData$.subscribe((data: any) => {
          // Your code to execute after the fetch completes
          if (status === 'D' && this.contoVisible) {
              this.conto('no-toggle');
          }
      });

    });

  }

  conto(str: any){
    
    //console.log(str);
    if(str == 'toggle'){this.contoVisible = !this.contoVisible}

    const productAggregation: { [key: number]: ProductAggregation } = {};

    const aggregatedDataArray: ProductAggregation[] = [{
      productTitle: 'Coperto',
      totalQuantity: this.numeroCoperti,
      totalPrice: (this.numeroCoperti * this.prezzo_coperto).toFixed(2), // Ensure the price is properly formatted
      commanda__note: null
    }];

    //console.log(this.prezzo_coperto);
    //console.log(this.commanda.coperti);

    let hasSpecialTitle = false;

    this.commanda.forEach((elem: { commanda__production_status: string; commanda__product_id: any; commanda__product__title: any; commanda__product__price: string; commanda__quantity: any; commanda__note: null; }) => {
      hasSpecialTitle = false;

      if (elem.commanda__production_status === 'D') {
        const productId = elem.commanda__product_id;
        const productTitle = elem.commanda__product__title;
        const productPrice = parseFloat(elem.commanda__product__price);
        const productQuantity = elem.commanda__quantity;

        hasSpecialTitle = this.hasSpecialTitle(productTitle);


        console.log(elem.commanda__note);
        console.log(typeof elem.commanda__note);
        // If there's a note, treat it as a separate entry
        if (typeof elem.commanda__note === 'string' && (elem.commanda__note as string).length > 0) {
          
          aggregatedDataArray.push({
            productTitle: `${productTitle} (${elem.commanda__note})`,
            totalQuantity: productQuantity,
            totalPrice: hasSpecialTitle ? 'X' : (productPrice * productQuantity).toFixed(2),
            commanda__note: elem.commanda__note
          });
        } 
        else{

          if (!productAggregation[productId]) {
            productAggregation[productId] = {
            productTitle: productTitle,
            totalQuantity: 0,
            totalPrice: (productPrice * productQuantity).toFixed(2),
            commanda__note: null
            };
          }

          productAggregation[productId].totalQuantity += productQuantity;

          if (!hasSpecialTitle){
            productAggregation[productId].totalPrice = (Number(productPrice * productAggregation[productId].totalQuantity).toFixed(2));
          }
          else{
            productAggregation[productId].totalPrice = 'X';
          }

        }



      }
    });

    // Convert the aggregation object to an array for easy display
    Object.values(productAggregation).forEach(item => aggregatedDataArray.push(item));

    // Calculate the overall total price, excluding special titles
    let overallTotalPrice = aggregatedDataArray.reduce((acc, item) => {
      if (item.totalPrice !== 'X') {
        return acc + parseFloat(item.totalPrice as string);
      }
      return acc;
    }, 0);


    

    this.overallTotalPriceString = overallTotalPrice.toFixed(2);

    const hasX = aggregatedDataArray.some(item => item.totalPrice === 'X');
    if (hasX) {this.overallTotalPriceString += " + X";}


    this.elementiConto = aggregatedDataArray;

    //console.log(this.elementiConto);
    //console.log(this.overallTotalPriceString);

  }

  toggleContoVisible(str: string) {
    if (str === 'toggle') {
      this.contoVisible = !this.contoVisible;
    }
  }

  setPage(data: string){this.dataService.setPage(data)}

}


export interface GroupedOrders {
  [tavoloId: number]: { tavoloId: number; tavolo_nome: string, status_AC_Count: number, status_C_Count: number};
}

export interface ProductAggregation {
  productTitle: string;
  totalQuantity: number;
  totalPrice: string;
  commanda__note: string | null;
}